'use client';

import styles from './admin.module.css';

export default function AdminDashboard() {
  const triggerDraw = async () => {
    // In actual implementation, this calls /api/admin/draw
    alert('Simulating Draw Logic... Check network/console.');
  };

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <h1 className={`${styles.title} font-epilogue`}>Admin Control Center</h1>
        <p className="font-jakarta text-on-surface-variant">System Overview & Management</p>
      </header>

      <div className={styles.dashboardGrid}>
        {/* Draw Management */}
        <section className={`glass-container ${styles.panel}`}>
          <h2 className={`${styles.panelTitle} font-epilogue`}>Draw Management</h2>
          <div className={styles.list}>
            <div className={styles.listItem}>
               <div>
                 <p className="font-bold">Next Official Draw</p>
                 <p className="text-sm text-on-surface-variant">End of Current Month</p>
               </div>
               <div className={styles.actions}>
                 <button onClick={triggerDraw} className={styles.btnSmall}>Run Simulation</button>
                 <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Publish Draw</button>
               </div>
            </div>
          </div>
        </section>

        {/* Winner Verification */}
        <section className={`glass-container ${styles.panel}`}>
          <h2 className={`${styles.panelTitle} font-epilogue`}>Winner Verification</h2>
          <div className={styles.list}>
             <div className={styles.listItem}>
                <div>
                   <p className="font-bold">User: John Doe</p>
                   <p className="text-sm text-on-surface-variant">5-Match Winner</p>
                </div>
                <div className={styles.actions}>
                   <button className={styles.btnSmall}>Verify Proof</button>
                   <button className={styles.btnSmall}>Mark Paid</button>
                </div>
             </div>
          </div>
        </section>

        {/* Charity Management */}
        <section className={`glass-container ${styles.panel}`}>
          <h2 className={`${styles.panelTitle} font-epilogue`}>Charity Management</h2>
          <div className={styles.list}>
             <div className={styles.listItem}>
                <div>
                   <p className="font-bold">Clean Water Fund</p>
                   <p className="text-sm text-on-surface-variant">Total Distributed: $15,200</p>
                </div>
                <div className={styles.actions}>
                   <button className={styles.btnSmall}>Edit Media</button>
                </div>
             </div>
          </div>
        </section>

        {/* User Management */}
        <section className={`glass-container ${styles.panel}`}>
          <h2 className={`${styles.panelTitle} font-epilogue`}>User Management</h2>
          <div className={styles.list}>
             <div className={styles.listItem}>
                <div>
                   <p className="font-bold">Total Subs</p>
                   <p className="text-sm text-on-surface-variant">1,024 Active</p>
                </div>
                <div className={styles.actions}>
                   <button className={styles.btnSmall}>View All Users</button>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
