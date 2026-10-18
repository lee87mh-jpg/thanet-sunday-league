# Thanet Sunday Football League — development roadmap

Updated: 18 October 2026

## Current progress

**Stage 1 — Individual club profiles: implementation complete.** The 22 league clubs have unique shareable URLs using `club.html?club=<profileSlug>`, generated from `data/league-data.js`. Club badges/names link from directory, tables, fixtures, results and homepage previews. Profiles show saved standings, fixtures, results and recorded league form; unverified details remain unfilled. Future enrichment (grounds, contacts, social links, honours) is still pending reliable information.

**Stage 2 — Match Centre: first release complete.** The 28 recorded fixtures/results share one match detail template at `match.html?match=<matchId>`, with badges, score or VS, competition, recorded date, available status, related meetings and clear placeholders for unknown times/venues. Match scores link here from the homepage, club profiles, fixtures, results and cups. Club profiles also received form-key and mobile-spacing polish. Future extensions (match reports, confirmed officials, goalscorers, full competition draws) still require reliable data.

**Stage 3 — Reliable updates: manual publishing system implemented.** The repository contains `updates/pending.json`, `scripts/league-update.js`, two GitHub Actions workflows, update history, independent regression tests and [DATA-UPDATES.md](DATA-UPDATES.md). Data changes require a verified source, review, preview and explicit publish confirmation; nothing automatically scrapes FA Full-Time. Newest-first results, chronological fixtures and per-section snapshot dates are supported. **Pending:** league permission/admin access for official FA Full-Time embed codes, first real verified publication, and verification of Second Division membership/standings.

**Stage 4 — Cup competition pages and match filters: implementation complete (current-season verification pending).** Added individual cup pages, a central competition registry, division/cup selectors for fixtures and results, and separation of known league matches from 18 October County Cup ties. Names documented historically (Challenge Cup/Trophy, Chris Sear Memorial Cup/Shield, First/Second Division Cups) are visibly marked as awaiting **2026/27 confirmation**. No draws or results are invented. Kent Sunday Junior Cup is listed as a named county competition, without attributing unverified ties. Match update workflow checks competition IDs. See [CUP-COMPETITIONS.md](CUP-COMPETITIONS.md).

## Completed foundations
- Public multi-page GitHub Pages website, black/white identity, league logo and supplied football photography.
- Home, tables, fixtures, results, cups, clubs, news and about pages.
- Club crests supplied to date, with initials as fallbacks.
- **Central football data source** at `data/league-data.js` with stable IDs. HTML pages no longer maintain separate match/table/club copies.

## Remaining backlog (prioritised; do not start without a new request)

1. **Statistics centre:** form over last five matches, attack/defence records, home/away form, unbeaten runs, top scorers only with reliable data.
2. **News and media:** complete articles, league announcements, match reports, photo galleries and easy publication workflow.
3. **Sponsors and league information:** title sponsor, approved partners, committee and contact details, rules, key dates, downloads and forms.
4. **League history and honours:** past champions, cup winners, archives, historic tables and records as available.

## Constraints and decisions
- Continue using free GitHub Pages until domain/hosting needs change.
- Do not add accounts, payments or a backend merely for public content.
- Keep club identity in one registry and matches referencing stable club IDs.
- Do not invent club grounds, cup results, goalscorers, standings or match times.
- Saved results and tables are from the 18 October 2026 snapshot, **not live**.
- Website remains an independent concept pending the league's authorisation. Permission to use official feeds and badges should be checked before formal launch.
