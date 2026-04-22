'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  const [t, setT] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) return;
      setT({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000) / 60000),
        secs:  Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const NAV_ITEMS = [
  { id: 'overview', icon: '🏠', label: 'Dashboard' },
  { id: 'scores', icon: '⛳', label: 'Scorecard' },
  { id: 'charity', icon: '💚', label: 'Impact Stats' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState('');
  // Score form
  const [formScore, setFormScore] = useState<number | ''>('');
  const [formDate, setFormDate] = useState('');
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const countdown = useCountdown();

  // Simulated draw numbers (would come from live draw data in production)
  const myNumbers = [14, 88, 23, 9];

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [pRes, sRes, cRes] = await Promise.all([
      supabase.from('profiles').select('full_name, subscription_status, selected_charity_id').eq('id', user.id).single(),
      supabase.from('scores').select('id, score, date').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
      supabase.from('charities').select('id, name'),
    ]);
    if (pRes.data) { setProfile(pRes.data); setSelectedCharity(pRes.data.selected_charity_id ?? ''); }
    if (sRes.data) setScores(sRes.data);
    if (cRes.data) setCharities(cRes.data);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formScore || Number(formScore) < 1 || Number(formScore) > 45 || !formDate) {
      setMsg({ text: 'Enter a valid Stableford score (1–45) and date.', type: 'error' });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingScore) {
      const { error } = await supabase.from('scores').update({ score: Number(formScore), date: formDate }).eq('id', editingScore.id);
      if (error) setMsg({ text: error.message, type: 'error' });
      else { setMsg({ text: 'Score updated!', type: 'success' }); setEditingScore(null); setFormScore(''); setFormDate(''); fetchData(); }
    } else {
      const { error } = await supabase.from('scores').insert([{ user_id: user.id, score: Number(formScore), date: formDate }]);
      if (error) setMsg({ text: error.code === '23505' ? 'A score for this date already exists.' : error.message, type: 'error' });
      else { setMsg({ text: 'Score recorded! Rolling 5 logic applied.', type: 'success' }); setFormScore(''); setFormDate(''); fetchData(); }
    }
  };

  const deleteScore = async (id: string) => {
    if (!confirm('Delete this score?')) return;
    await supabase.from('scores').delete().eq('id', id);
    fetchData();
  };

  const startEdit = (s: Score) => {
    setEditingScore(s); setFormScore(s.score); setFormDate(s.date); setMsg(null); setActiveTab('scores');
  };

  const saveCharity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ selected_charity_id: selectedCharity || null }).eq('id', user.id);
    setMsg({ text: 'Charity preference saved!', type: 'success' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Golfer';
  const initials = profile?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';
  const isActive = profile?.subscription_status === 'active';

  return (
    <div className={styles.shell}>
      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userName}>{profile?.full_name || 'Member'}</div>
          <span className={`${styles.userTier} ${styles.tierGold}`}>🥇 Gold Tier</span>
        </div>

        <nav className={styles.navMenu} aria-label="Dashboard navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <Link href="/dashboard/profile" className={styles.navItem} id="nav-settings">
            <span className={styles.navIcon}>⚙️</span> Settings
          </Link>
          <a href="#" className={styles.navItem} id="nav-support">
            <span className={styles.navIcon}>❓</span> Support
          </a>
        </nav>

        <div className={styles.navSignOut}>
          <button className={styles.navItem} onClick={handleSignOut} id="nav-signout">
            <span className={styles.navIcon}>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <main className={styles.content}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            <h1 className={styles.pageTitle}>Welcome back, {firstName} 👋</h1>
            <p className={styles.pageSubtitle}>Your impact this month has supported 12 youth golf scholarships.</p>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={`glass-container ${styles.statCard}`}>
                <div className={styles.statValue}>£1,250</div>
                <div className={styles.statDiff}>+ £250 since last month</div>
                <div className={styles.statLabel}>Total Won</div>
              </div>
              <div className={`glass-container ${styles.statCard}`}>
                <div className={styles.statValue}>154</div>
                <div className={styles.statLabel}>Lives Impacted</div>
              </div>
              <div className={`glass-container ${styles.statCard}`}>
                <div className={styles.statValue}>£4,820</div>
                <div className={styles.statLabel}>Total Contribution</div>
              </div>
            </div>

            {/* Draw entry card */}
            <div className={`glass-container-xl ${styles.drawCard}`}>
              <div className={styles.drawCardHeader}>
                <div>
                  <div className={styles.drawName}>August Pro-Am Getaway</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Monthly Prize Draw</div>
                </div>
                <span className={styles.drawStatus}>● Confirmed</span>
              </div>

              <div className={styles.drawMeta}>
                <div>
                  <div className={styles.drawMetaLabel}>Your Numbers</div>
                  <div className={styles.drawNumbers}>
                    {myNumbers.map((n) => (
                      <span key={n} className={styles.drawNum}>{String(n).padStart(2, '0')}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className={styles.drawMetaLabel}>Starts In</div>
                  <div className={styles.countdown}>
                    {[
                      { n: countdown.days, l: 'Days' },
                      { n: countdown.hours, l: 'Hrs' },
                      { n: countdown.mins, l: 'Min' },
                      { n: countdown.secs, l: 'Sec' },
                    ].map(({ n, l }) => (
                      <div key={l} className={styles.countUnit}>
                        <span className={styles.countNum}>{String(n).padStart(2, '0')}</span>
                        <span className={styles.countLabel}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Impact row */}
            <div className={styles.impactRow}>
              <div className={`glass-container ${styles.impactCard}`}>
                <div className={styles.impactIcon}>🌱</div>
                <div>
                  <div className={styles.impactValue}>42 Trees</div>
                  <div className={styles.impactLabel}>Climate Action Planted</div>
                </div>
              </div>
              <div className={`glass-container ${styles.impactCard}`}>
                <div className={styles.impactIcon}>🎓</div>
                <div>
                  <div className={styles.impactValue}>12</div>
                  <div className={styles.impactLabel}>Scholarships Funded</div>
                </div>
              </div>
            </div>

            {/* Recent scores preview */}
            <div className={`glass-container-xl ${styles.scoresCard}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Recent Scores</h2>
                <button className={styles.viewAllLink} onClick={() => setActiveTab('scores')}>View All →</button>
              </div>
              <table className={styles.scoresTable}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.length === 0 ? (
                    <tr><td colSpan={3} style={{ color: 'var(--color-on-surface-variant)', padding: '24px 0', fontFamily: 'var(--font-jakarta)', fontSize: '14px' }}>No scores yet. Record your first round!</td></tr>
                  ) : scores.slice(0, 3).map((s) => (
                    <tr key={s.id}>
                      <td>Golf Course</td>
                      <td>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className={styles.scorePoints}>{s.score} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!isActive && (
              <div className={`glass-container ${styles.formCard}`} style={{ background: 'rgba(255,92,53,0.05)', border: '1px solid rgba(255,92,53,0.3)' }}>
                <h3 style={{ marginBottom: '8px' }}>Activate Your Membership</h3>
                <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '16px', fontFamily: 'var(--font-jakarta)', fontSize: '14px' }}>
                  Subscribe to enter draws, track scores, and contribute to charity.
                </p>
                <Link href="/subscribe" className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
                  Choose a Plan →
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── SCORECARD TAB ── */}
        {activeTab === 'scores' && (
          <>
            <h1 className={styles.pageTitle}>Scorecard</h1>
            <p className={styles.pageSubtitle}>Your last 5 Stableford rounds. The rolling window is automatic.</p>

            {/* Entry form */}
            <div className={`glass-container-xl ${styles.formCard}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{editingScore ? '✏️ Edit Score' : '➕ Record New Score'}</h2>
                {editingScore && (
                  <button className={styles.btnIconSmall} onClick={() => { setEditingScore(null); setFormScore(''); setFormDate(''); }}>
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={submitScore} id="score-form">
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="score-input" className={styles.inputLabel}>Stableford Points (1–45)</label>
                    <input
                      id="score-input"
                      type="number"
                      min={1} max={45}
                      value={formScore}
                      onChange={(e) => setFormScore(e.target.value ? Number(e.target.value) : '')}
                      className={styles.input}
                      placeholder="e.g. 36"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="score-date" className={styles.inputLabel}>Date of Round</label>
                    <input
                      id="score-date"
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
                <button id="score-submit" type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>
                  {editingScore ? 'Update Score' : 'Record Score'}
                </button>
              </form>

              {msg && <p className={`${styles.msg} ${msg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>{msg.text}</p>}
            </div>

            {/* Scores table */}
            <div className={`glass-container-xl ${styles.scoresCard}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Your Last 5 Scores</h2>
              </div>
              <table className={styles.scoresTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Points</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.length === 0 ? (
                    <tr><td colSpan={4} style={{ color: 'var(--color-on-surface-variant)', padding: '24px 0', fontFamily: 'var(--font-jakarta)', fontSize: '14px' }}>No scores yet.</td></tr>
                  ) : scores.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--color-on-surface-variant)' }}>#{i + 1}</td>
                      <td className={styles.scorePoints}>{s.score} pts</td>
                      <td>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <button className={styles.btnIconSmall} onClick={() => startEdit(s)}>Edit</button>
                        <button className={styles.btnIconSmall} onClick={() => deleteScore(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── CHARITY/IMPACT TAB ── */}
        {activeTab === 'charity' && (
          <>
            <h1 className={styles.pageTitle}>Impact Stats</h1>
            <p className={styles.pageSubtitle}>Your subscription is making a real difference in these causes.</p>

            {/* Charity selector */}
            <div className={`glass-container-xl ${styles.charityCard}`}>
              <h2 className={styles.cardTitle} style={{ marginBottom: '16px' }}>Your Charity</h2>
              <label htmlFor="charity-select" className={styles.inputLabel}>Select your charity recipient</label>
              <select
                id="charity-select"
                className={styles.charitySelect}
                value={selectedCharity}
                onChange={(e) => setSelectedCharity(e.target.value)}
              >
                <option value="">Choose a charity...</option>
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button id="save-charity" className="btn-primary" style={{ padding: '12px 24px' }} onClick={saveCharity}>
                Save Preference
              </button>
            </div>

            {/* Impact breakdown */}
            <div className={styles.impactRow}>
              <div className={`glass-container ${styles.impactCard}`}>
                <div className={styles.impactIcon}>🌱</div>
                <div>
                  <div className={styles.impactValue}>42 Trees</div>
                  <div className={styles.impactLabel}>Planted via Climate Action</div>
                </div>
              </div>
              <div className={`glass-container ${styles.impactCard}`}>
                <div className={styles.impactIcon}>🎓</div>
                <div>
                  <div className={styles.impactValue}>12</div>
                  <div className={styles.impactLabel}>Scholarships Funded</div>
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
