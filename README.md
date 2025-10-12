# OpenWorkflow Documentation

This repository contains the documentation website for [OpenWorkflow](https://github.com/Open-Workflow/OpenWorkflow-Specification), built with [Docusaurus v3](https://docusaurus.io/).

**Live site:** [https://docs.openworkflowspec.org](https://docs.openworkflowspec.org)

## Overview

The OpenWorkflow documentation site automatically syncs content from the [OpenWorkflow-Specification](https://github.com/Open-Workflow/OpenWorkflow-Specification) repository, including:

- Specification files from `/specs/`
- Examples from `/examples/`
- Root documentation (README, CONTRIBUTING, CHANGELOG)

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
npm install
```

### Local Development

```bash
# Sync latest specification content
npm run sync

# Start development server
npm start
```

This command starts a local development server and opens a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Sync Specification Content

The sync script pulls the latest content from the OpenWorkflow-Specification repository:

```bash
npm run sync
```

This script:
- Clones/updates the OpenWorkflow-Specification repository
- Copies `/specs/*.md` to `/docs/reference/`
- Copies `/examples/**` to `/docs/examples/`
- Copies root docs (README.md, CONTRIBUTING.md, CHANGELOG.md)
- Adds proper Docusaurus front-matter
- Fixes internal links

## Deployment

The site is automatically deployed to GitHub Pages when:

1. Changes are pushed to the `main` branch
2. The OpenWorkflow-Specification repository is updated (via `repository_dispatch`)

### GitHub Pages Setup

1. Go to repository **Settings** > **Pages**
2. Set **Source** to "GitHub Actions"
3. Configure DNS:
   - Add CNAME record: `docs.openworkflowspec.org` → `open-workflow.github.io`
4. Create a Personal Access Token with `repo` scope
5. Add token as `DOCS_DEPLOY_TOKEN` secret to OpenWorkflow-Specification repo

## Project Structure

```
OpenWorkflow-Docs/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # GitHub Pages deployment
│       └── quality.yml         # Link checking and linting
├── docs/                       # Documentation content (synced)
│   ├── getting-started/        # Getting started guides
│   ├── reference/              # Synced from /specs/ in spec repo
│   ├── examples/               # Synced from /examples/ in spec repo
│   ├── intro.md                # Synced from README.md
│   ├── contributing.md         # Synced from CONTRIBUTING.md
│   └── changelog.md            # Synced from CHANGELOG.md
├── scripts/
│   └── sync-spec.ts            # Specification sync script
├── src/                        # React components and pages
├── static/                     # Static assets
│   └── CNAME                   # Custom domain configuration
├── docusaurus.config.ts        # Docusaurus configuration
├── sidebars.ts                 # Sidebar structure
└── package.json
```

## Configuration

### docusaurus.config.ts

Main configuration file for:
- Site metadata (title, URL, etc.)
- GitHub organization and repo
- Theme configuration
- Navbar and footer
- Prism syntax highlighting

### sidebars.ts

Defines the documentation sidebar structure:
- Introduction
- Getting Started
- Specification Reference
- Examples
- Contributing
- Changelog

## Versioning

The documentation supports versioning aligned with OpenWorkflow specification releases:

- **Current (v0.1.0 Draft)**: Active development
- Future versions will be created when specification releases are tagged

To create a new version:

```bash
npm run docusaurus docs:version 0.2.0
```

## Contributing

Contributions to the documentation site structure and tooling are welcome!

For content changes (specifications, examples), contribute to the [OpenWorkflow-Specification](https://github.com/Open-Workflow/OpenWorkflow-Specification) repository instead.

## License

This documentation site is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.

The OpenWorkflow specification itself is also licensed under Apache 2.0.
