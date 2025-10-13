import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'OpenWorkflow Docs',
  tagline: 'Open standard for portable AI workflows and automations',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.openworkflowspec.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'OWorkflow', // Usually your GitHub org/user name.
  projectName: 'OpenWorkflow-Docs', // Usually your repo name.

  onBrokenLinks: 'warn', // Changed from 'throw' since some spec files reference planned-but-not-yet-created files

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Edit links point to the OpenWorkflow-Specification repo
          editUrl:
            'https://github.com/OWorkflow/OpenWorkflow-Specification/tree/main/',
          // Versioning configuration
          lastVersion: 'current',
          versions: {
            current: {
              label: 'v0.1.0 (Draft)',
              path: '',
            },
          },
        },
        blog: false, // Disable blog for now
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'OpenWorkflow Logo',
        src: 'img/logo-icon.png',
        srcDark: 'img/logo-icon.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/OWorkflow/OpenWorkflow-Specification',
          label: 'Specification',
          position: 'right',
        },
        {
          href: 'https://github.com/OWorkflow',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Specification',
              to: '/docs/reference/overview',
            },
            {
              label: 'Examples',
              to: '/docs/examples',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/9ZvPRbps',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/orgs/OWorkflow/discussions',
            },
            {
              label: 'GitHub Issues',
              href: 'https://github.com/OWorkflow/OpenWorkflow-Specification/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Specification Repository',
              href: 'https://github.com/OWorkflow/OpenWorkflow-Specification',
            },
            {
              label: 'OpenWorkflow Organization',
              href: 'https://github.com/OWorkflow',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenWorkflow Community. Licensed under Apache 2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['yaml', 'json', 'bash', 'python', 'typescript', 'javascript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
