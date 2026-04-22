import styles from './impact.module.css';

const CHARITIES = [
  { id: 1, emoji: '💧', name: 'Clean Water Foundation', description: 'Delivering safe drinking water infrastructure to communities in Sub-Saharan Africa.', raised: 28500, target: 50000 },
  { id: 2, emoji: '📚', name: 'Education First Alliance', description: 'Building schools and providing learning resources for children in rural communities.', raised: 14200, target: 30000 },
  { id: 3, emoji: '🌱', name: 'Reforestation Now', description: 'Planting native trees across deforested landscapes to combat climate change.', raised: 9800, target: 20000 },
  { id: 4, emoji: '🏥', name: 'Rural Health Initiative', description: 'Funding mobile health clinics serving medically underserved rural populations.', raised: 31000, target: 40000 },
  { id: 5, emoji: '🍽️', name: 'Zero Hunger Project', description: 'Fighting food insecurity through sustainable food banks and community gardens.', raised: 17600, target: 35000 },
  { id: 6, emoji: '♿', name: 'Accessibility for All', description: 'Making sports and physical activity accessible to people with disabilities.', raised: 7300, target: 15000 },
];

export const metadata = {
  title: 'Charity Impact Gallery | Fairway Impact Rewards',
  description: 'Explore the charities supported by Fairway Impact Rewards members. Every subscription contributes directly to causes that matter.',
};

export default function ImpactPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Our Charities</span>
        <h1 className={styles.title}>Where Your Swing Lands</h1>
        <p className={styles.subtitle}>
          Every round you play fuels real-world change. Explore the causes your subscriptions directly support.
        </p>
      </header>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <div className={styles.statValue}>£108,400</div>
          <div className={styles.statLabel}>Total Contributed</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>6</div>
          <div className={styles.statLabel}>Supported Charities</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>2,140</div>
          <div className={styles.statLabel}>Active Members</div>
        </div>
      </div>

      {/* Charity Grid */}
      <div className={styles.grid}>
        {CHARITIES.map((charity) => {
          const pct = Math.round((charity.raised / charity.target) * 100);
          return (
            <article key={charity.id} className={`glass-container-xl ${styles.charityCard}`}>
              <div className={styles.cardImageBanner} aria-hidden="true">
                {charity.emoji}
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.charityName}>{charity.name}</h2>
                <p className={styles.charityDesc}>{charity.description}</p>
                <div className={styles.progressWrapper}>
                  <div className={styles.progressLabel}>
                    <span className={styles.progressAmount}>£{charity.raised.toLocaleString()} raised</span>
                    <span>{pct}%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
