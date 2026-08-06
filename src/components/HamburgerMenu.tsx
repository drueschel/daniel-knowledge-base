'use client';

import React from 'react';
import { useMobileMenu } from './MobileMenuContext';
import styles from './HamburgerMenu.module.css';

export default function HamburgerMenu() {
  const { toggle } = useMobileMenu();

  return (
    <button className={styles.hamburgerBtn} onClick={toggle} aria-label="Toggle Menu">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </button>
  );
}
