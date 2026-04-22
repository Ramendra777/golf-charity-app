export const metadata = {
  title: 'Leaderboard | Fairway Impact Rewards',
  description: 'See the top-scoring members on the Fairway Impact Rewards leaderboard.',
};

const MOCK = [
  { rank: 1, name: 'James Sterling', tier: '🥇 Gold', avg: 38.4, impact: '£4,820' },
  { rank: 2, name: 'Elena Rodriguez', tier: '🥇 Gold', avg: 36.8, impact: '£3,200' },
  { rank: 3, name: 'Raj Patel', tier: '🥈 Silver', avg: 35.2, impact: '£2,100' },
  { rank: 4, name: 'Sarah McKenna', tier: '🥈 Silver', avg: 34.7, impact: '£1,800' },
  { rank: 5, name: 'Tom Weston', tier: '🥉 Bronze', avg: 32.1, impact: '£980' },
];

export default function LeaderboardPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '100px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-secondary-container)', marginBottom: '16px' }}>
          Rankings
        </span>
        <h1 style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px' }}>Leaderboard</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-on-surface-variant)', maxWidth: '520px', margin: '0 auto' }}>
          Top performers ranked by average Stableford score and charitable impact.
        </p>
      </div>

      <div className="glass-container-xl" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['#', 'Member', 'Tier', 'Avg Score', 'Contribution'].map((h) => (
                <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK.map((m) => (
              <tr key={m.rank} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 800, color: m.rank <= 3 ? 'var(--color-gold)' : 'var(--color-on-surface-variant)' }}>{m.rank}</td>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{m.name}</td>
                <td style={{ padding: '16px 24px', fontFamily: 'var(--font-jakarta)', fontSize: '13px' }}>{m.tier}</td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--color-secondary-container)' }}>{m.avg}</td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--color-primary-container)' }}>{m.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
