import { z } from "zod";

export const TournamentInputSchema = z.object({
  taskMarkdown: z.string().min(1),
  testSuiteRef: z.string().min(1),
  agentCount: z.number().int().min(3).max(10),
});

export type TournamentInput = z.infer<typeof TournamentInputSchema>;

export const ForkRecordSchema = z.object({
  name: z.string().min(1),
  remote: z.string().url(),
  tokenId: z.string().min(1),
});

export type ForkRecord = z.infer<typeof ForkRecordSchema>;

export const TournamentRecordSchema = z.object({
  id: z.string().min(1),
  taskHash: z.string().min(1),
  testSuiteRef: z.string().min(1),
  forks: z.array(ForkRecordSchema).min(3).max(10),
  status: z.enum(["open", "judging", "closed"]),
  createdAt: z.string().datetime(),
});

export type TournamentRecord = z.infer<typeof TournamentRecordSchema>;
