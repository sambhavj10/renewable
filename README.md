# GreenGrid India

An independent news website tracking India's renewable energy transition — solar, wind, storage, green hydrogen, manufacturing and policy. A new article is published every Sunday.

Built with [Astro](https://astro.build). Launched July 2026.

## Editorial principles

- **Genuine dates only.** Every article carries the date it was actually published.
- **Sources on every article.** Each piece lists the reports, official releases and coverage it draws on.
- **No invented facts or quotes.** Company stories are attributed to their announcements.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Deploying on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import this GitHub repository (`sambhavj10/renewable`).
2. Vercel auto-detects Astro — no build settings needed.
3. Under **Settings → Git**, set the **Production Branch** to the branch that carries the site (or merge to `main` and use the default).
4. Every push to that branch redeploys the site automatically.

## Publishing a new article

Each article is one markdown file in `src/content/articles/`. Copy an existing file and edit:

```yaml
---
title: 'Your headline'
date: 2026-07-19            # the real publication date
category: Solar             # Solar | Wind | Storage | Hydrogen | Manufacturing | Policy & Markets
excerpt: 'One-sentence standfirst shown on cards and in the article header.'
hero: /images/your-image.svg
heroAlt: 'Accessible description of the hero image.'
featured: false             # true pins it to the homepage hero slot
sources:
  - label: 'Publication: headline'
    url: 'https://example.com/story'
---

Article body in markdown…
```

Hero images live in `public/images/` (SVG preferred, 1200×675). Commit, push, and Vercel deploys.

## Weekly automation

A scheduled routine in Claude Code (this repo's development environment) runs every Sunday morning IST: it researches the week's real India renewable energy news, writes one new sourced article with an original graphic, and pushes it to the site branch. Review, edit or pause it anytime — or publish manually using the steps above.
