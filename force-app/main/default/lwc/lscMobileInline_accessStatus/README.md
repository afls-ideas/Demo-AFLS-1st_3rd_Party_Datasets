# Demo AFLS Access and Formulary Status

LWC component that shows formulary coverage for Immunonco across insurance plans and claims payment history for an HCP.

## Data Sources

- **Wire 1:** `getDataForAccount` with `dataType: 'claims'` — account-specific claims history
- **Wire 2:** `getDataByType` with `dataType: 'formulary'`, `scenario: 'demo_formulary_oncology_usw_sf'` — global formulary data (not HCP-specific)

## What It Shows

- **KPI Cards:** Plans Listed (count), Claims Paid %, Avg Reimbursement, PA Required (count)
- **Formulary Cards:** Each insurance plan displayed with tier, PA requirement, step therapy status, and color-coded status pill (Listed/Preferred = green, Pending = orange, Not Listed = red, Restricted = gray)
- **Claims History:** Rows showing claim ID, period, type (Medical Part B / Pharmacy Benefit), total paid, and payment status
- **Signal Banners:** Actionable alerts with recommended field actions

## Signals Detected

| Signal | Condition | Level |
|---|---|---|
| P&T Review Upcoming | Plan status = Pending with committee date | info |
| Step Therapy Required | Plan requires step therapy | warning |
| Not on Formulary | Plan status = Not Listed | error |
| Claims Denied | Any claim with denied status | error |
| Partial Reimbursement | Partial payment without full denial | warning |
| Strong Access Position | All plans listed + no claim denials | success |

## Formulary Landscape (Global — All HCPs See This)

| Plan | Immunonco Status | Tier | PA Required | Step Therapy |
|---|---|---|---|---|
| UCSF Health Plan | Approved | Preferred Specialty | No | No |
| Kaiser Permanente NorCal | Pending | — | Yes | Yes |
| Anthem Blue Cross CA | Approved | Tier 2 Specialty | Yes | No |
| Sutter Health Plus | Approved | Tier 2 Specialty | Yes | No |
| VA National Formulary | Approved | VA Formulary | No | No |
| Medicare Part B | Approved | Part B Buy-and-Bill | No | No |

## HCP Scenarios (SP-ONC-USW-SF-001)

### Dr. Lisa Thornton — Clean Access, Full Reimbursement

- **Institution:** UCSF Medical Center
- **Claims:** 6 records, all Medical Benefit Part B, all Paid
- **Payment trajectory:** $15,520 → $23,280 → $31,040 → $38,800 → $46,560 → $54,320 (Oct 2025 – Mar 2026)
- **Diagnosis:** NSCLC — Upper lobe, unspecified
- **Expected signals:** Strong Access Position (all claims paid, UCSF formulary = Preferred Specialty with no PA)
- **Demo story:** Perfect access scenario. UCSF has Immunonco as Preferred Specialty with no PA or step therapy. Every claim paid in full. Steadily increasing reimbursement tracks her growing patient volume. This is the gold standard — show this HCP to demonstrate what good access looks like.

### Dr. Matthew Wong — Reimbursement Collapse

- **Institution:** Stanford Health Care
- **Claims:** 6 records, Medical Benefit Part B, status deteriorating
- **Payment trajectory:** $15,520 (Paid) → $23,280 (Paid) → $23,280 (Paid) → $13,580 (Partial Denial) → $7,760 (Paid) → $0 (Denied — PA Required)
- **Diagnosis:** NSCLC — Unspecified
- **Expected signals:** Claims Denied (Mar 2026), Partial Reimbursement (Jan 2026)
- **Demo story:** Claims started clean but deteriorated in lockstep with his prescribing pullback. Partial denial in Jan 2026 was the first crack — PA wasn't obtained as his volume dropped. By Mar 2026, full denial because PA was required but not submitted. The access collapse narrative: safety events → prescribing hesitation → PA lapses → claim denials → further pullback.

### Dr. Kevin Patel — Pharmacy Benefit Path (Kaiser)

- **Institution:** Kaiser Permanente
- **Claims:** 3 records, all Pharmacy Benefit, all Paid
- **Payment trajectory:** $10,000 (Oct) → $20,000 (Feb) → $20,000 (Mar)
- **Diagnosis:** NSCLC — Lower lobe, right
- **Expected signals:** P&T Review Upcoming (Kaiser Pending, committee Jun 2026), Step Therapy Required (Kaiser)
- **Demo story:** Kaiser routes through Pharmacy Benefit (not Part B buy-and-bill). Claims that do get through are paid, but volume is severely constrained by the formulary step therapy requirement. The formulary cards will show Kaiser as "Pending" with an orange pill — the P&T committee date creates an actionable signal for KAM engagement.

### Dr. Brian Sullivan — Low Volume, Clean Claims

- **Institution:** Sutter Health CPMC
- **Claims:** 2 records, Medical Benefit Part B, both Paid
- **Payment trajectory:** $7,760 (Jan 2026) → $7,760 (Mar 2026)
- **Diagnosis:** NSCLC — Upper lobe, right
- **Expected signals:** None critical — clean but low volume. Sutter Health Plus formulary has PA requirement.
- **Demo story:** Only 2 claims reflecting his minimal Immunonco adoption. Both paid without issue. The Sutter Health Plus formulary card shows PA required, which may be a friction point preventing higher adoption. Access isn't the barrier here — conviction is.

### Dr. Nina Chandra — VA/Government Channel

- **Institution:** Zuckerberg San Francisco General
- **Claims:** 5 records, all VA/Government, all Paid
- **Payment trajectory:** $6,790 → $13,580 → $20,370 → $27,160 → $33,950 (Nov 2025 – Mar 2026)
- **Diagnosis:** NSCLC — Upper lobe, unspecified
- **Expected signals:** Strong Access Position (VA formulary = no PA, no step therapy, 340B pricing)
- **Demo story:** VA claims use 340B ceiling pricing ($3,395/unit vs $4,850 ASP). Every claim paid, steadily growing with her prescribing ramp. VA National Formulary has Immunonco with no PA or step therapy. Combined with UCSF (Dr. Thornton), shows two successful but different access pathways: commercial preferred vs government 340B.

## Placement

Add to Account record page (Person Account / HCP). Targets: `lightning__RecordPage`, `lightning__Tab`.
