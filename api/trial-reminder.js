/**
 * WEBGEN — /api/trial-reminder
 * Sprawdza które konta Free zbliżają się do końca okresu testowego
 * Wywoływany np. przez cron job lub ręcznie
 * 
 * Logika:
 *   - Plan Free = 3 miesiące bezpłatnie
 *   - Email wysyłany miesiąc przed końcem (czyli po 2 miesiącach od założenia)
 *   - W emailu: przypomnienie + link do upgradu z rabatem
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // TODO: Gdy będzie baza danych klientów, tutaj query:
  // SELECT email, slug, created_at FROM sites 
  // WHERE plan = 'free' 
  // AND created_at BETWEEN NOW() - INTERVAL '61 days' AND NOW() - INTERVAL '59 days'
  // (wysyłamy email dokładnie po 60 dniach = miesiąc przed końcem 90-dniowego trialu)

  const TRIAL_DAYS = 90;         // 3 miesiące
  const REMINDER_DAY = 60;       // wysyłamy po 60 dniach (30 dni przed końcem)

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
