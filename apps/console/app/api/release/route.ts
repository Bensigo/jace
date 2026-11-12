export const dynamic = "force-dynamic";

export function GET() {
  const commitSha = process.env.JACE_BUILD_COMMIT_SHA;
  if (!commitSha || !/^[a-f0-9]{40}$/.test(commitSha)) {
    return Response.json({ error: "Release version unavailable" }, {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }

  return Response.json({ commitSha }, { headers: { "cache-control": "no-store" } });
}
