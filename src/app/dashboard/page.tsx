'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './dashboard.module.css';

interface Score {
  id: string;
  score: number;
  date: string;
}

interface Profile {
  full_name: string;
  subscription_status: string;
  selected_charity_id: string | null;
}

interface Charity {
  id: string;
  name: string;
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calcTime = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
      const diff = endOfMonth.getTime() - now.getTime();
      if (diff <= 0) return;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, mins, secs });
    };
    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState('');
  const [score, setScore] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [loadingScores, setLoadingScores] = useState(true);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const countdown = useCountdown();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, scoresRes, charitiesRes] = await Promise.all([
      supabase.from('profiles').select('full_name, subscription_status, selected_charity_id').eq('id', user.id).single(),
      supabase.from('scores').select('id, score, date').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
      supabase.from('charities').select('id, name'),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setSelectedCharity(profileRes.data.selected_charity_id ?? '');
    }
    if (scoresRes.data) setScores(scoresRes.data);
    if (charitiesRes.data) setCharities(charitiesRes.data);
    setLoadingScores(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || Number(score) < 1 || Number(score) > 45 || !date) {
      setMsg({ text: 'Valid Stableford score (1–45) and date required.', type: 'error' });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingScore) {
      // Update existing score
      const { error } = await supabase.from('scores').update({ score: Number(score), date }).eq('id', editingScore.id);
      if (error) {
        setMsg({ text: error.code === '23505' ? 'A score for this date already exists.' : error.message, type: 'error' });
      } else {
        setMsg({ text: 'Score updated successfully.', type: 'success' });
        setEditingScore(null);
        setScore(''); setDate('');
        fetchData();
      }
    } else {
      // Insert new score (trigger handles rolling 5 logic)
      const { error } = await supabase.from('scores').insert([{ user_id: user.id, score: Number(score), date }]);
      if (error) {
        setMsg({ text: error.code === '23505' ? 'You already have a score for this date.' : error.message, type: 'error' });
      } else {
        setMsg({ text: 'Score recorded! Only your latest 5 are kept.', type: 'success' });
        setScore(''); setDate('');
        fetchData();
      }
    }
  };

  const deleteScore = async (id: string) => {
    if (!confirm('Delete this score?')) return;
    await supabase.from('scores').delete().eq('id', id);
    fetchData();
  };

  const startEdit = (s: Score) => {
    setEditingScore(s);
    setScore(s.score);
    setDate(s.date);
    setMsg(null);
  };

  const saveCharity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedCharity) return;
    await supabase.from('profiles').update({ selected_charity_id: selectedCharity }).eq('id', user.id);
    setMsg({ text: 'Charity preference saved!', type: 'success' });
  };

  const isActive = profile?.subscription_status === 'active';

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className={styles.subText}>Track your scores, impact, and draws from here.</p>
        </div>
        <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeInactive}`}>
          <span className={styles.badgeDot} />
          {isActive ? 'Active Member' : 'No Active Plan'}
        </span>
      </header>

      <div className={styles.mainGrid}>
        {/* ── Score Entry ── */}
        <section className={`glass-container-xl ${styles.card}`}>
          <h2 className={styles.cardTitle}>{editingScore ? '✏️ Edit Score' : '➕ Record Score'}</h2>
          <form onSubmit={submitScore} id="score-form">
            <div className={styles.inputGroup}>
              <label htmlFor="score-input" className={styles.label}>Stableford Points (1 – 45)</label>
              <input
                id="score-input"
                type="number"
                min={1} max={45}
                value={score}
                onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
                className={styles.input}
                placeholder="e.g. 34"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="score-date" className={styles.label}>Date of Round</label>
              <input
                id="score-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formFooter}>
              <button id="score-submit" type="submit" className={`btn-primary ${styles.submitBtn}`}>
                {editingScore ? 'Update Score' : 'Record Score'}
              </button>
              {editingScore && (
                <button type="button" className="btn-secondary" onClick={() => { setEditingScore(null); setScore(''); setDate(''); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          {msg && (
            <p className={`${styles.msg} ${msg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
              {msg.text}
            </p>
          )}
        </section>

        {/* ── Score History ── */}
        <section className={`glass-container-xl ${styles.card}`}>
          <h2 className={styles.cardTitle}>🏌️ Your Last 5 Scores</h2>
          {loadingScores ? (
            <p className={styles.scoreEmpty}>Loading scores...</p>
          ) : scores.length === 0 ? (
            <p className={styles.scoreEmpty}>No scores yet. Record your first round!</p>
          ) : (
            <div className={styles.scoreList}>
              {scores.map((s, i) => (
                <div key={s.id} className={styles.scoreItem}>
                  <div className={styles.scoreDetails}>
                    <span className={styles.scorePts}>{s.score} pts</span>
                    <span className={styles.scoreDate}>
                      {i === 0 && '⭐ Latest — '}
                      {new Date(s.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className={styles.scoreActions}>
                    <button className={styles.btnIconSmall} onClick={() => startEdit(s)} title="Edit score">Edit</button>
                    <button className={styles.btnIconSmall} onClick={() => deleteScore(s.id)} title="Delete score">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Charity Selection ── */}
        <section className={`glass-container-xl ${styles.card}`}>
          <h2 className={styles.cardTitle}>💚 Your Charity</h2>
          <div className={styles.inputGroup}>
            <label htmlFor="charity-select" className={styles.label}>Select your charity</label>
            <select
              id="charity-select"
              className={styles.charitySelect}
              value={selectedCharity}
              onChange={(e) => setSelectedCharity(e.target.value)}
            >
              <option value="">-- Choose a charity --</option>
              {charities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button id="save-charity" className="btn-primary" style={{ padding: '12px 24px' }} onClick={saveCharity}>
            Save Preference
          </button>
        </section>

        {/* ── Draw Countdown & Winnings ── */}
        <section className={`glass-container-xl ${styles.card}`}>
          <h2 className={styles.cardTitle}>🎯 Monthly Draw</h2>
          <p className={styles.subText} style={{ marginBottom: '16px' }}>Next draw closes at end of month:</p>

          <div className={styles.countdown}>
            {[
              { num: countdown.days, label: 'Days' },
              { num: countdown.hours, label: 'Hrs' },
              { num: countdown.mins, label: 'Mins' },
              { num: countdown.secs, label: 'Secs' },
            ].map(({ num, label }) => (
              <div key={label} className={styles.countdownUnit}>
                <span className={styles.countdownNum}>{String(num).padStart(2, '0')}</span>
                <span className={styles.countdownLabel}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
            {[
              { label: 'Total Winnings', value: '£0.00' },
              { label: 'Last Draw Result', value: 'No match yet' },
              { label: 'Current Month Status', value: isActive ? 'Entered ✓' : 'Inactive' },
            ].map(({ label, value }) => (
              <div key={label} className={styles.statRow}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statValue}>{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
