// Port 1:1 z api/trial-reminder.js — stub bez bazy danych, patrz TODO w oryginale.
const TRIAL_DAYS = 180;
const REMINDER_DAY = 150;

export async function GET() {
  return Response.json({
    success: true,
    config: {
      trial_duration_days: TRIAL_DAYS,
      reminder_sent_on_day: REMINDER_DAY,
      days_left_when_reminder: TRIAL_DAYS - REMINDER_DAY,
      message: "Email wysyłany " + (TRIAL_DAYS - REMINDER_DAY) + " dni przed końcem okresu testowego",
    },
    next_steps: [
      "1. Podłącz bazę danych (np. Vercel Postgres lub Supabase)",
      "2. Zapisuj created_at przy każdym deploy",
      "3. Ustaw cron job: vercel.json crons → wywołuje /api/trial-reminder codziennie",
      "4. Skonfiguruj Resend / SendGrid do wysyłki emaili",
    ],
  });
}
