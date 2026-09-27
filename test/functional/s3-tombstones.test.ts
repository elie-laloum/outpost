import assert from "node:assert/strict";
import { test } from "node:test";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { TransportConflict } from "../../src/domain/transport.ts";
import { s3Fixture } from "../fixtures/s3-transport-server.ts";

async function collect<T>(values: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const value of values) result.push(value);
  return result;
}

for (const empty of [false, true]) {
  test(`S3 tombstones fence stale removals and concurrent recreation (empty=${empty})`, async (t) => {
    const { transporter, objects, requests } = await s3Fixture(t, {
      deleteMode: "tombstone",
      ignoreDeleteCondition: true,
    });
    const payload = Buffer.from(empty ? "" : "original");
    const first = await transporter.write("entry", payload, {
      ifRevision: null,
    });
    const updated = await transporter.write("entry", payload, {
      ifRevision: first.revision,
    });
    assert.notEqual(first.revision, updated.revision);
    await assert.rejects(
      transporter.remove("entry", { ifRevision: first.revision }),
      TransportConflict,
    );
    assert.equal((await transporter.read("entry"))?.revision, updated.revision);
    await transporter.remove("entry", { ifRevision: updated.revision });
    assert.equal(await transporter.read("entry", { maxBytes: 0 }), undefined);
    assert.deepEqual(await collect(transporter.list()), []);
    assert.ok(objects.get("project/entry")?.tombstone);
    await assert.rejects(
      transporter.remove("entry", { ifRevision: updated.revision }),
      TransportConflict,
    );
    const recreations = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        transporter.write("entry", payload, { ifRevision: null }),
      ),
    );
    assert.equal(
      recreations.filter((entry) => entry.status === "fulfilled").length,
      1,
    );
    assert.ok(
      recreations
        .filter((entry) => entry.status === "rejected")
        .every((entry) => entry.reason instanceof TransportConflict),
    );
    const current = await transporter.read("entry");
    assert.ok(current);
    assert.deepEqual(Buffer.from(current.bytes), payload);
    assert.notEqual(current.revision, updated.revision);
    await assert.rejects(
      transporter.write("entry", payload, { ifRevision: updated.revision }),
      TransportConflict,
    );
    await assert.rejects(
      transporter.remove("entry", { ifRevision: updated.revision }),
      TransportConflict,
    );
    assert.equal(requests.includes("DELETE"), false);
  });
}

test("S3 tombstone listing crosses deleted-only pages and skips objects removed during listing", async (t) => {
  const { transporter, client, objects } = await s3Fixture(t, {
    deleteMode: "tombstone",
  });
  for (const key of ["a", "b", "c", "d", "e"]) {
    const value = await transporter.write(key, Buffer.from(key), {
      ifRevision: null,
    });
    if (key !== "e")
      await transporter.remove(key, { ifRevision: value.revision });
  }
  assert.deepEqual(
    (await collect(transporter.list())).map((entry) => entry.key),
    ["e"],
  );
  client.middlewareStack.add(
    (next) => async (args) => {
      if (
        args.input instanceof Object &&
        "Key" in args.input &&
        args.input.Key === "project/e"
      )
        objects.delete("project/e");
      return next(args);
    },
    { step: "initialize", name: "concurrentPhysicalRemoval" },
  );
  assert.deepEqual(await collect(transporter.list()), []);
});

test("S3 tombstone discovery propagates HEAD failures", async (t) => {
  const { transporter, client } = await s3Fixture(t, {
    deleteMode: "tombstone",
  });
  await transporter.write("entry", Buffer.from("value"), { ifRevision: null });
  client.middlewareStack.add(
    (next, context) => async (args) => {
      if (context.commandName === HeadObjectCommand.name)
        throw new Error("head unavailable");
      return next(args);
    },
    { step: "initialize", name: "unavailableHead" },
  );
  await assert.rejects(
    transporter.write("new", Buffer.from("value"), { ifRevision: null }),
    /head unavailable/,
  );
  await assert.rejects(collect(transporter.list()), /head unavailable/);
});
