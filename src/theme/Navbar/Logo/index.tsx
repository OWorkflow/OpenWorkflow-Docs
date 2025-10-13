import React from 'react';
import Logo from '@theme-original/Navbar/Logo';
import type LogoType from '@theme/Navbar/Logo';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof LogoType>;

export default function LogoWrapper(props: Props): JSX.Element {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '0.1rem'}}>
      <Logo {...props} />
      <b className="navbar__title navbar__brand-text" style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '1.3rem',
        letterSpacing: '-0.01em',
        lineHeight: 1,
      }}>
        <strong style={{fontWeight: 700}}>Open</strong>
        <span style={{fontWeight: 400}}>Workflow</span>
      </b>
    </div>
  );
}
