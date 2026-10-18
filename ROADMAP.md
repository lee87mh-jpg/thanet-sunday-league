# Thanet Sunday Football League — development roadmap

Updated: 18 October 2026

## Current progress

**Stage 1 — Individual club profiles: implementation complete.** The 22 league clubs have unique shareable URLs using `club.html?club=<profileSlug>`, generated from `data/league-data.js`. Club badges/names link from directory, tables, fixtures, results and homepage previews. Profiles show saved standings, fixtures, results and recorded league form; unverified details remain unfilled. Future enrichment (grounds, contacts, social links, honours) is still pending reliable information.

## Completed foundations
- Public multi-page GitHub Pages website, black/white identity, league logo and supplied football photography.
- Home, tables, fixtures, results, cups, clubs, news and about pages.
- Club crests supplied to date, with initials as fallbacks.
- **Central football data source** at `data/league-data.js` with stable IDs. HTML pages no longer maintain separate match/table/club copies.

## Remaining backlog (prioritised; do not start without a new request)

1. **Full match centre:** pages for fixtures and results with both clubs, score/time, ground, competition and match status. Future match reports, goalscorers and previous meetings if verified.
2. **Reliable league data updates:** request authorised FA Full-Time integration, or build a controlled editorial update workflow. Verify Second Division clubs and standings. Continue clearly marking static data as dated until an authorised live feed works.
3. **Dedicated cup competitions:** competition pages, draws, round progression, brackets, semi-finals and finals using confirmed competition details.
4. **Statistics centre:** form over last five matches, attack/defence records, home/away form, unbeaten runs, top scorers only with reliable data.
5. **News and media:** complete articles, league announcements, match reports, photo galleries and easy publication workflow.
6. **Sponsors and league information:** title sponsor, approved partners, committee and contact details, rules, key dates, downloads and forms.
7. **League history and honours:** past champions, cup winners, archives, historic tables and records as available.

## Constraints and decisions
- Continue using free GitHub Pages until domain/hosting needs change.
- Do not add accounts, payments or a backend merely for public content.
- Keep club identity in one registry and matches referencing stable club IDs.
- Do not invent club grounds, cup results, goalscorers, standings or match times.
- Saved results and tables are from the 18 October 2026 snapshot, **not live**.
- Website remains an independent concept pending the league's authorisation. Permission to use official feeds and badges should be checked before formal launch.
