import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageCallToAction from '@site/src/components/HomepageCallToAction';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Build AI Workflows That Actually Work Together
        </Heading>
        <p className="hero__subtitle">
          OpenWorkflow is an open specification that lets developers connect AI agents, tools, and apps
          through a shared, vendor-neutral language for automation.
        </p>
        <p className={styles.heroDescription}>
          Workflows shouldn't break when you change platforms. OpenWorkflow defines a single, interoperable
          format for describing triggers, actions, and data flow — so your automations stay portable across
          LangChain, Smartify, AgentKit, VertexAI, and beyond.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Read the Spec
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/examples">
            View Examples
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Open Specification for Portable AI Workflows"
      description="OpenWorkflow is an open specification that lets developers connect AI agents, tools, and apps through a shared, vendor-neutral language for automation. Build once, deploy anywhere.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageCallToAction />
      </main>
    </Layout>
  );
}
