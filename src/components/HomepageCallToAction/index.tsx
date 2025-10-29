import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function HomepageCallToAction(): ReactNode {
  return (
    <section className={styles.callToAction}>
      <div className="container">
        <Heading as="h2">A Common Language for Automation</Heading>
        <p className={styles.description}>
          Every platform defines "workflows" differently. OpenWorkflow defines them once — as portable,
          interoperable blueprints for AI-driven tasks. It's an open, community-maintained standard
          designed to make automations readable, shareable, and executable anywhere.
        </p>

        <div className={styles.benefitsGrid}>
          <div className={styles.benefit}>
            <Heading as="h3">Extensible</Heading>
            <p>Add your own actions or plugins without breaking compatibility. Extend the specification to meet your needs.</p>
          </div>

          <div className={styles.benefit}>
            <Heading as="h3">Future-Proof</Heading>
            <p>Standardized I/O schema ensures workflows survive platform changes. Your automations won't break with updates.</p>
          </div>

          <div className={styles.benefit}>
            <Heading as="h3">Open Standard</Heading>
            <p>Community-driven, Apache 2.0 licensed. Anyone can implement, contribute, and shape the future of workflow automation.</p>
          </div>
        </div>

        <div className={styles.finalCTA}>
          <Heading as="h2">Join the Movement Toward Open Automation</Heading>
          <p className={styles.finalDescription}>
            OpenWorkflow is more than a spec — it's an ecosystem. Implement it in your own tools,
            publish workflows to the registry, or help shape the next version of the standard.
          </p>
          <div className={styles.ctaButtons}>
            <Link
              className="button button--primary button--lg"
              href="https://github.com/OWorkflow/OpenWorkflow-Specification">
              View on GitHub
            </Link>
            <Link
              className="button button--outline button--primary button--lg"
              to="/docs/contributing">
              Contribute
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
