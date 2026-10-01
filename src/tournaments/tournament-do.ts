import { DurableObject } from "cloudflare:workers";
import { z } from "zod";
import {
  TournamentRecordSchema,
  type TournamentRecord,
} from "./schema.js";

export class TournamentDO extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(
        `CREATE TABLE IF NOT EXISTS tournaments (
          id TEXT PRIMARY KEY,
          record TEXT NOT NULL
        )`,
      );
    });
  }

  async register(raw: unknown): Promise<TournamentRecord> {
    const record = TournamentRecordSchema.parse(raw);
    this.ctx.storage.sql.exec(
      `INSERT OR REPLACE INTO tournaments (id, record) VALUES (?, ?)`,
      record.id,
      JSON.stringify(record),
    );
    return record;
  }

  async get(id: unknown): Promise<TournamentRecord | null> {
    const tid = z.string().min(1).parse(id);
    const row = this.ctx.storage.sql
      .exec(`SELECT record FROM tournaments WHERE id = ?`, tid)
      .toArray()[0];
    if (!row) return null;
    return TournamentRecordSchema.parse(JSON.parse(String(row.record)));
  }
}
