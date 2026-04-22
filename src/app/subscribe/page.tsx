'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './subscribe.module.css';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    amount: 15,
    period: '/mo',
    saving: '',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    features: [
      'Enter up to 5 Stableford scores',
      'Monthly prize draw entry',
      'Choose your charity recipient',
      'Member dashboard access',
      'Draw results & winnings history',
    ],
    featured: false,
  },
  {
    id: 'yearly',
    name: 'Annual',
    amount: 144,
    period: '/yr',
    saving: 'Save £36 vs. monthly — 2 months free!',
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly',
    features: [
      'All Monthly features included',
      '12 monthly draw entries',
      'Priority winner verification',
      'Charity impact annual report',
      'Early access to platform features',
    ],
    featured: true,
  },
];

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? null);
        setUserId(data.user.id);
      }
    });
  }, []);

  const handleSubscribe = async (priceId: string, planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId, email: userEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Could not initiate checkout. Please try again.');
      }
    } catch {
      alert('Error connecting to payment service.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Membership</span>
        <h1 className={styles.title}>Choose Your Impact</h1>
        <p className={styles.subtitle}>
          Every subscription funds a charity draw, contributes to a prize pool, and lets you track your Stableford performance — all in one place.
        </p>
      </header>

      <div className={styles.grid}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`glass-container-xl ${styles.card} ${plan.featured ? styles.cardFeatured : ''}`}
          >
            {plan.featured && <span className={styles.badge}>Most Popular</span>}
            <p className={styles.planName}>{plan.name}</p>
            <div className={styles.price}>
              <span className={styles.currency}>£</span>
              <span className={styles.amount}>{plan.amount}</span>
              <span className={styles.period}>{plan.period}</span>
            </div>
            <p className={styles.saving}>{plan.saving || '\u00A0'}</p>

            <ul className={styles.features}>
              {plan.features.map((f, i) => (
                <li key={i} className={styles.feature}>
                  <span className={styles.featureIcon} aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              id={`subscribe-${plan.id}`}
              className={`btn-primary ${styles.ctaBtn}`}
              onClick={() => handleSubscribe(plan.priceId, plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id ? 'Redirecting...' : `Join ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className={`glass-container ${styles.charitySection}`}>
        <h2 className={styles.charityTitle}>Your money does more</h2>
        <p className={styles.charityText}>
          <span className={styles.charityHighlight}>20% of every subscription</span> is pooled and distributed to your chosen charity each month. You choose who benefits. We ensure it gets there.
        </p>
      </div>
    </div>
  );
}
