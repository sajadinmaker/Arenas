import { z } from "zod";
import { RankingsResponseSchema } from "../leaderboard/schema.js";
import {
  TournamentInputSchema,
  TournamentRecordSchema,
} from "../tournaments/schema.js";

export const CreateTournamentBodySchema = TournamentInputSchema;

export type CreateTournamentBody = z.infer<typeof CreateTournamentBodySchema>;

export const CreateTournamentResponseSchema = z.object({
  tournamentId: z.string().min(1),
  remotes: z.array(z.string().url()),
  secrets: z.array(
    z.object({
      name: z.string().min(1),
      plaintext: z.string().min(1),
    }),
  ),
});

export type CreateTournamentResponse = z.infer<
  typeof CreateTournamentResponseSchema
>;

export const TournamentResponseSchema = TournamentRecordSchema;

export type TournamentResponse = z.infer<typeof TournamentResponseSchema>;

export const TournamentRankingsSchema = RankingsResponseSchema.extend({
  tournamentId: z.string().min(1),
});

export type TournamentRankings = z.infer<typeof TournamentRankingsSchema>;
