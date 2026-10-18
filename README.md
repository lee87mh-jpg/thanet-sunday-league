# Thanet Sunday Football League — website

Multi-page, mobile-friendly, **GitHub Pages** site for the Martini Airport Transfers Thanet Sunday Football League. Independent concept awaiting league approval.

**Preview:** https://lee87mh-jpg.github.io/thanet-sunday-league/

## Site

| Page | File |
| --- | --- |
| Home | `index.html` |
| Tables | `tables.html` |
| Fixtures | `fixtures.html` |
| Results | `results.html` |
| Cups | `cups.html` |
| Clubs | `clubs.html` |
| Individual club profile | `club.html?club=<profileSlug>` |
| Match centre | `match.html?match=<matchId>` |
| News | `news.html` |
| About | `about.html` |

## One source of football data

**Edit `data/league-data.js` to change clubs, badges, fixture dates/opponents, final scores or league standings. Do not duplicate the data in individual HTML pages or JavaScript views.**

The file contains:

- `clubs`: one record per club (stable `id`, `name`, `division`, `badge`, reserved `profileSlug` and unfilled profile details).
- `standings.first` and `standings.second`: club IDs and league statistics. Second Division data is intentionally empty until confirmed.
- `matches`: fixtures and results with `homeId`/`awayId` referencing the same club records, not club-name strings.
- `source` and `snapshotDate`: provenance / freshness.

The page renderer `site-v8.js` reads `window.TSL_DATA`, resolves names and badges, and filters matches for each club through stable IDs. It rebuilds each view on page load; the HTML includes a loading/official-source fallback rather than separate hard-coded football lists. Both scripts are loaded in order with `defer`. No database or paid hosting is needed.

## Individual club profiles

Every listed First/Second Division club has a unique, shareable URL such as [Ramsgate Vale FC](club.html?club=ramsgate-vale-fc) or [Imperial Bar FC](club.html?club=imperial-bar-fc). GitHub Pages serves one lightweight `club.html` template; `club-profile.js` reads the `club` query parameter and loads the appropriate record from `data/league-data.js`. New league clubs can be added without cloning HTML files.

Each profile displays the club badge and division, available league position/points/statistics, scheduled fixtures, recorded results, and league form *only from the recorded results in the snapshot*. Missing home ground/website/Second Division standings are explicitly unconfirmed. Club profiles are linked from the club directory, both league table views and match cards, including home-page previews. External cup opponents do not receive official league profiles.

## Match centre

Every recorded fixture and result has a shareable URL such as `match.html?match=fx-001` or `match.html?match=rs-001`. All match information comes from the existing `matches` records and their stable IDs in `data/league-data.js`. The single `match.html` template and `match-centre.js` render both clubs' badges/names, recorded match date, competition, status and score when final. Unknown kick-off times, venues and unverified match details are explicitly marked as missing. Results, fixtures, club profiles, cup-result previews and homepage match previews link to the match page through their scores or VS boxes. Team names link to club profiles where available. No match data is duplicated between HTML files.

**How to update a club:** change that one `clubs` entry; its name and badge update automatically wherever it appears in tables, fixtures, results and club lists. To add a fixture, insert one match with valid `homeId`/`awayId`. Profiles already use `profileSlug` and club ID matching. Match-centre URLs use the saved match `id`.

**Validation:** run `node tests/validate-league-data.js` and `node tests/validate-club-profiles.js` and `node tests/validate-match-centre.js` after editing the data file. This checks duplicate IDs, references, standings and local badge assets.

## Verified weekly league updates

See **[DATA-UPDATES.md](DATA-UPDATES.md)** for the complete procedure and sample schema.

The site now uses an explicit **preview → confirm → publish** update process rather than automatically scraping FA Full-Time:

- Edit `updates/pending.json` on GitHub with the verified source, date, reviewer, complete tables (if supplied), and/or specific fixtures/results.
- Open **Actions → Verified league data update → Run workflow → preview**. This validates the draft without changing the live data.
- Only after checking the evidence select **publish** and enter exactly `PUBLISH`. The workflow validates again, runs site regression tests, commits the update to `data/league-data.js` and logs the reviewed batch in `data/update-history.json`.
- A unique batch ID prevents duplicate publication, and invalid club references, incomplete tables or scores are rejected.
- Updated data stays on free GitHub Pages. No API keys or scraped sessions are needed.

Both the site footer and First Division table snapshot tag read freshness information from central data. Fixtures sort from earliest to latest, and saved results sort newest-first. Verified Second Division standings can display once confirmed, but are **not** guessed.

The FA's official **Media → Code Snippets** live embeds are a later, permission-dependent option. Only an authorised Full-Time admin or team admin can provide them; this site does not currently have an authorised live feed.

## Source and publishing

- Saved snapshot: **18 October 2026**. Tables/results/fixtures do **not** automatically update.
- Official reference: [FA Full-Time](https://fulltime.thefa.com/index.html?league=391033232). Do not imply an official live feed without permission.
- Original league crest: `assets/thanet-league-badge.svg`.
- Supplied football photographs: `assets/hero-celebration.avif`, `assets/cup-celebration.avif`.
- Supplied club crests: `assets/badges/`; initial placeholders remain for clubs without a crest.
- Deployment: GitHub → Settings → Pages → deploy `main` from `/(root)`.

## Future work

See [ROADMAP.md](ROADMAP.md) for the saved development plan. **Club profiles and the initial Match Centre are implemented.** Next priority: a reliable authorised data-update workflow. Detailed match reports and club information await verified sources.
