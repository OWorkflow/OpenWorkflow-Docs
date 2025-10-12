#!/usr/bin/env ts-node

import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';

const SPEC_REPO = 'https://github.com/Open-Workflow/OpenWorkflow-Specification.git';
const DOCS_DIR = path.join(__dirname, '../docs');

// Try to find the specification directory
// In local development: ../../OpenWorkflow-Specification (sibling directory)
// In GitHub Actions: .spec-source (checked out by workflow)
const LOCAL_SPEC_DIR = path.join(__dirname, '../../OpenWorkflow-Specification');
const GITHUB_ACTIONS_SPEC_DIR = path.join(__dirname, '../.spec-source');
const TEMP_SPEC_DIR = path.join(__dirname, '../.tmp-spec');

interface FrontMatter {
  id?: string;
  title?: string;
  sidebar_label?: string;
  sidebar_position?: number;
  description?: string;
}

async function getSpecDirectory(): Promise<string> {
  // First, check if GitHub Actions checked out the spec (highest priority for CI)
  if (await fs.pathExists(GITHUB_ACTIONS_SPEC_DIR)) {
    // Check if it's actually the spec repo or if it contains the spec repo
    const specsPath = path.join(GITHUB_ACTIONS_SPEC_DIR, 'specs');
    const nestedSpecPath = path.join(GITHUB_ACTIONS_SPEC_DIR, 'OpenWorkflow-Specification');

    if (await fs.pathExists(specsPath)) {
      console.log('📥 Using GitHub Actions checked-out specification (.spec-source)');
      return GITHUB_ACTIONS_SPEC_DIR;
    } else if (await fs.pathExists(nestedSpecPath)) {
      console.log('📥 Using nested specification directory (.spec-source/OpenWorkflow-Specification)');
      return nestedSpecPath;
    }
  }

  // Second, check if the local specification directory exists (for local dev)
  if (await fs.pathExists(LOCAL_SPEC_DIR)) {
    console.log('📥 Using local OpenWorkflow-Specification directory');
    return LOCAL_SPEC_DIR;
  }

  // Fall back to cloning into temp directory
  console.log('📥 Fetching specification from GitHub...');

  if (await fs.pathExists(TEMP_SPEC_DIR)) {
    // Pull latest changes
    const git = simpleGit(TEMP_SPEC_DIR);
    await git.pull();
    console.log('✅ Updated existing clone');
  } else {
    // Clone fresh with full depth to ensure all files are present
    const git = simpleGit();
    await git.clone(SPEC_REPO, TEMP_SPEC_DIR, ['--depth', '1']);
    console.log('✅ Cloned specification repository');

    // Verify the clone succeeded
    const clonedContents = await fs.readdir(TEMP_SPEC_DIR);
    console.log(`📁 Cloned contents: ${clonedContents.join(', ')}`);
  }

  return TEMP_SPEC_DIR;
}

async function syncSpecs(specDir: string) {
  console.log('\n📄 Syncing specification files...');

  const sourceDir = path.join(specDir, 'specs');
  const targetDir = path.join(DOCS_DIR, 'reference');

  await fs.ensureDir(targetDir);

  // Check if specs directory exists
  if (!(await fs.pathExists(sourceDir))) {
    console.error(`❌ Specs directory not found at: ${sourceDir}`);
    console.log('📁 Available contents in spec directory:');
    const contents = await fs.readdir(specDir);
    console.log(contents.join(', '));
    throw new Error(`Specs directory not found: ${sourceDir}`);
  }

  const files = await fs.readdir(sourceDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  for (const file of mdFiles) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    let content = await fs.readFile(sourcePath, 'utf-8');

    // Parse existing front-matter (if any)
    const parsed = matter(content);

    // Generate title from filename if not present
    const baseTitle = file.replace('.md', '').split('-').map(w =>
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');

    // Add/update front-matter
    const frontMatter: FrontMatter = {
      id: file.replace('.md', ''),
      title: parsed.data.title || baseTitle,
      sidebar_label: parsed.data.sidebar_label || baseTitle,
      description: parsed.data.description || `${baseTitle} specification`,
      ...parsed.data,
    };

    // Fix internal links to other specs (already in reference/ directory)
    let processedContent = parsed.content;
    processedContent = processedContent.replace(
      /\]\(\.\/([^)]+\.md)\)/g,
      '](./$1)'
    );

    // Fix links to examples (from specs/ to docs/examples/)
    processedContent = processedContent.replace(
      /\]\(\.\.\/examples\/([^)]+)\)/g,
      '](../examples/$1)'
    );

    // Fix erroneous ./docs/reference/ patterns that may exist
    processedContent = processedContent.replace(
      /\]\(\.\/docs\/reference\/([^)]+)\)/g,
      '](./$1)'
    );

    // Fix erroneous ./docs/examples/ patterns
    processedContent = processedContent.replace(
      /\]\(\.\/docs\/examples\/([^)]+)\)/g,
      '](../examples/$1)'
    );

    // Escape < and > characters in tables that could be mistaken for JSX
    processedContent = processedContent.replace(
      /\|([^|]*)<([^|]*)\|/g,
      (_match, before, after) => `|${before}&lt;${after}|`
    );

    // Rebuild with front-matter
    const output = matter.stringify(processedContent, frontMatter);

    await fs.writeFile(targetPath, output);
    console.log(`  ✓ ${file}`);
  }

  console.log(`✅ Synced ${mdFiles.length} specification files`);
}

async function syncExamples(specDir: string) {
  console.log('\n📦 Syncing examples...');

  const sourceDir = path.join(specDir, 'examples');
  const targetDir = path.join(DOCS_DIR, 'examples');

  await fs.ensureDir(targetDir);

  // Copy entire examples directory structure
  await fs.copy(sourceDir, targetDir, { overwrite: true });

  // Add index.md if it doesn't exist
  const indexPath = path.join(targetDir, 'index.md');
  if (!(await fs.pathExists(indexPath))) {
    const indexContent = matter.stringify(
      '# Examples\n\nExplore example workflows, connectors, and agents demonstrating OpenWorkflow capabilities.\n',
      {
        id: 'examples',
        title: 'Examples',
        sidebar_label: 'Examples',
        sidebar_position: 5,
      }
    );
    await fs.writeFile(indexPath, indexContent);
  }

  console.log('✅ Synced examples directory');
}

async function syncRootDocs(specDir: string) {
  console.log('\n📝 Syncing root documentation...');

  const filesToSync = ['README.md', 'CONTRIBUTING.md', 'CHANGELOG.md'];

  for (const file of filesToSync) {
    const sourcePath = path.join(specDir, file);

    if (!(await fs.pathExists(sourcePath))) {
      console.log(`  ⊘ ${file} not found, skipping`);
      continue;
    }

    let content = await fs.readFile(sourcePath, 'utf-8');
    const parsed = matter(content);

    let targetFile: string;
    let frontMatter: FrontMatter;

    if (file === 'README.md') {
      targetFile = 'intro.md';
      frontMatter = {
        id: 'intro',
        title: 'Introduction',
        sidebar_label: 'Introduction',
        sidebar_position: 1,
        description: 'Introduction to OpenWorkflow specification',
      };
    } else if (file === 'CONTRIBUTING.md') {
      targetFile = 'contributing.md';
      frontMatter = {
        id: 'contributing',
        title: 'Contributing',
        sidebar_label: 'Contributing',
        sidebar_position: 99,
        description: 'How to contribute to OpenWorkflow',
      };
    } else if (file === 'CHANGELOG.md') {
      targetFile = 'changelog.md';
      frontMatter = {
        id: 'changelog',
        title: 'Changelog',
        sidebar_label: 'Changelog',
        sidebar_position: 100,
        description: 'Version history and changes',
      };
    } else {
      continue;
    }

    const targetPath = path.join(DOCS_DIR, targetFile);

    // Fix relative links
    let processedContent = parsed.content;
    processedContent = processedContent.replace(
      /\]\(\.\/specs\/([^)]+\.md)\)/g,
      '](./reference/$1)'
    );
    processedContent = processedContent.replace(
      /\]\(\.\/examples\/([^)]+)\)/g,
      '](./examples/$1)'
    );

    // Fix links to files that don't exist in docs (these will be broken)
    // Remove .md extension for links to other doc pages
    processedContent = processedContent.replace(
      /\]\(\.\/CONTRIBUTING\.md\)/g,
      '](./contributing)'
    );
    processedContent = processedContent.replace(
      /\]\(\.\/SECURITY-REVIEW\.md\)/g,
      '](https://github.com/Open-Workflow/OpenWorkflow-Specification/blob/main/SECURITY-REVIEW.md)'
    );
    processedContent = processedContent.replace(
      /\]\(\.\/FAQ\.md\)/g,
      '](https://github.com/Open-Workflow/OpenWorkflow-Specification/blob/main/FAQ.md)'
    );

    const output = matter.stringify(processedContent, frontMatter);
    await fs.writeFile(targetPath, output);
    console.log(`  ✓ ${file} → ${targetFile}`);
  }

  console.log('✅ Synced root documentation files');
}

async function createReferenceIndex() {
  console.log('\n📑 Creating reference index...');

  const indexPath = path.join(DOCS_DIR, 'reference', 'overview.md');

  const content = `# Specification Overview

Welcome to the OpenWorkflow specification reference documentation.

OpenWorkflow is an open standard for building portable AI workflows and automations. This specification defines schemas and behaviors for:

- **Connectors** — External integrations (APIs, databases, MCP servers)
- **Workflows** — Multi-step automation logic
- **Agents** — Autonomous AI task executors
- **Bundles** — Packaged collections of resources

## Specification Files

Browse the specification documentation:

- [Connector Schema](./connector-schema.md)
- [Workflow Schema](./workflow-schema.md)
- [Agent Schema](./agent-schema.md)
- [Bundle Schema](./bundle-schema.md)
- [Workflow Logic Steps](./workflow-logic-steps.md)
- [Execution Backends](./execution-backends.md)
- [Registry Protocol](./registry-protocol.md)
- [SDK Contract](./sdk-contract.md)

## License

The OpenWorkflow specification is licensed under [Apache 2.0](https://github.com/Open-Workflow/OpenWorkflow-Specification/blob/main/LICENSE).
`;

  const frontMatter: FrontMatter = {
    id: 'overview',
    title: 'Specification Overview',
    sidebar_label: 'Overview',
    sidebar_position: 1,
    description: 'Overview of the OpenWorkflow specification',
  };

  const output = matter.stringify(content, frontMatter);
  await fs.writeFile(indexPath, output);

  console.log('✅ Created reference index');
}

async function main() {
  try {
    console.log('🚀 Starting OpenWorkflow specification sync\n');

    const specDir = await getSpecDirectory();
    await syncSpecs(specDir);
    await syncExamples(specDir);
    await syncRootDocs(specDir);
    await createReferenceIndex();

    console.log('\n✨ Sync completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
