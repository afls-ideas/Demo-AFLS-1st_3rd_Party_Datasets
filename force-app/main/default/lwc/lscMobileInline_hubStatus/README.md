# Demo AFLS Patient Journey Hub Status

LWC component that shows the patient journey funnel from hub referral through to on-therapy, with outcome KPIs and period-over-period trends.

## Data Source

- **Wire:** `getDataForAccount` with `dataType: 'patient_journey'`
- **Scenario:** `demo_patient_journey_oncology_usw_sf`

## What It Shows

- **D3.js Funnel Chart:** Five-stage funnel rendered as continuous trapezoids — Referred to Hub → Benefits Verified → Approved for Therapy → Started Therapy → On Therapy. Drop-off badges on the right show patient losses between stages (e.g., "9 not verified", "9 denied · 5d avg").
- **Outcome KPI Cards:** Persistency rate, PA Decision Time (days), Funnel Conversion %, Enrollment Trend (delta)
- **Signal Banners:** Actionable alerts with "Next Step" guidance for the rep
- **Period-over-Period Table:** Referred, Verified, Approved, Started, On Tx, Conversion %, Persistency by period

## D3.js Dependency

Uses D3.js v7 loaded as a static resource (`d3js`). The funnel container uses `lwc:dom="manual"` for direct DOM manipulation.

## Signals Detected

| Signal | Condition | Level |
|---|---|---|
| Low Persistency | Persistency < 80% (error if < 70%) | warning/error |
| PA Processing Delay | Avg days to PA decision > 7 (error if > 10) | warning/error |
| High PA Denial Rate | Denial rate > 30% | error |
| Patient Abandonment | Any patients abandoned with reasons | warning |
| Referrals Declining | Fewer referrals than prior period | warning |
| Low Funnel Conversion | < 35% of referred patients reach therapy | error |
| Strong Hub Performance | Persistency >= 85%, no abandonment, PA approval > 90% | success |

## HCP Scenarios (SP-ONC-USW-SF-001)

### Dr. Lisa Thornton — High Volume, Gradual Erosion

- **Referrals:** 22 → 32 → 40 → 52 (highest volume in territory, steadily growing)
- **On Therapy:** 9 → 16 → 19 → 23
- **Persistency:** 0.90 → 0.89 → 0.86 → 0.82 (declining — crosses below 85% threshold)
- **PA Denials:** 2 → 2 → 3 → 5 (increasing)
- **Abandonments:** 1 → 2 → 3 → 5 (increasing)
- **Expected signals:** Low Persistency (0.82 in latest period), Patient Abandonment (5 patients), possibly PA denial trending
- **Demo story:** The funnel looks healthy at the top — referrals are booming. But persistency is slowly eroding as volume scales. More PA denials and abandonments each period. The funnel chart will show a wide top narrowing more sharply than expected. This is the "growing pains" story — success at scale reveals process cracks.

### Dr. Matthew Wong — Funnel Collapse

- **Referrals:** 15 → 20 → 22 → 24 (still growing, but slowing)
- **On Therapy:** 6 → 6 → 5 → 3 (declining despite more referrals)
- **Persistency:** 0.92 → 0.75 → 0.71 → 0.50 (dramatic drop — below 70% = error level)
- **PA Denials:** 2 → 3 → 5 → 8 (accelerating)
- **Abandonments:** 0 → 2 → 2 → 3 (emerging)
- **Expected signals:** Low Persistency (error — 0.50), High PA Denial Rate (8 denied out of 24 referred = 33%), Patient Abandonment, Low Funnel Conversion (3/24 = 12.5%)
- **Demo story:** The most dramatic funnel in the territory. Referrals keep coming in but almost nothing makes it through. Persistency cratered from 0.92 to 0.50 in 6 months. PA denials are the primary bottleneck — 8 denied by Mar 2026. The funnel chart will show a massively pinched shape. This correlates with his colitis-driven prescribing pullback and claim denials.

### Dr. Kevin Patel — Formulary-Constrained Funnel

- **Referrals:** 5 → 8 → 12 → 16 (growing as awareness builds)
- **On Therapy:** 1 → 1 → 3 → 5 (slowly improving)
- **Persistency:** 1.00 → 0.50 → 0.75 → 0.83 (volatile — small denominator effects)
- **PA Denials:** 1 → 2 → 2 → 2 (consistent friction)
- **Abandonments:** 0 → 1 → 1 → 1 (low but present)
- **Expected signals:** Patient Abandonment, possibly Low Funnel Conversion early on
- **Demo story:** Small but improving funnel. Kaiser step therapy creates a persistent drag — every period has PA denials. But the trajectory is positive as exception requests succeed more often. Persistency is noisy due to small numbers. The story is "constrained potential" — this HCP could deliver if Kaiser formulary access improves.

### Dr. Brian Sullivan — Perfect Small Funnel

- **Referrals:** 3 → 6 → 9 (growing steadily)
- **On Therapy:** 1 → 3 → 6 (perfect retention of each cohort)
- **Persistency:** 1.00 → 1.00 → 1.00 (100% across all periods)
- **PA Denials:** 0 → 0 → 0 (zero denials)
- **Abandonments:** 0 → 0 → 0 (zero abandonment)
- **Expected signals:** Strong Hub Performance (100% persistency, no abandonment, no PA denials)
- **Demo story:** The smallest funnel but the cleanest. Every patient referred stays on therapy. Zero PA friction, zero abandonment. The funnel chart will show a nearly cylindrical shape — no drop-off at any stage. Proves that when access works, patients stick. The challenge is getting him to refer more patients in the first place.

### Dr. Nina Chandra — VA Ramp with Late Friction

- **Referrals:** 6 → 14 → 20 (aggressive growth)
- **On Therapy:** 3 → 7 → 10 (growing but not keeping pace with referrals)
- **Persistency:** 1.00 → 0.88 → 0.83 (declining from perfect to borderline)
- **PA Denials:** 0 → 0 → 0 (VA has no PA requirement)
- **Abandonments:** 0 → 1 → 2 (emerging despite zero access barriers)
- **Expected signals:** Low Persistency (0.83 — borderline warning), Patient Abandonment (2 patients)
- **Demo story:** Started perfect but scaling introduced some attrition. No PA barriers (VA system), so the abandonment must be driven by tolerability rather than access — which correlates with her Grade 3 colitis event in Mar 2026. The funnel shows that even frictionless access doesn't eliminate all attrition. Compare with Dr. Sullivan (small + perfect) vs Dr. Chandra (growing + leaky).

## Placement

Add to Account record page (Person Account / HCP). Targets: `lightning__RecordPage`, `lightning__Tab`.
