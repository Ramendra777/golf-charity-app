export const metadata = {
  title: 'Rules & How It Works | Fairway Impact Rewards',
  description: 'Understand how scoring, draws, and charitable contributions work on Fairway Impact Rewards.',
};

const RULES = [
  { num: '01', title: 'Subscription Required', body: 'All participants must hold an active monthly or annual subscription. Subscriptions auto-renew and can be cancelled at any time.' },
  { num: '02', title: 'Stableford Scoring', body: 'Enter your Stableford score (1–45 points) for each round. Only your 5 most recent scores are retained — older ones roll off automatically.' },
  { num: '03', title: 'Draw Entry', body: 'Active subscribers are automatically entered into the monthly draw. Each subscription tier earns one entry per billing period.' },
  { num: '04', title: 'Draw Mechanics', body: 'Five winning numbers (1–45) are drawn. Your scores are matched against the winning numbers. Match 5 = Jackpot. Match 4 = Tier 2. Match 3 = Tier 3.' },
  { num: '05', title: 'Jackpot Rollover', body: 'If no 5-match winner is found in any month, the jackpot rolls over and accumulates until claimed.' },
  { num: '06', title: 'Charity Allocation', body: '20% of every subscription is pooled and distributed monthly to charities selected by members. Allocations are confirmed each billing cycle.' },
  { num: '07', title: 'Winner Verification', body: 'Winners must verify their identity and score submissions. Admins review proof before payouts are processed.' },
];

export default function RulesPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '100px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-primary-container)', marginBottom: '16px' }}>
          Transparency
        </span>
        <h1 style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px' }}>Rules &amp; How It Works</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-on-surface-variant)', maxWidth: '540px', margin: '0 auto' }}>
          Everything you need to know about subscriptions, draws, and our charitable mission.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {RULES.map((r) => (
          <div key={r.num} className="glass-container" style={{ padding: '28px 32px', display: 'flex', gap: '24px' }}>
            <span style={{ fontFamily: 'var(--font-epilogue)', fontSize: '28px', fontWeight: 900, color: 'var(--color-primary-container)', opacity: 0.7, flexShrink: 0 }}>{r.num}</span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{r.title}</h2>
              <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '15px', color: 'var(--color-on-surface-variant)', lineHeight: 1.7 }}>{r.body}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
