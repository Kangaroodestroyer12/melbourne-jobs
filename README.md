# MelbJobs

[Open MelbJobs](https://Kangaroodestroyer12.github.io/melbourne-jobs/)

Melbourne job discovery with Local/International modes, visa chips, keyword/suburb filters, transparent hidden listings and mobile-friendly details.

## Data
Listings are sourced via [Adzuna](https://www.adzuna.com/) using the [Adzuna API](https://developer.adzuna.com/). GitHub Actions fetches up to 60 Melbourne listings across hospitality, retail, warehouse, admin, office and IT every 3 hours (UTC cron `0 */3 * * *`), or on manual dispatch. Schedules may be delayed by GitHub.

Visa badges are keyword-based estimates, not legal advice. A friendly default means only that no visa-related requirements were mentioned, not confirmed eligibility. Check the badge reason and original listing. Listings belong to their original posters; cards and details link back to the original source.

## Setup
Add Actions repository secrets `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`, then run Fetch Melbourne jobs. Never commit credentials. Node 22 runs `node scripts/fetch-jobs.js`; failure preserves existing jobs.json. Changed data is committed to main. The workflow explicitly deploys Pages because built-in token commits do not automatically trigger another Pages build.

## Site
Serve index.html with any static server or GitHub Pages. app.js fetches jobs.json and retains nine fictional fallback samples if the file is missing, empty, invalid or unavailable. Company and source links appear for live listings. No build dependencies.
