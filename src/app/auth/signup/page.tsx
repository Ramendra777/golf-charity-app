'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import styles from '../auth.module.css';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Create profile record
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'user',
        subscription_status: 'inactive',
      });
      setSuccess('Account created! Please check your email to confirm, then subscribe to access the platform.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={`glass-container-xl ${styles.card}`}>
        <div className={styles.logo}>
          Fairway<span className={styles.logoAccent}>Impact</span>
        </div>
        <p className={styles.subtitle}>Join the movement. Golf with purpose.</p>

        <h1 className={styles.title}>Create Account</h1>

        <form onSubmit={handleSignup} id="signup-form">
          <div className={styles.inputGroup}>
            <label htmlFor="fullName" className={styles.label}>Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.input}
              placeholder="Alex Johnson"
              required
              autoComplete="name"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="signup-email" className={styles.label}>Email Address</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="signup-password" className={styles.label}>Password (min 8 chars)</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
          {success && <p className={styles.successMsg}>{success}</p>}

          {!success && (
            <button
              id="signup-submit"
              type="submit"
              className={`btn-primary ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          )}

          {success && (
            <Link href="/subscribe" className={`btn-primary ${styles.submitBtn}`} style={{ display: 'block', textAlign: 'center' }}>
              Choose Your Plan →
            </Link>
          )}
        </form>

        <p className={styles.switchLink}>
          Already have an account?{' '}
          <Link href="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
