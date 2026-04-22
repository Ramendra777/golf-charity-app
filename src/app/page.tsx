import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Fairway Impact Rewards | Golf. Charity. Win.',
  description: 'A modern subscription platform combining golf performance tracking, monthly prize draws, and seamless charity fundraising.',
};

const HOW_IT_WORKS = [
  { step: '01', title: 'Subscribe', desc: 'Choose a monthly or yearly plan and unlock the full platform.' },
  { step: '02', title: 'Score', desc: 'Enter your Stableford results. We keep your rolling top 5, automatically.' },
  { step: '03', title: 'Draw', desc: 'Every month, scores enter the draw engine. Match numbers, win prizes.' },
  { step: '04', title: 'Impact', desc: '20% of every subscription goes directly to your chosen charity.' },
];

const STATS = [
  { value: '2,140', label: 'Active Members' },
  { value: '£108K', label: 'Charity Raised' },
  { value: '£54K', label: 'Prizes Distributed' },
  { value: '6', label: 'Charities Supported' },
];

export default function Home() {
  return (
    <main className={styles.main}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <span className={styles.eyebrow}>Golf. Charity. Win.</span>
        <h1 className={styles.heroTitle}>
          The Modern<br />Philanthropist
        </h1>
        <p className={styles.heroSubtitle}>
          Track your Stableford performance, compete in monthly prize draws, and fund causes that actually matter — all in one place.
        </p>
        <div className={styles.heroCTAs}>
          <Link href="/subscribe" id="hero-cta-subscribe" className="btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
            Start Your Journey
          </Link>
          <Link href="/impact" id="hero-cta-impact" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '16px' }}>
            See the Impact →
          </Link>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.statItem}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.howSection}>
        <span className={styles.eyebrow} style={{ display: 'block', textAlign: 'center', marginBottom: '16px' }}>How It Works</span>
        <h2 className={styles.sectionTitle}>Four steps. Infinite impact.</h2>
        <div className={styles.stepsGrid}>
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className={`glass-container ${styles.stepCard}`}>
              <span className={styles.stepNum}>{step}</span>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHARITY PREVIEW ── */}
      <section className={styles.charitySection}>
        <div className={styles.charitySectionInner}>
          <div>
            <span className={styles.eyebrow}>Charity Integration</span>
            <h2 className={styles.sectionTitle} style={{ fontSize: '40px', marginTop: '12px' }}>
              You choose who wins most.
            </h2>
            <p className={styles.charityText}>
              Every subscription allocates 20% to charities you select. Our platform tracks, pools, and distributes these funds with full transparency. Your swing funds real change.
            </p>
            <Link href="/impact" className="btn-secondary" style={{ display: 'inline-block', marginTop: '24px', padding: '14px 28px' }}>
              Explore Charities
            </Link>
          </div>
          <div className={styles.charityCards}>
            {['💧 Clean Water', '📚 Education', '🌱 Reforestation'].map((c) => (
              <div key={c} className={`glass-container ${styles.miniCharityCard}`}>{c}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={styles.finalCTA}>
        <div className={`glass-container-xl ${styles.finalCTABox}`}>
          <h2 className={styles.finalTitle}>Ready to play with purpose?</h2>
          <p className={styles.finalText}>Join thousands of golfers making a difference with every round they play.</p>
          <Link href="/subscribe" id="bottom-cta" className="btn-primary" style={{ padding: '18px 40px', fontSize: '17px' }}>
            Subscribe Now
          </Link>
        </div>
      </section>
    </main>
  );
}
