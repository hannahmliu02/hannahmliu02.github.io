# hannahmliu.com

Personal site of Hannah Liu, built with [Hugo](https://gohugo.io/) and a small custom theme. There is no Node or Tailwind step.

## Run it locally

```bash
hugo server
```

Then open http://localhost:1313. Pushing to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`, Hugo version pinned in `hugoblox.yaml`).

## Where things live

| To change | Edit |
|---|---|
| Homepage text, research areas, RAI projects, and the "where it comes up" links | `content/_index.md` |
| The nine fields on the ring | `config/_default/params.yaml` (`fields`) |
| Roles, projects, skills, awards | `content/experience.md` |
| RAI page: projects, talks, newsletter | `content/responsible-ai-institute.md` |
| Bio, interests, education, photo | `data/authors/me.yaml`, `assets/media/authors/me.png` |
| Footer and About links | `config/_default/params.yaml` (`links`) |
| Navigation | `config/_default/menus.yaml` |
| PDFs and photos | `static/uploads/` |

Every entry on What I've Been Up To has an `id`, which becomes a link like `/what-ive-been-up-to/#bias-guardrails`. The homepage `mentions` point at those links, and an entry's `related` list points back at the homepage area ids.

## Theme

- `layouts/`: page templates (`home.html`, `experience.html`, `rai.html`, `about.html`, and generic `page.html` / `section.html`)
- `assets/css/site.css`: colours, type and layout, with light and dark themes
- `assets/js/`: the homepage graph, the RAI framework graph, the experience field filter and the theme toggle
