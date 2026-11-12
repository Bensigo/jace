# Find Acceptance Records by GitHub issue

An operator who knows a GitHub issue number can currently narrow the list by repository, then has to scan the recent records. Add an exact issue-number filter to Acceptance Records, usable by itself or with the repository filter.

## First shippable slice

- The list accepts a positive GitHub issue number and returns matching workspace records before applying its result limit.
- Repository and issue filters compose. The URL preserves both filters for reloads and sharing with members.
- An invalid or repeated issue filter is rejected before querying. A valid filter with no records has a clear empty state.
- Preserve current membership checks and the existing custody-aware record projection.

Full-text search, filters on acceptance outcomes, and changes to approval or review custody are outside this slice.

## Verification

Test the page query, membership boundary, repeated and malformed values, no matches, and both filters together. On a running release, use an authenticated fixture workspace with two records for different GitHub issues. Request the filtered page, confirm the matching record is present and the other absent, and read the build SHA from the Console before recording the release.
