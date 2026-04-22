import Link from 'next/link';

export const metadata = {
  title: 'Active Draws | Fairway Impact Rewards',
  description: 'View all active prize draws and your current entries.',
};

export default function DrawsPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '100px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-primary-container)', marginBottom: '16px' }}>
          Monthly Draws
        </span>
        <h1 style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px' }}>Active Draws</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-on-surface-variant)', maxWidth: '560px', margin: '0 auto 40px' }}>
          Every active subscription earns you an entry into this month&apos;s prize draw.
        </p>
        <Link href="/subscribe" className="btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
          Enter This Month&apos;s Draw
        </Link>
      </div>

      <div className="glass-container-xl" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏆</div>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>£250,000 Cash Prize</h2>
        <p style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-jakarta)', fontSize: '16px', marginBottom: '24px', lineHeight: 1.7 }}>
          The jackpot draw closes at midnight on the last day of each month. Match 5 numbers to win the jackpot, or match fewer for tier prizes.
        </p>
        <Link href="/dashboard" className="btn-secondary" style={{ padding: '14px 28px' }}>
          View Your Numbers →
        </Link>
      </div>
    </main>
  );
}
