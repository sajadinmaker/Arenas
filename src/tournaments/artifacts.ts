import { z } from "zod";

export const RepoInfoSchema = z.object({
  name: z.string().min(1),
  remote: z.string().url(),
});

export type RepoInfo = z.infer<typeof RepoInfoSchema>;

export const MintedTokenSchema = z.object({
  tokenId: z.string().min(1),
  plaintext: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type MintedToken = z.infer<typeof MintedTokenSchema>;

export interface ArtifactsClient {
  createRepo(name: string): Promise<RepoInfo>;
  fork(baseline: string, name: string): Promise<RepoInfo>;
  createToken(repo: string): Promise<MintedToken>;
}

const NAMESPACE = "arenas-default";

function remoteFor(name: string): string {
  return `https://artifacts.local/${NAMESPACE}/${name}.git`;
}

// In-memory stand-in for the Artifacts binding. Deterministic enough for
// tests, useless for real git. The real binding implements ArtifactsClient
// later and nothing above this layer changes.
export class StubArtifactsClient implements ArtifactsClient {
  private repos = new Set<string>();
  private tokens = 0;

  async createRepo(name: string): Promise<RepoInfo> {
    if (this.repos.has(name)) {
      throw new Error(`repo already exists: ${name}`);
    }
    this.repos.add(name);
    return RepoInfoSchema.parse({ name, remote: remoteFor(name) });
  }

  async fork(baseline: string, name: string): Promise<RepoInfo> {
    if (!this.repos.has(baseline)) {
      throw new Error(`unknown baseline: ${baseline}`);
    }
    return this.createRepo(name);
  }

  async createToken(repo: string): Promise<MintedToken> {
    if (!this.repos.has(repo)) {
      throw new Error(`unknown repo: ${repo}`);
    }
    this.tokens += 1;
    return MintedTokenSchema.parse({
      tokenId: `tok-${repo}-${this.tokens}`,
      plaintext: `stub-secret-${repo}-${this.tokens}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  }
}
