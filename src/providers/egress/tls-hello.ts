import { egressRuntime } from "./egress.constants.ts";

export function tlsServerName(input: Buffer): string | undefined {
  if (input.length > egressRuntime.maxHelloBytes)
    throw new Error("TLS hello too large");
  const fragments: Buffer[] = [];
  let offset = 0;
  while (offset < input.length) {
    if (input.length - offset < 5) return undefined;
    if (input[offset] !== 22 || input[offset + 1] !== 3)
      throw new Error("TLS ClientHello required");
    const end = offset + 5 + input.readUInt16BE(offset + 3);
    if (end > input.length) return undefined;
    fragments.push(input.subarray(offset + 5, end));
    if (fragments.length > egressRuntime.maxHelloRecords)
      throw new Error("Too many TLS hello records");
    offset = end;
    const hello = Buffer.concat(fragments);
    if (hello.length < 4) continue;
    if (hello[0] !== 1) throw new Error("TLS ClientHello required");
    const length = hello.readUIntBE(1, 3) + 4;
    if (length > egressRuntime.maxHelloBytes)
      throw new Error("TLS hello too large");
    if (hello.length < length) continue;
    const data = hello.subarray(0, length);
    let cursor = 38;
    const take = (count: number) => {
      if (count < 0 || cursor + count > data.length)
        throw new Error("Malformed TLS hello");
      const part = data.subarray(cursor, cursor + count);
      cursor += count;
      return part;
    };
    take(take(1)[0]!);
    take(take(2).readUInt16BE());
    take(take(1)[0]!);
    const extensions = take(take(2).readUInt16BE());
    if (cursor !== data.length) throw new Error("Malformed TLS extensions");
    let position = 0;
    let name: string | undefined;
    while (position < extensions.length) {
      if (position + 4 > extensions.length)
        throw new Error("Malformed TLS extension");
      const kind = extensions.readUInt16BE(position);
      const size = extensions.readUInt16BE(position + 2);
      position += 4;
      if (position + size > extensions.length)
        throw new Error("Malformed TLS extension");
      const extension = extensions.subarray(position, position + size);
      position += size;
      if (kind !== 0) continue;
      if (name !== undefined) throw new Error("Duplicate TLS server name");
      if (
        size < 5 ||
        extension.readUInt16BE(0) !== size - 2 ||
        extension[2] !== 0 ||
        extension.readUInt16BE(3) !== size - 5
      )
        throw new Error("Malformed TLS server name");
      name = extension.subarray(5).toString("utf8");
      if (!/^[a-z0-9.-]+$/i.test(name))
        throw new Error("Invalid TLS server name");
    }
    if (name !== undefined) return name.toLowerCase();
    throw new Error("TLS server name required");
  }
  return undefined;
}
