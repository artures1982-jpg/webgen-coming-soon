// lib/admin-allowlist.js — jedyne źródło prawdy o tym, kto ma dostęp do endpointów admina po
// stronie SERWERA. Bramka Clerk+allowlist w admin/index.html jest tylko UX (klient mógłby ją
// ominąć edytując JS w przeglądarce) — każdy uprzywilejowany endpoint musi sprawdzić to tu.
const ADMIN_ALLOWED_EMAILS = ['artures1982@icloud.com'];

module.exports = { ADMIN_ALLOWED_EMAILS };
