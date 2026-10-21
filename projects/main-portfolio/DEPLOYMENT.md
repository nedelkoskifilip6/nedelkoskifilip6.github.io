# Main portfolio deployment

The main portfolio is an independent Astro source project in `projects/main-portfolio`. Its public address is `https://nedelkoskifilip6.github.io/`. Astro uses that origin, `base: '/'`, static output, and `build.assets: 'portfolio-assets'`.

## Build and publish locally

Run the project’s package scripts from `projects/main-portfolio`. The release sequence is:

1. Install the locked dependencies with `npm ci`.
2. Run the production Astro build and its configured source checks.
3. Run `node scripts/publish-build.mjs` to copy the generated build into the repository root.
4. Run `node scripts/verify-release.mjs` to check the published root and the Git change scope.
5. Review the Git diff and commit the source plus the generated root artifact together.

`node scripts/verify-release.mjs --dist` checks the built artifact before publishing. It also checks repository changes against the same baseline.

The existing GitHub Pages configuration deploys static files from the `main` branch. The generated root artifact is therefore committed to Git. This project does not require a new deployment workflow, an Actions migration, or a rebuild of any other project. A successful local build is not proof of deployment: verify the published root page and its assets after the commit reaches the configured Pages branch.

## Publishing boundary

The publish script accepts only these top-level build outputs:

- `index.html` (required)
- `portfolio-assets/`
- `portfolio-media/`
- `favicon-portfolio.svg`
- `social-portfolio.jpg`

Unexpected output, symbolic links, and unsupported file types stop publication before the root changes. Files are staged inside this source project and installed only at the whitelisted root paths. Existing versions of those same paths are backed up during installation and restored if installation fails. Namespaced directories present in the new build are replaced to remove obsolete generated files. Optional outputs absent from the build are left untouched.

The script never replaces `_astro/`, `images/`, `brand/`, other root files, or any existing project directory. Keep public media in `public/portfolio-media/`; keep the optional portfolio favicon and social image under their explicit names. Do not put legacy project files in this build.

## Release verification

The verifier checks:

- Local `src`, `srcset`, `poster`, social-image metadata, stylesheet, CSS `url()`, inline-style, and internal-link references resolve to regular files.
- HTML assets use root-relative portfolio namespaces; the build does not depend on a project subdirectory base path.
- Canonical and Open Graph page URLs, when present, point to the GitHub Pages root.
- Internal fragment links point to existing IDs.
- There are exactly five project presentations, with the intended publication status.
- Only REVOLUT and MIKU VANCOUVER expose project hyperlinks, and their URLs exactly match the two verified destinations below.
- Changed tracked and non-ignored untracked files remain within the portfolio publishing boundary, its source directory, or a newly added root Pages workflow. Existing workflows cannot change under this check.
- Tracked files in the five legacy project paths below are unchanged against baseline commit `e1cc5fb`.

| Project slug   | Status        | Permitted project destination                         |
| -------------- | ------------- | ----------------------------------------------------- |
| `revolut`      | `live`        | `https://nedelkoskifilip6.github.io/revolut-finance/` |
| `miku`         | `live`        | `https://nedelkoskifilip6.github.io/miku-vancouver/`  |
| `six-senses`   | `coming-soon` | None                                                  |
| `bang-olufsen` | `coming-soon` | None                                                  |
| `sothebys`     | `coming-soon` | None                                                  |

The five protected paths are `tesla-motors/`, `revolut-finance/`, `miku-vancouver/`, `projects/miku-vancouver/`, and `projects/revolut-finance/`. The broader Git scope check also rejects changes to other legacy root assets and unrelated project files.

Project presentations use `data-project="slug"` and `data-status="live|coming-soon"`. Project-index entries use `data-index-project="slug"` so they are not counted as duplicate presentations. Every actual live project anchor uses `data-project-link="slug"`. Coming-soon presentations have no active project links, placeholder `href`, guessed destination, or simulated published state.

The verifier is local and does not fabricate a live check. Before changing a project from coming soon to live, verify the real published destination and update the source data plus this verifier’s explicit destination allowlist together.

## Deployment readiness and handoff

The working branch is `codex/portfolio-3d` in `nedelkoskifilip6/nedelkoskifilip6.github.io`. The target remains the GitHub Pages root, `https://nedelkoskifilip6.github.io/`, served from the existing `main` branch configuration. Work on the development branch does not itself update that published root.

The two live destinations are `/revolut-finance/` and `/miku-vancouver/`. Six Senses Ibiza remains unpublished despite its locally built preview. Bang & Olufsen and Sotheby’s International Realty remain unpublished concept placeholders. Keep all three marked coming soon with no project destination links.

Before handoff to the Pages branch, run the production build, `npm run verify -- --dist`, `npm run publish-build`, and `npm run verify`. Review and commit the generated root files together with this source project. After the release reaches `main`, verify the actual public root, its portfolio assets, and both existing live project destinations. Record deployment success only after those published checks pass.

Read-only environment checks on 21 October 2026 found no GitHub CLI, no GitHub token environment variable, and no GitHub credential returned by the configured system credential helper. Authenticated GitHub API access was therefore not available through the existing local channels. An authenticated maintainer must complete the push or merge handoff if that remains unchanged. No repository settings or deployment workflows were changed by these checks.
