/**
 * WEBGEN — /api/trial-reminder
 * Sprawdza które konta Start zbliżają się do końca okresu testowego
 * Wywoływany np. przez cron job lub ręcznie
 *
 * Logika:
 *   - Plan Start = 6 miesięcy bezpłatnie
 *   - Email wysyłany miesiąc przed końcem (czyli po 5 miesiącach od założenia)
 *   - W emailu: przypomnienie + link do upgradu z rabatem
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // TODO: Gdy będzie baza danych klientów, tutaj query:
  // SELECT email, slug, created_at FROM sites
  // WHERE plan = 'free'
  // AND created_at BETWEEN NOW() - INTERVAL '151 days' AND NOW() - INTERVAL '149 days'
  // (wysyłamy email dokładnie po 150 dniach = miesiąc przed końcem 180-dniowego trialu)

  const TRIAL_DAYS = 180;        // 6 miesięcy
  const REMINDER_DAY = 150;      // wysyłamy po 150 dniach (30 dni przed końcem)

  return res.json({
    success: true,
    config: {
      trial_duration_days: TRIAL_DAYS,
      reminder_sent_on_day: REMINDER_DAY,
      days_left_when_reminder: TRIAL_DAYS - REMINDER_DAY,
      message: `Email wysyłany ${TRIAL_DAYS - REMINDER_DAY} dni przed końcem okresu testowego`
    },
    next_steps: [
      '1. Podłącz bazę danych (np. Vercel Postgres lub Supabase)',
      '2. Zapisuj created_at przy każdym deploy',
      '3. Ustaw cron job: vercel.json crons → wywołuje /api/trial-reminder codziennie',
      '4. Skonfiguruj Resend / SendGrid do wysyłki emaili'
    ]
  });
}
