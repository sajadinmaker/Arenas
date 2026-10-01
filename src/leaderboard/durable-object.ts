import { DurableObject } from "cloudflare:workers";
import {
  RankedEntrySchema,
  RecordScoreInputSchema,
  ScoreEntrySchema,
  type RankedEntry,
  type ScoreEntry,
} from "./schema.js";
import { rankScores } from "./rank.js";

export class LeaderboardDO extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(
        `CREATE TABLE IF NOT EXISTS scores (
          attemptId TEXT PRIMARY KEY,
          repo TEXT NOT NULL,
          sha TEXT NOT NULL,
          buildPass INTEGER NOT NULL,
          testsPass INTEGER NOT NULL,
          benchmarkScore REAL NOT NULL,
          score REAL NOT NULL,
          createdAt TEXT NOT NULL
        )`,
      );
    });
  }

  async recordScore(raw: unknown): Promise<ScoreEntry> {
    const input = RecordScoreInputSchema.parse(raw);
    const entry = ScoreEntrySchema.parse({
      ...input,
      createdAt: input.createdAt ?? new Date().toISOString(),
    });
    this.ctx.storage.sql.exec(
      `INSERT OR REPLACE INTO scores
        (attemptId, repo, sha, buildPass, testsPass, benchmarkScore, score, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      entry.attemptId,
      entry.repo,
      entry.sha,
      entry.buildPass ? 1 : 0,
      entry.testsPass ? 1 : 0,
      entry.benchmarkScore,
      entry.score,
      entry.createdAt,
    );
    return entry;
  }

  async getRankings(): Promise<RankedEntry[]> {
    const cursor = this.ctx.storage.sql.exec(
      `SELECT attemptId, repo, sha, buildPass, testsPass, benchmarkScore, score, createdAt FROM scores`,
    );
    const entries: ScoreEntry[] = [];
    for (const row of cursor.toArray()) {
      entries.push(
        ScoreEntrySchema.parse({
          attemptId: String(row.attemptId),
          repo: String(row.repo),
          sha: String(row.sha),
          buildPass: Number(row.buildPass) === 1,
          testsPass: Number(row.testsPass) === 1,
          benchmarkScore: Number(row.benchmarkScore),
          score: Number(row.score),
          createdAt: String(row.createdAt),
        }),
      );
    }
    const ranked = rankScores(entries);
    return RankedEntrySchema.array().parse(ranked);
  }
}
