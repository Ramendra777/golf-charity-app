'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './profile.module.css';

interface Profile {
  full_name: string;
  email: string;
  subscription_status: string;
  stripe_customer_id: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase
        .from('profiles')
        .select('full_name, email, subscription_status, stripe_customer_id')
        .eq('id', data.user.id)
        .single();
      if (p) {
        setProfile(p);
        setFullName(p.full_name ?? '');
      }
    });
  }, []);

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    setMsg('Profile updated successfully.');
  };

  const handleCancelSubscription = () => {
    alert('To cancel your subscription, please contact support or manage via the Stripe customer portal (coming soon).');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Account Settings</h1>
      <p className={styles.subtitle}>Manage your profile, subscription, and preferences.</p>

      {/* Profile Details */}
      <section className={`glass-container-xl ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Personal Information</h2>

        <div className={styles.inputGroup}>
          <label htmlFor="profile-name" className={styles.label}>Full Name</label>
          <input
            id="profile-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="profile-email" className={styles.label}>Email Address</label>
          <input
            id="profile-email"
            type="email"
            value={profile?.email ?? ''}
            className={styles.inputReadonly}
            readOnly
          />
        </div>

        <button id="save-profile" className={`btn-primary ${styles.saveBtn}`} onClick={saveProfile}>
          Save Changes
        </button>

        {msg && <p className={`${styles.msg} ${styles.msgSuccess}`}>{msg}</p>}
      </section>

      {/* Subscription Status */}
      <section className={`glass-container-xl ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Subscription</h2>

        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Status</span>
          <span className={styles.statusValue}>
            {profile?.subscription_status === 'active' ? '✓ Active' : profile?.subscription_status ?? 'Inactive'}
          </span>
        </div>

        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Stripe Customer</span>
          <span className={styles.statusValue}>
            {profile?.stripe_customer_id ? 'Linked ✓' : 'Not linked'}
          </span>
        </div>

        {profile?.subscription_status !== 'active' && (
          <a href="/subscribe" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', padding: '12px 24px', fontSize: '14px' }}>
            Subscribe Now
          </a>
        )}
      </section>

      {/* Danger Zone */}
      <section className={`glass-container-xl ${styles.dangerZone}`}>
        <h2 className={styles.dangerTitle}>Danger Zone</h2>
        <p className={styles.dangerText}>
          Cancelling your subscription will remove your access to draws, score tracking, and charity contributions at the end of the current billing period.
        </p>
        <button id="cancel-subscription" className={styles.dangerBtn} onClick={handleCancelSubscription}>
          Cancel Subscription
        </button>
      </section>
    </div>
  );
}
