import Link from "next/link";
import { notFound } from "next/navigation";
import { History } from "lucide-react";
import { readAcceptanceRecordSummaries } from "@agentrail/db-postgres";
import { getMembership, getSession } from "../../../../../lib/cached";
import { EmptyState } from "../../../../components/empty-state";
import { PageHeader } from "../../../../components/page-header";
import {
  AcceptanceRecordSummaryList,
  parseAcceptanceRecordRepoFilter,
} from "../components/acceptance-record-summary-list";

function parseIssueFilter(value: string | string[] | undefined): number | null | "invalid" {
  if (value === undefined) return null;
  if (Array.isArray(value)) return "invalid";
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{1,10}$/.test(trimmed)) return "invalid";
  const number = Number(trimmed);
  return number >= 1 && number <= 2147483647 ? number : "invalid";
}

export default async function ChangesPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ repo?: string | string[]; issue?: string | string[] }>;
}) {
  const { workspaceId } = await params;
  const { repo: rawRepo, issue: rawIssue } = await searchParams;

  const session = await getSession();
  if (!session?.user?.id) return notFound();
  const membership = await getMembership(session.user.id, workspaceId);
  if (!membership) return notFound();

  const repoFilter = parseAcceptanceRecordRepoFilter(rawRepo);
  const repo = repoFilter.kind === "valid" ? repoFilter.repo : null;
  const issue = parseIssueFilter(rawIssue);
  const invalid = repoFilter.kind === "invalid" ? "repository" : issue === "invalid" ? "issue" : null;
  const summaries = invalid ? null : await readAcceptanceRecordSummaries({
    workspaceId,
    repo,
    ...(typeof issue === "number" ? { issueNumber: issue } : {}),
  });
  const emptyDescription = typeof issue === "number"
    ? `No records for issue #${issue}${repo ? ` in ${repo}` : ""}.`
    : repo ? "No records for this repository." : "No records yet.";

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader title="Acceptance Records" />
      <form method="get" className="mb-5 flex max-w-xl flex-wrap items-end gap-2">
        <label className="flex min-w-36 flex-1 flex-col gap-1 text-xs text-[var(--gray-09)]">
          Repository
          <input
            name="repo"
            defaultValue={repo ?? ""}
            placeholder="owner/repository"
            className="h-9 rounded border border-[var(--gray-06)] bg-[var(--gray-01)] px-3 font-mono text-xs text-[var(--gray-12)] outline-none focus:border-[var(--blue-09)]"
          />
        </label>
        <label className="flex w-28 flex-col gap-1 text-xs text-[var(--gray-09)]">
          Issue number
          <input
            name="issue"
            inputMode="numeric"
            defaultValue={typeof issue === "number" ? String(issue) : ""}
            placeholder="41"
            maxLength={10}
            className="h-9 rounded border border-[var(--gray-06)] bg-[var(--gray-01)] px-3 font-mono text-xs text-[var(--gray-12)] outline-none focus:border-[var(--blue-09)]"
          />
        </label>
        <button
          type="submit"
          className="h-9 rounded border border-[var(--gray-06)] bg-[var(--gray-03)] px-3 text-xs font-medium text-[var(--gray-12)] hover:border-[var(--gray-08)]"
        >
          Filter
        </button>
        {(repo || issue !== null || invalid) && (
          <Link
            href={`/dashboard/${workspaceId}/changes`}
            className="h-9 rounded px-2 py-2 text-xs text-[var(--gray-09)] hover:text-[var(--gray-12)]"
          >
            Clear
          </Link>
        )}
      </form>

      {invalid ? (
        <EmptyState
          icon={History}
          title={`Invalid ${invalid} filter`}
          description={invalid === "repository"
            ? "Use owner/repository. No records were read."
            : "Enter one positive GitHub issue number. No records were read."}
        />
      ) : summaries?.records.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Acceptance Records"
          description={emptyDescription}
        />
      ) : (
        <AcceptanceRecordSummaryList
          workspaceId={workspaceId}
          records={summaries?.records ?? []}
        />
      )}
    </div>
  );
}
