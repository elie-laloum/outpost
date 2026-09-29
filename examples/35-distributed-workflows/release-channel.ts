// The "external service" the workers publish to: a SQLite database.
// The receipt and the publication are written in the same transaction,
// so a replayed job finds the receipt and never publishes twice.

import { DatabaseSync } from "node:sqlite";

export function releaseChannel(file: string) {
  const db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE IF NOT EXISTS published (id INTEGER PRIMARY KEY, notes TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS receipts (key TEXT PRIMARY KEY, id INTEGER NOT NULL);
  `);

  return {
    publishOnce(key: string, notes: string) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const receipt = db
          .prepare("SELECT id FROM receipts WHERE key = ?")
          .get(key);
        if (receipt) {
          db.exec("COMMIT");
          return { id: Number(receipt.id), replayed: true };
        }

        const { lastInsertRowid } = db
          .prepare("INSERT INTO published (notes) VALUES (?)")
          .run(notes);
        db.prepare("INSERT INTO receipts (key, id) VALUES (?, ?)").run(
          key,
          lastInsertRowid,
        );
        db.exec("COMMIT");
        return { id: Number(lastInsertRowid), replayed: false };
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },

    count: () =>
      Number(db.prepare("SELECT count(*) AS n FROM published").get()!.n),
    close: () => db.close(),
  };
}
