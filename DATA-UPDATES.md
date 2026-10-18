# League data updates — verified publishing workflow

**Status:** Ready for administrator-assisted manual updates. **Not an automatic live FA feed.**

Current league reference: https://fulltime.thefa.com/index.html?league=391033232

## Authorised source options

1. **Preferred (when the league approves):** ask the Thanet Sunday Football League administrator for authorised FA Full-Time embed snippets for league tables, recent results and upcoming fixtures. According to FA support, an authorised administrator signs in to Full-Time Admin → Media → Code Snippets. Team admins may also have access. We should agree what is permitted to publish and confirm the snippet works on GitHub Pages before using it. Official instructions: https://grassrootstechnology.thefa.com/support/solutions/articles/48001158072-embedding-league-tables-fixtures-tables-full-time-feeds-
2. **Immediately available:** manually compare the public, dated FA Full-Time league pages or an authorised league-supplied export, then enter only confirmed updates using the workflow below. Don't automate extraction or scrape Full-Time. Do not paste login details or session cookies into GitHub.
3. Do not claim an API or automated synchronisation; the FA has said it doesn't offer a general Full-Time API. Any future authorised integration must be separately approved.

## Run an update using a phone or computer

1. On GitHub, open [updates/pending.json](updates/pending.json), tap Edit, and fill in the batch details and verified changes.
2. Create a **unique** `batchId` (e.g. `update-20261025-round-five`), `verifiedOn` in `YYYY-MM-DD`, `verifiedBy` (the person who checked it), `notes` explaining which source items were verified, and the official `sourceUrl`. Leave `sourceMethod` set to `manual-review` unless the league actually supplied an authorised administrator export.
3. Edit only the relevant sections: `matches` can contain individual updated fixtures/results; `standings` must contain a **complete official division table** if you are updating that table. Never guess a missing result, kick-off, venue, second-division entry or deduction.
4. Commit the **pending draft** to GitHub. This does not update the live tables or results.
5. Open GitHub → **Actions** → **Verified league data update** → **Run workflow** → select **preview**. View the job log. Errors prevent publication. Read the source, number of changed records and verification date.
6. After checking the source again, run the workflow with **publish** and enter exactly **PUBLISH** in the confirmation field. The workflow validates the update again, runs the league/club/match regression tests and only then commits changes to `data/league-data.js` plus the audit log.
7. Give GitHub Pages time to redeploy. Check the homepage, relevant table, fixtures/results, one club profile and one match page. Confirm labels clearly state they're saved snapshots.
8. Before your next update, edit `pending.json` with a **new batchId**. Old batch IDs are blocked by `data/update-history.json`.

**Important:** If the Actions page is disabled or the publish job cannot push because of repository permissions or branch protection, no update should be forced. Review repository Actions / workflow permissions with the repo owner and use a reviewed manual commit only if necessary.

## Safe update structure

Use the `pending.json` object with this schema (fictional values below are **examples only**, do not paste into live data without verification):

```json
{
  "batchId": "update-20261025-round-five",
  "verifiedOn": "2026-10-25",
  "verifiedBy": "League data editor — checked against FA Full-Time",
  "sourceUrl": "https://fulltime.thefa.com/index.html?league=391033232",
  "sourceMethod": "manual-review",
  "notes": "Reviewed the official First Division results and latest match details. This example is not confirmed.",
  "standings": {},
  "matches": [
    {
      "id": "fx-001",
      "date": "2026-10-25",
      "homeId": "afc-manston",
      "awayId": "shrimpos-fc",
      "competition": "league",
      "division": "first",
      "competitionId": "league-first",
      "status": "final",
      "homeScore": 2,
      "awayScore": 1
    }
  ]
}
```

The fictional score **must not be published** unless it is genuinely verified.

Cup fixtures or results also require a valid `competitionId` from `data/league-data.js`. Historical 2026/27 cup names still marked pending must **not** receive new match assignments until the exact competition name and eligibility are confirmed. The saved County Cup matches have the temporary `cup-unassigned` identifier; update them to a specific verified cup only once each tie is individually checked. See [CUP-COMPETITIONS.md](CUP-COMPETITIONS.md). To update an already listed match, use its **existing** match ID. Keeping the same ID preserves all match links. New matches require a unique stable ID such as `m-20261101-club-a-club-b`; their `homeId` and `awayId` must already exist in `data/league-data.js`. For future fixtures use `"status":"scheduled"` and omit `homeScore` and `awayScore`. Optional `kickoff` must be `HH:MM`; `venue` must be verified. If a club isn't registered yet, add and confirm it in the canonical club registry first; never silently substitute a similar name.

**Table updates:** supplying `standings.first` or `standings.second` replaces that entire division with its officially verified rows. Each row uses `clubId`, `played`, `won`, `drawn`, `lost`, `goalsFor`, `goalsAgainst`, `points`. It must cover all clubs currently assigned to that division; this prevents partial tables from being misrepresented as complete. Points deductions may exist, so points need not equal 3 × wins + draws, but must not exceed that maximum. If league membership is different, reconcile it and get approval **before** publishing a new table.

**Corrections / withdrawals:** for now, never quietly delete a match or swap opponents on an existing match ID; investigate and make an explicit reviewed correction instead. This first release supports dated schedule updates and scheduled→final transitions. Postponement/cancellation categories should be designed and tested before they are used in an update.

## Validation & audit

- Node 22 or later; no third-party dependencies.
- `node scripts/league-update.js --preview` — validate without writing.
- `node scripts/league-update.js --publish` — writes only local files; GitHub workflow handles test/commit.
- `node tests/validate-league-data.js`
- `node tests/validate-club-profiles.js`
- `node tests/validate-match-centre.js`
- `node tests/validate-update-workflow.js`

The importer checks source URL, reviewer, dates, duplicate batch IDs, exact club IDs, competition, league division, duplicate matches, scores, and complete division tables. It preserves existing club IDs and badges. Published update evidence is recorded in `data/update-history.json`.

The site exposes a **latest saved update** date and per-section verification dates. A partial update does not magically verify every table. FA Full-Time remains the authority for the latest position, fixtures, results and postponed matches.

## Next step for official feeds

Request the league's permission and ask an authorised league/team admin to open **Full-Time Admin → Media → Code Snippets** and obtain the code for the **2026/27 First and Second Division tables**, **upcoming fixtures**, and **recent results**. Before integration, confirm licensing, division coverage, look-and-feel, mobile behaviour and permission to use these snippets on an independently hosted prototype. We'll then evaluate the official widgets alongside our current professional design instead of relying on unauthorised scraping.
