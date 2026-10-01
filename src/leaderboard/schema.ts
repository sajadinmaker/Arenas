import { z } from "zod";

export const ScoreEntrySchema = z.object({
  attemptId: z.string().min(1),
  repo: z.string().min(1),
  sha: z.string().min(1),
  buildPass: z.boolean(),
  testsPass: z.boolean(),
  benchmarkScore: z.number().finite(),
  score: z.number().finite(),
  createdAt: z.string().datetime(),
});

export type ScoreEntry = z.infer<typeof ScoreEntrySchema>;

export const RecordScoreInputSchema = ScoreEntrySchema.omit({
  createdAt: true,
}).extend({
  createdAt: z.string().datetime().optional(),
});

export type RecordScoreInput = z.infer<typeof RecordScoreInputSchema>;

export const RankedEntrySchema = ScoreEntrySchema.extend({
  rank: z.number().int().positive(),
});

export type RankedEntry = z.infer<typeof RankedEntrySchema>;

export const RankingsResponseSchema = z.object({
  rankings: z.array(RankedEntrySchema),
});

export type RankingsResponse = z.infer<typeof RankingsResponseSchema>;
