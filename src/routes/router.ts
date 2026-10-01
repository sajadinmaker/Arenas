export type MatchedRoute =
  | { name: "createTournament" }
  | { name: "getTournament"; tournamentId: string }
  | { name: "getRankings"; tournamentId: string };

const TOURNAMENT_RE = /^\/api\/tournaments\/([^/]+)\/?$/;
const RANKINGS_RE = /^\/api\/tournaments\/([^/]+)\/rankings\/?$/;

export function route(method: string, pathname: string): MatchedRoute | null {
  if (
    method === "POST" &&
    (pathname === "/api/tournaments" || pathname === "/api/tournaments/")
  ) {
    return { name: "createTournament" };
  }
  if (method === "GET") {
    const rankings = RANKINGS_RE.exec(pathname);
    if (rankings?.[1] !== undefined) {
      return {
        name: "getRankings",
        tournamentId: decodeURIComponent(rankings[1]),
      };
    }
    const tournament = TOURNAMENT_RE.exec(pathname);
    if (tournament?.[1] !== undefined) {
      return {
        name: "getTournament",
        tournamentId: decodeURIComponent(tournament[1]),
      };
    }
  }
  return null;
}
