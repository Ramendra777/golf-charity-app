'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './admin.module.css';

type Tab = 'analytics' | 'users' | 'draw' | 'charities' | 'winners';

interface UserRow { id: string; full_name: string; email: string; subscription_status: string; }
interface WinnerRow { id: string; user_id: string; match_type: string; amount_won: number; payout_completed: boolean; proof_url: string | null; }
interface CharityRow { id: string; name: string; description: string; total_contributed: number; }
interface SimResult { winningNumbers: number[]; simulatedMatches: Record<string, number>; jackpotStatus: string; }

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [charities, setCharities] = useState<CharityRow[]>([]);
  const [drawLogic, setDrawLogic] = useState<'RANDOM' | 'ALGORITHMIC'>('RANDOM');
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [newCharity, setNewCharity] = useState({ name: '', description: '', media_url: '', impact_statement: '' });
  const [adminMsg, setAdminMsg] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalCharity: 0, prizePool: 0 });

  const fetchAll = useCallback(async () => {
    const [usersRes, winnersRes, charitiesRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, subscription_status').order('created_at', { ascending: false }),
      supabase.from('winners').select('id, user_id, match_type, amount_won, payout_completed, proof_url').order('created_at', { ascending: false }),
      supabase.from('charities').select('id, name, description, total_contributed'),
    ]);
    if (usersRes.data) {
      setUsers(usersRes.data);
      const active = usersRes.data.filter((u) => u.subscription_status === 'active').length;
      setStats((s) => ({ ...s, totalUsers: usersRes.data!.length, activeUsers: active, prizePool: active * 12 }));
    }
    if (winnersRes.data) setWinners(winnersRes.data);
    if (charitiesRes.data) {
      setCharities(charitiesRes.data);
      const total = charitiesRes.data.reduce((acc, c) => acc + Number(c.total_contributed), 0);
      setStats((s) => ({ ...s, totalCharity: total }));
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const runSimulation = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/admin/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EXECUTE_DRAW', month: new Date().toISOString(), logicType: drawLogic, testMode: true }),
      });
      const data = await res.json();
      if (data.success) setSimResult(data);
    } catch {
      setAdminMsg('Simulation failed.');
    } finally {
      setSimLoading(false);
    }
  };

  const publishDraw = async () => {
    if (!confirm('Publish this month\'s official draw? This cannot be undone.')) return;
    const res = await fetch('/api/admin/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'EXECUTE_DRAW', month: new Date().toISOString(), logicType: drawLogic, testMode: false }),
    });
    const data = await res.json();
    setAdminMsg(data.success ? `Draw published! ID: ${data.drawId}` : `Error: ${data.error}`);
  };

  const addCharity = async () => {
    if (!newCharity.name) { setAdminMsg('Charity name is required.'); return; }
    const { error } = await supabase.from('charities').insert([newCharity]);
    if (error) setAdminMsg(`Error: ${error.message}`);
    else { setAdminMsg('Charity added successfully.'); setNewCharity({ name: '', description: '', media_url: '', impact_statement: '' }); fetchAll(); }
  };

  const deleteCharity = async (id: string) => {
    if (!confirm('Delete this charity?')) return;
    await supabase.from('charities').delete().eq('id', id);
    fetchAll();
  };

  const markPaid = async (id: string) => {
    await supabase.from('winners').update({ payout_completed: true }).eq('id', id);
    fetchAll();
  };

  const suspendUser = async (id: string) => {
    await supabase.from('profiles').update({ subscription_status: 'canceled' }).eq('id', id);
    fetchAll();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'users', label: '👥 Users' },
    { id: 'draw', label: '🎯 Draw Engine' },
    { id: 'charities', label: '💚 Charities' },
    { id: 'winners', label: '🏆 Winners' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Control Centre</h1>
          <p className={styles.subtitle}>Manage users, draws, charities, and verify winners.</p>
        </div>
      </header>

      {/* Quick Stats always visible */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total Users', value: stats.totalUsers },
          { label: 'Active Members', value: stats.activeUsers },
          { label: 'Prize Pool (£)', value: stats.prizePool.toLocaleString() },
          { label: 'Charity Raised (£)', value: stats.totalCharity.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className={`glass-container ${styles.statCard}`}>
            <div className={styles.statValue}>{value}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`admin-tab-${t.id}`}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {adminMsg && <p className={`${styles.msg} ${styles.msgSuccess}`}>{adminMsg}</p>}

      {/* ═══ ANALYTICS ═══ */}
      {activeTab === 'analytics' && (
        <div className={`glass-container-xl ${styles.panel}`}>
          <h2 className={styles.panelTitle}>Platform Overview</h2>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr><th>Metric</th><th>Value</th></tr>
            </thead>
            <tbody>
              {[
                { m: 'Total Registered Users', v: stats.totalUsers },
                { m: 'Active Subscribers', v: stats.activeUsers },
                { m: 'Monthly Prize Pool (£)', v: `£${stats.prizePool.toLocaleString()}` },
                { m: 'Total Charity Contributions (£)', v: `£${stats.totalCharity.toLocaleString()}` },
                { m: 'Total Charities Supported', v: charities.length },
                { m: 'Pending Winner Payouts', v: winners.filter((w) => !w.payout_completed).length },
              ].map(({ m, v }) => (
                <tr key={m} className={styles.tableRow}>
                  <td>{m}</td>
                  <td className={styles.statusActive}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ USERS ═══ */}
      {activeTab === 'users' && (
        <div className={`glass-container-xl ${styles.panel}`}>
          <h2 className={styles.panelTitle}>User & Subscription Management</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-jakarta)' }}>No users yet.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className={styles.tableRow}>
                    <td>{u.full_name || 'N/A'}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={u.subscription_status === 'active' ? styles.statusActive : styles.statusInactive}>
                        {u.subscription_status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnSmall}>Edit Scores</button>
                        <button className={`${styles.btnSmall} ${styles.btnDanger}`} onClick={() => suspendUser(u.id)}>Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ DRAW ENGINE ═══ */}
      {activeTab === 'draw' && (
        <div className={`glass-container-xl ${styles.panel}`}>
          <h2 className={styles.panelTitle}>Draw Engine Configuration</h2>

          <div className={styles.drawConfig}>
            <div>
              <div className={styles.configGroup}>
                <label htmlFor="draw-logic" className={styles.configLabel}>Draw Logic</label>
                <select id="draw-logic" className={styles.select} value={drawLogic} onChange={(e) => setDrawLogic(e.target.value as 'RANDOM' | 'ALGORITHMIC')}>
                  <option value="RANDOM">Random Generation</option>
                  <option value="ALGORITHMIC">Algorithmic (Score Weighted)</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.drawActions}>
            <button id="run-simulation" className="btn-secondary" onClick={runSimulation} disabled={simLoading}>
              {simLoading ? 'Simulating...' : '🔍 Run Simulation'}
            </button>
            <button id="publish-draw" className="btn-primary" onClick={publishDraw}>
              📢 Publish Official Draw
            </button>
          </div>

          {simResult && (
            <div className={styles.simResult}>
              <div className={styles.simResultTitle}>Simulation Result (Test Mode)</div>
              <p>Winning Numbers: <strong>{simResult.winningNumbers.join(', ')}</strong></p>
              <p>5-Match Winners: <strong>{simResult.simulatedMatches['5-Match']}</strong></p>
              <p>4-Match Winners: <strong>{simResult.simulatedMatches['4-Match']}</strong></p>
              <p>3-Match Winners: <strong>{simResult.simulatedMatches['3-Match']}</strong></p>
              <p>Jackpot: <strong>{simResult.jackpotStatus}</strong></p>
            </div>
          )}
        </div>
      )}

      {/* ═══ CHARITIES ═══ */}
      {activeTab === 'charities' && (
        <div className={`glass-container-xl ${styles.panel}`}>
          <h2 className={styles.panelTitle}>Charity Management</h2>

          <div className={styles.charityForm}>
            <div>
              <label className={styles.configLabel}>Charity Name *</label>
              <input id="charity-name" className={styles.formInput} value={newCharity.name} onChange={(e) => setNewCharity({ ...newCharity, name: e.target.value })} placeholder="Organisation name" />
            </div>
            <div>
              <label className={styles.configLabel}>Media URL</label>
              <input id="charity-media" className={styles.formInput} value={newCharity.media_url} onChange={(e) => setNewCharity({ ...newCharity, media_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className={styles.formInputFull}>
              <label className={styles.configLabel}>Description</label>
              <input id="charity-desc" className={styles.formInput} value={newCharity.description} onChange={(e) => setNewCharity({ ...newCharity, description: e.target.value })} placeholder="Brief description of the charity's mission" />
            </div>
            <div className={styles.formInputFull}>
              <label className={styles.configLabel}>Impact Statement</label>
              <input id="charity-impact" className={styles.formInput} value={newCharity.impact_statement} onChange={(e) => setNewCharity({ ...newCharity, impact_statement: e.target.value })} placeholder="How does this charity use the funds?" />
            </div>
          </div>
          <button id="add-charity" className="btn-primary" style={{ marginBottom: '32px' }} onClick={addCharity}>Add Charity</button>

          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr><th>Name</th><th>Total Contributed</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {charities.map((c) => (
                <tr key={c.id} className={styles.tableRow}>
                  <td>{c.name}</td>
                  <td>£{Number(c.total_contributed).toLocaleString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={`${styles.btnSmall} ${styles.btnDanger}`} onClick={() => deleteCharity(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ WINNERS ═══ */}
      {activeTab === 'winners' && (
        <div className={`glass-container-xl ${styles.panel}`}>
          <h2 className={styles.panelTitle}>Winner Verification & Payouts</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr><th>Match Type</th><th>Amount Won</th><th>Proof</th><th>Payout</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {winners.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-jakarta)' }}>No winners recorded yet.</td></tr>
                ) : winners.map((w) => (
                  <tr key={w.id} className={styles.tableRow}>
                    <td>{w.match_type}</td>
                    <td>£{w.amount_won}</td>
                    <td>
                      {w.proof_url
                        ? <a href={w.proof_url} target="_blank" rel="noreferrer" className={styles.statusActive}>View Proof</a>
                        : <span className={styles.statusPending}>Awaiting</span>}
                    </td>
                    <td>
                      <span className={w.payout_completed ? styles.statusActive : styles.statusPending}>
                        {w.payout_completed ? 'Paid ✓' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!w.payout_completed && (
                        <button className={styles.btnSmall} onClick={() => markPaid(w.id)}>Mark Paid</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
