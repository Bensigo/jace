import { readFile } from "node:fs/promises";

const expectedCommit = process.env.AGENTRAIL_RELEASE_COMMIT;
const target = process.env.AGENTRAIL_RELEASE_TARGET_URL;
const fixtureFile = process.env.JACE_RELEASE_FIXTURE_FILE;
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

async function verify() {
  if (!target || !fixtureFile || !/^[a-f0-9]{40}$/.test(expectedCommit ?? ""))
    throw new Error("Set the expected release, deployment URL, and JACE_RELEASE_FIXTURE_FILE");

  const base = new URL(target);
  const fixture = JSON.parse(await readFile(fixtureFile, "utf8"));
  if (
    base.href !== new URL(fixture.url).href ||
    base.pathname !== "/" || base.username || base.password || base.search || base.hash ||
    (base.protocol !== "https:" &&
      !(base.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname))) ||
    ![fixture.workspaceId, fixture.matchRecordId, fixture.otherRecordId].every(id =>
      typeof id === "string" && uuid.test(id)) ||
    fixture.matchRecordId === fixture.otherRecordId ||
    !Number.isInteger(fixture.issueNumber) || fixture.issueNumber < 1 || fixture.issueNumber > 2147483647 ||
    typeof fixture.cookie !== "string" || !/^[A-Za-z0-9_.-]+=[A-Za-z0-9_-]+$/.test(fixture.cookie)
  ) throw new Error("Fixture must identify this Console and two distinct Acceptance Records");

  async function request(path, headers) {
    const response = await fetch(new URL(path, base), {
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Jace release check returned HTTP ${response.status}`);
    return response;
  }
  async function readVersion() {
    const { commitSha } = await (await request("/api/release")).json();
    if (commitSha !== expectedCommit) throw new Error("Jace is serving a different commit");
    return commitSha;
  }

  const commitSha = await readVersion();
  const recordsPath = `/dashboard/${fixture.workspaceId}/changes`;
  const headers = { cookie: fixture.cookie };
  const match = `href="${recordsPath}/${fixture.matchRecordId}"`;
  const other = `href="${recordsPath}/${fixture.otherRecordId}"`;
  const all = await (await request(recordsPath, headers)).text();
  if (!all.includes(match) || !all.includes(other))
    throw new Error("Both fixture records must be visible before filtering");

  const filtered = await (await request(`${recordsPath}?issue=${fixture.issueNumber}`, headers)).text();
  if (!filtered.includes(match) || filtered.includes(other))
    throw new Error("The deployed issue filter did not return exactly the expected fixture match");

  await readVersion();
  console.log(JSON.stringify({ commitSha, url: base.href }));
}

try {
  await verify();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Jace release check failed");
  process.exitCode = 1;
}
