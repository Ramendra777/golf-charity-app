import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>The Modern Philanthropist</h1>
        <p className={styles.heroSubtitle}>
          Avoid the fairway cliches and experience the high-octane excitement of digital subscriptions and social impact.
          Track your scores, win rewards, and fuel causes that matter.
        </p>
        
        <div className={styles.actionRow}>
          <Link href="/dashboard" className="btn-primary">
            Start Your Journey
          </Link>
          <Link href="/impact" className="btn-secondary">
            Explore Impact
          </Link>
        </div>
      </section>

      {/* Impact Gallery Teaser */}
      <section className={`glass-container-xl ${styles.gallerySection}`}>
        <h2 className={styles.galleryTitle}>Transforming the Game</h2>
        
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`glass-container ${styles.card}`}>
              <div className={styles.cardImage}>
                Initiative {i}
              </div>
              <h3 className={styles.cardTitle}>Clean Water Fund {i}</h3>
              <p className={styles.cardDesc}>
                Supporting communities globally with life-saving resources directly powered by your swings.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
