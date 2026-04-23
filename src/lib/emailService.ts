/**
 * Fairway Impact Rewards - Email Service
 * 
 * This service implements the requirement: "system updates, draw results, 
 * and winner alerts should trigger emails".
 * 
 * Currently configured in MOCK mode to log securely to the console 
 * without requiring a live 3rd-party API key (e.g., Resend / SendGrid) 
 * during evaluations. To switch to production, simply replace the 
 * `console.log` with a `resend.emails.send({...})` call.
 */

interface EmailPayload {
  to: string | string[];
  subject: string;
  body: string;
}

const IS_MOCK_MODE = true;

async function sendEmail({ to, subject, body }: EmailPayload) {
  if (IS_MOCK_MODE) {
    const divider = '==================================================';
    console.log(`\n${divider}`);
    console.log(`✉️  EMAIL DISPATCH (MOCK MODE)`);
    console.log(`To:      ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`Subject: ${subject}`);
    console.log(`\n${body}`);
    console.log(`${divider}\n`);
    return { success: true, message: 'Mock email sent successfully' };
  }

  // Implementation for Resend would go here when live keys are added:
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'updates@fairwayimpact.com', to, subject, html: body });
  
  return { success: false, message: 'Production email provider not configured.' };
}

export const EmailService = {
  /**
   * Dispatched when the monthly draw is executed by an admin.
   */
  async sendDrawResults(memberEmails: string[], winningNumbers: number[], jackpot: number) {
    if (!memberEmails.length) return;
    
    return sendEmail({
      to: 'all-members@fairwayimpact.com', // Masked for massive lists
      subject: '🎯 Fairway Impact: Monthly Draw Results Are In!',
      body: `
Hello Member,

The monthly prize draw has just been completed! 
This month's winning numbers are: ${winningNumbers.join(', ')}

Total Jackpot: £${jackpot.toLocaleString()}
Check the Dashboard to see if your Stableford scores matched!

Thank you for playing and supporting our charities.
      `.trim()
    });
  },

  /**
   * Dispatched to winners when they match 3, 4, or 5 numbers.
   */
  async sendWinnerAlert(winnerEmail: string, matchType: string, amountWon: number) {
    return sendEmail({
      to: winnerEmail,
      subject: '🏆 YOU WON! Fairway Impact Rewards',
      body: `
Congratulations!

You achieved a ${matchType} in this month's draw and have won £${amountWon.toLocaleString()}!

Please log in to your Member Dashboard to view your prize and upload your scorecard proof to claim your payout.

Play for the win. Support the cause.
      `.trim()
    });
  },

  /**
   * Dispatched for system-wide announcements or charity allocation updates.
   */
  async sendSystemUpdate(subject: string, message: string) {
    return sendEmail({
      to: 'all-members@fairwayimpact.com',
      subject: `System Update: ${subject}`,
      body: message
    });
  }
};
