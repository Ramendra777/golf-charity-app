'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
        Fairway<span className={styles.logoAccent}>Impact</span>
      </Link>

      {/* Desktop links */}
      <ul className={styles.links}>
        <li><Link href="/draws" className={styles.link}>Draws</Link></li>
        <li><Link href="/impact" className={styles.link}>Impact</Link></li>
        <li><Link href="/leaderboard" className={styles.link}>Leaderboard</Link></li>
        <li><Link href="/rules" className={styles.link}>Rules</Link></li>
      </ul>

      {/* Auth actions */}
      <div className={styles.actions}>
        {user ? (
          <>
            <Link href="/dashboard" className={styles.dashLink}>Dashboard</Link>
            <button onClick={handleSignOut} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className={styles.link}>Sign In</Link>
            <Link href="/subscribe" className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
              Join Now
            </Link>
          </>
        )}
        <button
          className={styles.mobileToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className={styles.mobileMenu} onClick={() => setMenuOpen(false)}>
          <Link href="/draws" className={styles.mobileLink}>Draws</Link>
          <Link href="/impact" className={styles.mobileLink}>Impact</Link>
          <Link href="/leaderboard" className={styles.mobileLink}>Leaderboard</Link>
          <Link href="/rules" className={styles.mobileLink}>Rules</Link>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.mobileLink}>Dashboard</Link>
              <button onClick={handleSignOut} className={styles.mobileLink} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={styles.mobileLink}>Sign In</Link>
              <Link href="/subscribe" className={styles.mobileLink}>Join Now</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
