# Thanet Sunday Football League — Website Prototype

An independent, monochrome, badge-led website prototype for the **Martini Airport Transfers Thanet Sunday Football League**, season 2026/27. Built with HTML, CSS and vanilla JavaScript for free hosting on GitHub Pages.

**Preview URL after GitHub Pages is enabled:** https://lee87mh-jpg.github.io/thanet-sunday-league/

## Pages included
- Authentic black-and-white league badge in the header, hero and footer (optimised from supplied image)
- Black, white and soft grey theme, replacing the initial green palette
- Responsive home / matchday preview
- First Division table snapshot
- Fixtures and results with filters
- Cup section, club directory, news, sponsor and community section

## Football data and permission
- Current data in \`app.js\` was checked against the public [FA Full-Time league page](https://fulltime.thefa.com/index.html?league=391033232) **on 18 October 2026**.
- The displayed tables, fixtures and results **do not auto-update**. Confirm any changes on FA Full-Time.
- The Second Division table is intentionally withheld until accurate official data is provided.
- Official FA Full-Time embeds require an authorised league administrator to open **Media → Code Snippets** in FA Full-Time and supply approved table / fixtures / results embeds. The FA does not make these codes public.
- The site is a prototype and must not be described as officially endorsed by the league or sponsor until they give their approval. No third-party logos have been copied.

## Deployment
1. GitHub repo → Settings → Pages.
2. Under Build and deployment choose **Deploy from a branch**.
3. Branch: **main**, folder: **/(root)**, then Save.
4. Allow GitHub Pages to publish and visit the preview URL above.

## Updating
Edit \`SNAPSHOT\` at the top of \`app.js\` and make a commit. If approved league feeds are later supplied, replace the static snapshot views with their official embeds. CSS lives in \`styles.css\`; markup lives in \`index.html\`. The badge asset is \`assets/thanet-league-badge.svg\`.

There are no npm dependencies, server bills, databases or build steps. Hosting as a public repository on GitHub Pages is free under GitHub's current plan offering.
