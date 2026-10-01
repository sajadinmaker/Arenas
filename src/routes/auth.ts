// Secrets are set via `wrangler secret put`, not wrangler.jsonc, so the
// generated Env type does not know this binding. Extended here instead.
declare global {
  interface Env {
    OPERATOR_TOKEN?: string;
  }
}

export function parseBearer(header: string | null): string | null {
  if (!header) return null;
  const [scheme, ...rest] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || rest.length !== 1) return null;
  const token = rest[0];
  return token !== undefined && token.length > 0 ? token : null;
}

export function isAuthorized(
  header: string | null,
  expected: string | undefined,
): boolean {
  const provided = parseBearer(header);
  if (!provided || !expected || expected.length === 0) return false;
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
