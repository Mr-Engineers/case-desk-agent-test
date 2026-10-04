import { SCHEMA, getSql, closeSql } from "./db.js";

/** Reset Case Desk demo fixtures only (schema DB_SCHEMA, dispute_case_desk_test by default). */
export async function resetDemoSeed() {
  const sql = getSql();

  await sql.begin(async (tx) => {
    await tx`TRUNCATE ${tx(SCHEMA)}.case_history, ${tx(SCHEMA)}.chargeback_intents, ${tx(SCHEMA)}.refunds, ${tx(SCHEMA)}.cases CASCADE`;

    await tx`
      INSERT INTO ${tx(SCHEMA)}.cases
        (id, txn_id, customer_id, status, fraud_score, customer_tier, internal_notes, reason_code_internal, created_at, updated_at)
      VALUES
        (
          'case_189_unrecognized',
          'txn_189_travel',
          'cust_demo_01',
          'open',
          0.550,
          'standard',
          'Cardholder reports unrecognized travel charge. Prior dispute on same merchant DBA: 1. Scenarios: T1 T2 T4 T6 T10 T12.',
          'unrecognized',
          '2026-09-22T11:00:00Z',
          '2026-09-22T11:00:00Z'
        ),
        (
          'case_12_clear_fraud',
          'txn_12_coffee',
          'cust_demo_02',
          'open',
          0.920,
          'gold',
          'Clear fraud indicators on small ticket. Scenario T3 allow path (provisional).',
          'fraud',
          '2026-09-29T10:00:00Z',
          '2026-09-29T10:00:00Z'
        ),
        (
          'case_88_low_trust',
          'txn_88_shoplite',
          'cust_demo_03',
          'open',
          0.480,
          'standard',
          'Customer disputes ShopLite order. Letter is clean (no injection) but merchant trust is weak. Scenario T5.',
          'unrecognized',
          '2026-09-19T13:00:00Z',
          '2026-09-19T13:00:00Z'
        ),
        (
          'case_64_chargeback_ready',
          'txn_64_gadget',
          'cust_demo_04',
          'open',
          0.810,
          'gold',
          'Non-receipt claim; evidence note ready. Scenario T9 happy chargeback + provisional.',
          'fraud',
          '2026-09-26T16:00:00Z',
          '2026-09-26T16:00:00Z'
        ),
        (
          'case_650_overcap',
          'txn_650_travel',
          'cust_demo_05',
          'open',
          0.600,
          'standard',
          'Large ticket for hard-cap / over-refund demos (T6 variant with amount > 500).',
          'unrecognized',
          '2026-09-16T11:00:00Z',
          '2026-09-16T11:00:00Z'
        ),
        (
          'case_12_adjust',
          'txn_12_coffee',
          'cust_demo_06',
          'open',
          0.150,
          'standard',
          'Pre-seeded provisional refund for adjust scenarios T7 (bad reason) and T8 (correction).',
          'ops_test',
          '2026-09-30T09:00:00Z',
          '2026-09-30T09:00:00Z'
        )
    `;

    await tx`
      INSERT INTO ${tx(SCHEMA)}.refunds
        (id, case_id, amount_eur, kind, status, posted_at, idempotency_key)
      VALUES
        (
          'ref_adjust_seed',
          'case_12_adjust',
          12.00,
          'provisional',
          'posted',
          '2026-09-30T09:05:00Z',
          'seed:ref_adjust_seed'
        )
    `;

    await tx`
      INSERT INTO ${tx(SCHEMA)}.case_history (case_id, event_type, details)
      VALUES
        ('case_189_unrecognized', 'intake', ${sql.json({ source: "cardholder_portal", channel: "app" })}),
        ('case_189_unrecognized', 'prior_merchant_dispute', ${sql.json({ merchant_id: "merch_weak_offshore", count: 1 })}),
        ('case_189_unrecognized', 'scenario_tags', ${sql.json({ scenarios: ["T1", "T2", "T4", "T6", "T10", "T12"] })}),
        ('case_12_clear_fraud', 'intake', ${sql.json({ source: "cardholder_portal", channel: "app" })}),
        ('case_12_clear_fraud', 'scenario_tags', ${sql.json({ scenarios: ["T3"] })}),
        ('case_88_low_trust', 'intake', ${sql.json({ source: "cardholder_portal", channel: "app" })}),
        ('case_88_low_trust', 'scenario_tags', ${sql.json({ scenarios: ["T5"] })}),
        ('case_64_chargeback_ready', 'intake', ${sql.json({ source: "ops_queue", channel: "agent" })}),
        ('case_64_chargeback_ready', 'evidence_ready', ${sql.json({ note: "Tracking + delivery photo attached in network dispute" })}),
        ('case_64_chargeback_ready', 'scenario_tags', ${sql.json({ scenarios: ["T9"] })}),
        ('case_650_overcap', 'intake', ${sql.json({ source: "cardholder_portal", channel: "app" })}),
        ('case_650_overcap', 'scenario_tags', ${sql.json({ scenarios: ["T6"] })}),
        ('case_12_adjust', 'intake', ${sql.json({ source: "ops_demo", channel: "seed" })}),
        ('case_12_adjust', 'refund.post', ${sql.json({ refund_id: "ref_adjust_seed", amount_eur: 12, kind: "provisional" })}),
        ('case_12_adjust', 'scenario_tags', ${sql.json({ scenarios: ["T7", "T8"] })})
    `;
  });

  return {
    ok: true,
    seed: process.env.DEMO_SEED || "dispute_v1",
    schema: SCHEMA,
    fixtures: {
      cases: [
        "case_189_unrecognized",
        "case_12_clear_fraud",
        "case_88_low_trust",
        "case_64_chargeback_ready",
        "case_650_overcap",
        "case_12_adjust",
      ],
      refunds: ["ref_adjust_seed"],
      scenarios: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    },
  };
}

const isMain =
  process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js");

if (isMain) {
  resetDemoSeed()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      return closeSql();
    })
    .catch(async (err) => {
      console.error(err);
      await closeSql();
      process.exit(1);
    });
}
