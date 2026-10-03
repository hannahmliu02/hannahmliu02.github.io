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
| The fields on the ring | `config/_default/params.yaml` (`fields`) |
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

## Private workbench (/workbench/)

A password-protected page for work in progress. The site is static and the repo is public, so the page is protected by encryption rather than a server:

1. Edit `private/workbench.yaml`. The `private/` folder is ignored by git, so this plaintext never leaves your machine.
2. Run `/opt/anaconda3/bin/python scripts/encrypt-workbench.py` and enter your password. It writes `static/workbench/data.enc.json` (AES-256-GCM, key derived with PBKDF2-SHA256 at 600,000 iterations).
3. Commit and push `data.enc.json`. Visitors decrypt it in the browser with the password.

Notes:
- Use a long passphrase. Anyone can download the encrypted file and try passwords offline.
- Everyone with the password sees everything. To revoke access, re-run the script with a new password and push.
- Keep a backup of `private/workbench.yaml` somewhere private. It isn't on GitHub.
- The page is marked `noindex`, left out of the sitemap, and not linked from the menu.
