// Port 1:1 z api/dashboard-data.js — dane Stripe (klient/subskrypcja/faktury) dla panelu.
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

async function stripeGet(path: string) {
  const res = await fetch("https://api.stripe.com/v1" + path, {
    headers: {
      Authorization: "Bearer " + STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return res.json();
}

export async function OPTIONS(req: Request) {
  return optionsResponse(req, "GET, OPTIONS");
}

export async function GET(req: Request) {
  const headers = corsHeaders(req, "GET, OPTIONS");

  const session = await verifyRequest(req);
  if (!session) return Response.json({ error: "Brak autoryzacji" }, { status: 401, headers });
  const email = session.email;

  if (!STRIPE_SECRET_KEY) {
    return Response.json(
      { ok: true, customer: null, subscription: null, invoices: [], note: "no_stripe_key" },
      { headers }
    );
  }

  try {
    const customers = await stripeGet("/customers?email=" + encodeURIComponent(email) + "&limit=1");
    const customer = customers.data && customers.data[0] ? customers.data[0] : null;

    if (!customer) {
      return Response.json(
        { ok: true, customer: null, subscription: null, invoices: [], note: "customer_not_found" },
        { headers }
      );
    }

    const subs = await stripeGet("/subscriptions?customer=" + customer.id + "&status=active&limit=1");
    let anySubscription = subs.data && subs.data[0] ? subs.data[0] : null;
    if (!anySubscription) {
      const allSubs = await stripeGet("/subscriptions?customer=" + customer.id + "&limit=3");
      anySubscription = allSubs.data && allSubs.data[0] ? allSubs.data[0] : null;
    }

    const invoicesData = await stripeGet("/invoices?customer=" + customer.id + "&limit=5");
    const invoices = (invoicesData.data || []).map(
      (inv: {
        id: string;
        number: string;
        amount_paid: number;
        currency: string;
        status: string;
        created: number;
        invoice_pdf: string;
        period_start: number;
        period_end: number;
      }) => ({
        id: inv.id,
        number: inv.number,
        amount: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        date: inv.created,
        pdf: inv.invoice_pdf,
        period_start: inv.period_start,
        period_end: inv.period_end,
      })
    );

    let subscriptionData = null;
    if (anySubscription) {
      const item = anySubscription.items && anySubscription.items.data[0];
      subscriptionData = {
        id: anySubscription.id,
        status: anySubscription.status,
        current_period_end: anySubscription.current_period_end,
        current_period_start: anySubscription.current_period_start,
        cancel_at_period_end: anySubscription.cancel_at_period_end,
        plan_name:
          item && item.price && item.price.nickname
            ? item.price.nickname
            : item && item.price && item.price.product
              ? item.price.product
              : "Plan webgen",
        plan_amount: item && item.price ? item.price.unit_amount : 0,
        plan_currency: item && item.price ? item.price.currency : "pln",
        plan_interval: item && item.price && item.price.recurring ? item.price.recurring.interval : "month",
      };
    }

    return Response.json(
      {
        ok: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          created: customer.created,
        },
        subscription: subscriptionData,
        invoices,
      },
      { headers }
    );
  } catch (err) {
    console.error("dashboard-data error:", err);
    return Response.json(
      { error: "Błąd pobierania danych", details: err instanceof Error ? err.message : String(err) },
      { status: 500, headers }
    );
  }
}
