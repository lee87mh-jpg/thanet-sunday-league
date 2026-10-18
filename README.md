# Thanet Sunday Football League — website

Independent website concept for the **Martini Airport Transfers Thanet Sunday Football League**, season 2026/27, hosted on GitHub Pages.

**Website:** https://lee87mh-jpg.github.io/thanet-sunday-league/

## Site pages

| Page | URL | Purpose |
| --- | --- | --- |
| Home | `index.html` | Photographic hero, matchday preview, standings and news previews |
| Tables | `tables.html` | First Division table and Second Division placeholder |
| Fixtures | `fixtures.html` | Club-filterable upcoming fixtures |
| Results | `results.html` | League and cup result filters |
| Cups | `cups.html` | Knockout overview and recent cup scores |
| Clubs | `clubs.html` | Club lists with placeholders for individual club crests |
| News | `news.html` | League news and announcements |
| About | `about.html` | League community information and sponsor |

All pages use the shared `styles.css` and `app.js`. Navigation uses relative .html URLs so it works on GitHub Pages under this repository path, and on a custom domain later. No framework, paid hosting, backend or database is required.

## Football data / permissions

- **The figures are dated snapshots, not live:** FA Full-Time records checked **18 October 2026**. Confirm the latest information on [the league's FA Full-Time page](https://fulltime.thefa.com/index.html?league=391033232).
- First Division data, fixtures and results live in `app.js`. The Second Division standings are intentionally blank until the league provides verified information.
- Approved FA Full-Time embeds require a league administrator's cooperation. Do not imply permission to use official feeds, league badges or material before it is obtained.
- Website prototype is *not yet an authorised official league website*.

## Branding & images

- Badge: `assets/thanet-league-badge.svg`.
- Hero photo: `assets/hero-celebration.avif`.
- Cup photo: `assets/cup-celebration.avif`.
- Additional club badges can be added to the assets folder and mapped to each club name when permission has been obtained.
- The site uses dark charcoal, white, grey, and a diagonal texture over the photos.

## Deploy

GitHub → Settings → Pages → **Deploy from a branch** → **main** / **/(root)** → Save.

After pushing a change, allow Pages to refresh. The HTML links and versioned CSS/JS query strings minimise stale browser caching.

## Next improvements

1. Add approved club badge images and eventually create individual club profiles.
2. Connect confirmed official FA Full-Time embed feeds for fixtures, results and tables.
3. Add league-approved contact information, documents and additional sponsor assets.
