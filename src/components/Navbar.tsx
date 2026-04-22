'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
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
      <Link href="/" className={styles.logo}>
        Fairway<span className={styles.logoAccent}>Impact</span>
      </Link>

      <ul className={styles.links}>
        <li><Link href="/impact" className={styles.link}>Charities</Link></li>
        <li><Link href="/subscribe" className={styles.link}>Plans</Link></li>
        {user && <li><Link href="/dashboard" className={styles.link}>Dashboard</Link></li>}
      </ul>

      <div className={styles.actions}>
        {user ? (
          <>
            <Link href="/dashboard/profile" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              My Account
            </Link>
            <button onClick={handleSignOut} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className={styles.link}>Sign In</Link>
            <Link href="/subscribe" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Join Now
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
