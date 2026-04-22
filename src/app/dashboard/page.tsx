'use client';

import { useState } from 'react';
import styles from './dashboard.module.css';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const [score, setScore] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const submitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || score < 1 || score > 45 || !date) {
      setStatusMsg('Please enter a valid Stableford score (1-45) and date.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatusMsg('You must be logged in.');
      return;
    }

    const { error } = await supabase.from('scores').insert([
      { user_id: user.id, score: Number(score), date }
    ]);

    if (error) {
      if (error.code === '23505') {
         setStatusMsg('You already have a score recorded for this date.');
      } else {
         setStatusMsg('Error saving score.');
      }
    } else {
      setStatusMsg('Score recorded! Rolling logic applied.');
      setScore('');
      setDate('');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={`${styles.title} font-epilogue`}>Member Dashboard</h1>
        <p className="text-on-surface-variant font-jakarta">Track your impact and performance.</p>
      </header>

      <div className={styles.grid}>
        {/* Score Entry Card */}
        <section className={`glass-container ${styles.card}`}>
          <h2 className={`${styles.cardTitle} font-epilogue`}>Enter Recent Score</h2>
          <form onSubmit={submitScore}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Stableford Points (1-45)</label>
              <input 
                type="number" 
                min="1" max="45" 
                value={score}
                onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
                className={styles.input} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Date of Round</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input} 
                required 
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-4">Record Score</button>
            {statusMsg && <p className="mt-4 text-sm text-secondary">{statusMsg}</p>}
          </form>
        </section>

        {/* Status Card */}
        <section className={`glass-container ${styles.card}`}>
          <h2 className={`${styles.cardTitle} font-epilogue`}>Your Winnings & Status</h2>
          <p className="font-jakarta mb-4 text-on-surface-variant">Membership: <span className="text-secondary font-bold">Active</span></p>
          <div className={styles.scoreList}>
             <div className={styles.scoreItem}>
                <span className="font-bold">Latest Draw</span>
                <span className="text-on-surface-variant">No match yet.</span>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
