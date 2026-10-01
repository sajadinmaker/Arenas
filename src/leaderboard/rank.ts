import type { RankedEntry, ScoreEntry } from "./schema.js";

export function sortScores(entries: readonly ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.createdAt < b.createdAt) return -1;
    if (a.createdAt > b.createdAt) return 1;
    return 0;
  });
}

export function assignRanks(sorted: readonly ScoreEntry[]): RankedEntry[] {
  const out: RankedEntry[] = [];
  let currentRank = 0;
  let prevScore: number | undefined = undefined;
  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    if (entry === undefined) continue;
    if (prevScore === undefined || entry.score !== prevScore) {
      currentRank = i + 1;
      prevScore = entry.score;
    }
    out.push({ ...entry, rank: currentRank });
  }
  return out;
}

export function rankScores(entries: readonly ScoreEntry[]): RankedEntry[] {
  return assignRanks(sortScores(entries));
}
