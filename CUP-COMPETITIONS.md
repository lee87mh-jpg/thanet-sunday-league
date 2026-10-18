# Cup competitions — research and implementation record

Updated 18 October 2026. Source: [Thanet Sunday Football League on FA Full-Time](https://fulltime.thefa.com/index.html?league=391033232). Website is a prototype and **not a live authorised FA data feed**.

## 2026/27 status

The Full-Time archive contains clear evidence that the league has staged the following competitions in earlier seasons:

| Historic cup name | What we can establish | 2026/27 status |
| --- | --- | --- |
| Challenge Cup | Archive mentions first round and quarter-finals during 2024/25. | Awaiting confirmation |
| Challenge Trophy | Archive mentions first and later rounds during 2024/25. | Awaiting confirmation |
| First Division Cup | Historic divisional final and winner reported in 2024/25. | Awaiting confirmation |
| Second Division Cup | Historic divisional final and winner reported in 2024/25. | Awaiting confirmation |
| Chris Sear Memorial Cup | Historic competition, first final reported in 2024/25. | Awaiting confirmation |
| Chris Sear Memorial Shield | Historic competition, first winners reported in 2024/25. | Awaiting confirmation |

FA source: https://fulltime.thefa.com/index.html?league=391033232&selectedFixtureGroupKey=1_393725744

The FA's October 2026 league records mark certain matches **CC** (County Cup). The source search listing includes **Kent Sunday Junior Cup**, a Kent FA County Cup. The saved six cup results have not been checked *individually* against competition-specific match detail and are therefore assigned to `cup-unassigned` (**Kent FA County Cups — exact cup to confirm**), not to any divisional league cup. The Kent Sunday Junior Cup is a separate, named registry entry with no attributed results yet.

## Website implementation

- `data/league-data.js` contains the canonical `competitions` registry with stable IDs, verification status, season status, division where known and source notes.
- Each `matches` record has `competitionId` referencing the registry. League matches use `league-first` or `league-second`; legacy CC results use `cup-unassigned` until individually verified.
- `cups.html` lists competitions; `cup.html?competition=<id>` displays saved fixtures/results for that competition.
- `fixtures.html` and `results.html` have division and competition filters; fixtures also filter by club.
- The `cup-all` filter means all cup competitions; the default all-divisions view includes County Cup results without inventing which division a County Cup match belongs to.
- Match pages show the matched competition name or a clear identification-pending label.
- `scripts/league-update.js` validates `competitionId` and rejects assigning matches to cups still marked as unconfirmed for 2026/27.

## What we still need from the league

Ask the league secretary / authorised Full-Time admin to verify:
1. Exact **2026/27 cup names**, sponsors, cup IDs and official draws.
2. Which divisions / teams enter each competition; some cups span multiple divisions.
3. The **specific Kent County Cup name** for each recorded CC tie, including any external opponents.
4. Rules, knockout format, preliminary rounds, dates, semi-finals and finals.

Until then, **no brackets, standings, winners or cup tie attributions have been invented**. Historical names are displayed as names used in earlier seasons, not presented as confirmed 2026/27 competitions.

## Next technical enhancements after confirmation

Populate competition-specific 2026/27 fixtures in the central dataset with `competitionId`, round (after schema validation is extended), draw order and score details. A bracket component should only be rendered for a confirmed draw; a cup without results should show an informative empty state.
