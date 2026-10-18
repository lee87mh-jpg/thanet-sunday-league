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
| News | `news.html` |
| About | `about.html` |

## One source of football data

**Edit `data/league-data.js` to change clubs, badges, fixture dates/opponents, final scores or league standings. Do not duplicate the data in individual HTML pages or JavaScript views.**

The file contains:

- `clubs`: one record per club (stable `id`, `name`, `division`, `badge`, reserved `profileSlug` and unfilled profile details).
- `standings.first` and `standings.second`: club IDs and league statistics. Second Division data is intentionally empty until confirmed.
- `matches`: fixtures and results with `homeId`/`awayId` referencing the same club records, not club-name strings.
- `source` and `snapshotDate`: provenance / freshness.

The page renderer `site-v4.js` reads `window.TSL_DATA`, resolves names and badges, and filters matches for each club through stable IDs. It rebuilds each view on page load; the HTML includes a loading/official-source fallback rather than separate hard-coded football lists. Both scripts are loaded in order with `defer`. No database or paid hosting is needed.

**How to update a club:** change that one `clubs` entry; its name and badge update automatically wherever it appears in tables, fixtures, results and club lists. To add a fixture, insert one match with valid `homeId`/`awayId`. When profiles are built, use `profileSlug` and `matchesForClub(clubId)`.

**Validation:** run `node tests/validate-league-data.js` after editing the data file. This checks duplicate IDs, references, standings and local badge assets.

## Source and publishing

- Saved snapshot: **18 October 2026**. Tables/results/fixtures do **not** automatically update.
- Official reference: [FA Full-Time](https://fulltime.thefa.com/index.html?league=391033232). Do not imply an official live feed without permission.
- Original league crest: `assets/thanet-league-badge.svg`.
- Supplied football photographs: `assets/hero-celebration.avif`, `assets/cup-celebration.avif`.
- Supplied club crests: `assets/badges/`; initial placeholders remain for clubs without a crest.
- Deployment: GitHub → Settings → Pages → deploy `main` from `/(root)`.

## Future work

See [ROADMAP.md](ROADMAP.md) for the saved eight-stage plan. **Individual club profiles are next**, after the central data refactor.
