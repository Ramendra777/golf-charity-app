import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Fairway Impact Rewards | Play for the Win. Support the Cause.',
  description: 'Join an exclusive movement where your passion for golf fuels real-world change. Win life-changing prizes while funding global initiatives.',
};

const STEPS = [
  { num: '01', icon: '🎯', title: 'Subscribe', desc: 'Choose your tier and join the Fairway Impact community. Your subscription directly funds our partner charities.' },
  { num: '02', icon: '⛳', title: 'Play', desc: 'Upload your scores, participate in exclusive events, and earn entries into our massive monthly prize draws.' },
  { num: '03', icon: '🌍', title: 'Impact', desc: 'Watch your contribution change lives. Track real-time impact metrics and celebrate global wins together.' },
];

const PRIZE_TIERS = [
  { label: 'TIER 1', name: 'Luxury Swiss Watch', value: '£12,500' },
  { label: 'TIER 2', name: 'VIP Masters Access', value: '£8,000' },
  { label: 'TIER 3', name: 'Golf Tour Package', value: '£4,500' },
];

const IMPACT_STATS = [
  { value: '£4.28M', label: 'Total Raised for Charity' },
  { value: '12k+', label: 'Lives Changed' },
  { value: '24', label: 'Partner Charities' },
  { value: '2,140+', label: 'Active Members' },
];

export default function Home() {
  return (
    <main className={styles.main}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />

        <span className={styles.heroEyebrow}>
          🏆 &nbsp;The Philanthropist&apos;s Game
        </span>

        <h1 className={styles.heroTitle}>
          Play for the Win.{' '}
          <span className={styles.heroTitleAccent}>Support the Cause.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Join an exclusive movement where your passion for golf fuels real-world change.
          Win life-changing prizes while funding global initiatives.
        </p>

        <div className={styles.heroCTAs}>
          <Link href="/subscribe" id="hero-cta-primary" className="btn-primary" style={{ padding: '18px 36px', fontSize: '16px' }}>
            Join The Movement
          </Link>
          <Link href="/impact" id="hero-cta-secondary" className="btn-secondary" style={{ padding: '18px 36px', fontSize: '16px' }}>
            See the Impact →
          </Link>
        </div>

        {/* Jackpot Banner */}
        <div className={styles.jackpotBanner}>
          <div className={styles.jackpotLabel}>💰 Monthly Jackpot Prize</div>
          <div className={styles.jackpotAmount}>£250,000</div>
          <div className={styles.jackpotSub}>Cash Prize · Draw at end of every month</div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.stepsSection}>
        <span className={styles.sectionEyebrow}>How It Works</span>
        <h2 className={styles.sectionTitle}>Three steps. Infinite impact.</h2>

        <div className={styles.stepsGrid}>
          {STEPS.map((step) => (
            <div key={step.num} className={`glass-container-xl ${styles.stepCard}`}>
              <span className={styles.stepNum}>Step {step.num}</span>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRIZE TIERS ── */}
      <section className={styles.prizeSection}>
        <div className={`glass-container-xl ${styles.prizeSectionInner}`}>
          <div>
            <p className={styles.prizeLabel}>Monthly Jackpot</p>
            <div className={styles.prizeAmount}>£250,000</div>
            <p className={styles.prizeDesc}>
              Our prize tiers are designed to change your game and your life. From luxury golf tours to substantial cash prizes, every draw is an event.
            </p>
            <Link href="/subscribe" className="btn-primary" style={{ padding: '16px 32px' }}>
              Start Entering Draws
            </Link>
          </div>

          <div>
            <div className={styles.tierList}>
              {PRIZE_TIERS.map((t) => (
                <div key={t.label} className={styles.tierItem}>
                  <span className={styles.tierBadge}>{t.label}</span>
                  <span className={styles.tierName}>{t.name}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--color-gold)' }}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT DASHBOARD ── */}
      <section className={styles.impactSection}>
        <div className={styles.impactInner}>
          <div>
            <span className={styles.sectionEyebrow} style={{ textAlign: 'left', display: 'block' }}>Impact Dashboard</span>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'left', marginBottom: '40px' }}>
              Real-world results, funded by your swings.
            </h2>
            <div className={styles.impactStats}>
              {IMPACT_STATS.map(({ value, label }) => (
                <div key={label} className={`glass-container ${styles.impactStat}`}>
                  <div className={styles.impactStatValue}>{value}</div>
                  <div className={styles.impactStatLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`glass-container-xl ${styles.impactSpotlight}`}>
            <div className={styles.spotlightTitle}>⭐ Spotlight Impact</div>
            <h3 className={styles.spotlightName}>The Scholars Fund</h3>
            <p className={styles.spotlightDesc}>
              Providing full athletic scholarships to 500+ underprivileged youth athletes this year.
              Funded entirely by the Fairway Impact community.
            </p>
            <Link href="/impact" className="btn-secondary" style={{ marginTop: '24px', display: 'inline-flex', padding: '12px 24px', fontSize: '14px' }}>
              View All Charities →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={styles.finalCTA}>
        <div className={`glass-container-xl ${styles.finalCTAInner}`}>
          <h2 className={styles.finalTitle}>
            Join thousands of players who are winning big and giving back.
          </h2>
          <p className={styles.finalSub}>
            Your first entry is on us. Elevating the game of golf through digital philanthropy and premium reward experiences.
          </p>
          <Link href="/subscribe" id="bottom-cta" className="btn-primary" style={{ padding: '18px 40px', fontSize: '17px' }}>
            Join the Movement Today
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>Fairway<span>Impact</span></div>
              <p className={styles.footerTagline}>
                Elevating the game of golf through digital philanthropy and premium reward experiences.
              </p>
              <div className={styles.footerSocials}>
                <button className={styles.socialBtn} aria-label="Public profile">🌐</button>
                <button className={styles.socialBtn} aria-label="Email">✉️</button>
                <button className={styles.socialBtn} aria-label="Share">🔗</button>
              </div>
            </div>

            <div>
              <div className={styles.footerColTitle}>Platform</div>
              <ul className={styles.footerLinks}>
                <li><Link href="/#how-it-works">How it Works</Link></li>
                <li><Link href="/draws">Active Draws</Link></li>
                <li><Link href="/winners">Winners Gallery</Link></li>
                <li><Link href="/impact">Charity Partners</Link></li>
              </ul>
            </div>

            <div>
              <div className={styles.footerColTitle}>Support</div>
              <ul className={styles.footerLinks}>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <div className={styles.footerColTitle}>Subscription</div>
              <ul className={styles.footerLinks}>
                <li><Link href="/dashboard">Member Dashboard</Link></li>
                <li><Link href="/impact">Impact Stats</Link></li>
                <li><Link href="/subscribe">Choose a Plan</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span className={styles.footerCopy}>© 2024 Fairway Impact. Licensed digital giveaway platform.</span>
            <div className={styles.footerLegal}>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
