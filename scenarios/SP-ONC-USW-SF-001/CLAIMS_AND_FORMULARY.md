# Claims and Formulary Data — SP-ONC-USW-SF-001

**Static Resources:**
- `demo_claims_oncology_usw_sf` — 22 records, type `claims`
- `demo_formulary_oncology_usw_sf` — 15 records, type `formulary`

**Period:** Oct 2025 – Mar 2026
**LWC:** `lscMobileInline_accessStatus` (Demo AFLS Access and Formulary Status)

---

## What These Datasets Represent

**Claims data** represents medical/pharmacy benefit reimbursement records — the kind of data CMS, payer portals, or claims aggregators provide. Each record is one claim with billing codes (J-codes), reimbursement amounts, diagnosis, and payment status. It answers: **"Is the HCP getting paid for administering our product, and are claims being denied?"**

**Formulary data** represents payer formulary listings — the kind of data from P&T committee decisions, formulary lookup tools, or managed care analytics. Each record is one plan × product, showing tier, PA requirements, and step therapy restrictions. It answers: **"Which insurance plans cover our product, and what access barriers exist?"**

These two datasets work together in the `accessStatus` LWC: formulary shows the landscape of what *should* be possible, while claims show what *actually* happened.

---

## Claims Schema

| Field | Type | Description |
|---|---|---|
| `claim_id` | String | Unique claim identifier |
| `hcp_name` | String | Billing provider |
| `product` | String | `Immunonco (US)` |
| `period` | Date | Service date |
| `claim_type` | String | Medical Benefit Part B, Pharmacy Benefit, or VA/Government |
| `j_code` | String | HCPCS J-code (J9999 for Immunonco) |
| `units_billed` | Integer | Number of units billed |
| `asp_per_unit` | Float | Average Selling Price per unit ($4,850 commercial, $3,395 VA 340B) |
| `total_allowed` | Float | Total allowed amount |
| `total_paid` | Float | Amount paid by payer |
| `patient_responsibility` | Float | Patient OOP cost |
| `diagnosis_code` | String | ICD-10 code (C34.xx — NSCLC variants) |
| `diagnosis_desc` | String | Human-readable diagnosis |
| `line_of_therapy` | String | 1L, 2L, etc. |
| `biomarker` | String | PD-L1 TPS status |
| `site_of_care` | String | Hospital Outpatient, Physician Office, VA Medical Center |
| `status` | String | Paid, Partial Denial, Denied - PA Required |

## Formulary Schema

| Field | Type | Description |
|---|---|---|
| `plan_id` | String | Plan identifier |
| `plan_name` | String | Insurance plan name |
| `product` | String | Drug name |
| `status` | String | Approved, Pending, Not Listed |
| `tier` | String | Formulary tier (Preferred Specialty, Tier 2, etc.) |
| `pa_required` | Boolean | Prior authorization required |
| `step_therapy` | Boolean | Must try another agent first |
| `quantity_limit` | String | Dispensing quantity limits |
| `site_of_care_restriction` | String | SOC network restrictions |
| `effective_date` | Date | When coverage became effective |
| `pt_committee_date` | Date | P&T committee review date |
| `notes` | String | Context on formulary decision |

---

## Formulary Landscape (6 Plans × 3 Products)

### Immunonco (US) Coverage

| Plan | Status | Tier | PA | Step Therapy | Notes |
|---|---|---|---|---|---|
| **UCSF Health Plan** | Approved | Preferred Specialty | No | No | Added after ILLUMINATE-1 OS data at ASCO 2025 |
| **Kaiser Permanente NorCal** | **Pending** | — | Yes | **Yes** | P&T review scheduled Jun 2026. Step therapy through Onclaris required. |
| **Anthem Blue Cross CA** | Approved | Tier 2 Specialty | Yes | No | PA requires PD-L1 documentation and 1L NSCLC indication |
| **Sutter Health Plus** | Approved | Tier 2 Specialty | Yes | No | SOC restricted to Sutter network |
| **VA National Formulary** | Approved | VA Formulary | No | No | 340B ceiling pricing ($3,395/unit) |
| **Medicare Part B** | Approved | Part B Buy-and-Bill | No | No | J-code J9999, ASP-based reimbursement |

### Onclaris Coverage (Competitor)

| Plan | Status | Tier | PA | Step Therapy |
|---|---|---|---|---|
| UCSF Health Plan | Approved | Tier 2 Specialty | Yes | No |
| Kaiser Permanente NorCal | Approved | **Preferred Specialty** | **No** | **No** |
| Anthem Blue Cross CA | Approved | **Preferred Specialty** | **No** | **No** |
| Sutter Health Plus | Approved | **Preferred Specialty** | **No** | **No** |
| VA National Formulary | Approved | VA Formulary | No | No |

**Key insight:** Onclaris holds Preferred Specialty tier on Kaiser, Anthem, and Sutter — zero PA, zero step therapy. Immunonco is Tier 2 with PA on Anthem/Sutter, and Pending on Kaiser. Only at UCSF and VA is Immunonco on equal or better footing.

---

## HCP Claims Stories

### Dr. Lisa Thornton — Clean Access, Full Reimbursement

**Channel:** Medical Benefit Part B | **Site:** Hospital Outpatient (UCSF) | **Diagnosis:** NSCLC Upper lobe (C34.10) | **Biomarker:** PD-L1 TPS >= 50%

| Period | Claim ID | Units | ASP/Unit | Allowed | Paid | Patient | Status |
|---|---|---|---|---|---|---|---|
| Oct 2025 | CLM-USW-SF-20251001 | 4 | $4,850 | $19,400 | $15,520 | $3,880 | Paid |
| Nov 2025 | CLM-USW-SF-20251002 | 6 | $4,850 | $29,100 | $23,280 | $5,820 | Paid |
| Dec 2025 | CLM-USW-SF-20251003 | 8 | $4,850 | $38,800 | $31,040 | $7,760 | Paid |
| Jan 2026 | CLM-USW-SF-20260101 | 10 | $4,850 | $48,500 | $38,800 | $9,700 | Paid |
| Feb 2026 | CLM-USW-SF-20260201 | 12 | $4,850 | $58,200 | $46,560 | $11,640 | Paid |
| Mar 2026 | CLM-USW-SF-20260301 | 14 | $4,850 | $67,900 | $54,320 | $13,580 | Paid |

**Story:** Perfect reimbursement — every claim paid at 80% of allowed (standard Part B cost-sharing). Units billed scale with her prescribing ramp. UCSF has Immunonco as Preferred Specialty with no PA. This is what access looks like when formulary, claims, and prescribing all align.

**LWC signals:** Strong Access Position

---

### Dr. Matthew Wong — Reimbursement Collapse

**Channel:** Medical Benefit Part B | **Site:** Hospital Outpatient (Stanford) | **Diagnosis:** NSCLC Unspecified (C34.90)

| Period | Units | Allowed | Paid | Status |
|---|---|---|---|---|
| Oct 2025 | 4 | $19,400 | $15,520 | **Paid** |
| Nov 2025 | 6 | $29,100 | $23,280 | **Paid** |
| Dec 2025 | 6 | $29,100 | $23,280 | **Paid** |
| Jan 2026 | 4 | $19,400 | $13,580 | **Partial Denial** |
| Feb 2026 | 2 | $9,700 | $7,760 | **Paid** |
| Mar 2026 | 2 | $9,700 | $0 | **Denied — PA Required** |

**Story:** Claims mirror his prescribing pullback. Units peaked at 6 in Nov-Dec, then declined. The Jan 2026 partial denial was the first warning — PA wasn't maintained as he started pulling back. Feb was paid but at reduced volume. By Mar 2026, full denial because PA was required but not submitted. The cascade: colitis events → prescribing hesitation → PA process drops → claim denial → further pullback.

**LWC signals:** Claims Denied (Mar 2026), Partial Reimbursement (Jan 2026)

---

### Dr. Kevin Patel — Pharmacy Benefit Path

**Channel:** Pharmacy Benefit | **Diagnosis:** NSCLC Lower lobe, right (C34.31)

| Period | Units | Paid | Status |
|---|---|---|---|
| Oct 2025 | — | $10,000 | Paid |
| Feb 2026 | — | $20,000 | Paid |
| Mar 2026 | — | $20,000 | Paid |

**Story:** Kaiser routes Immunonco through Pharmacy Benefit, not Part B buy-and-bill. Only 3 claims in 6 months reflects his constrained Immunonco volume. Claims that get through are paid — the barrier is the formulary step therapy requirement preventing prescriptions, not claim denials. Gaps (Nov, Dec, Jan) reflect periods where no new Immunonco prescriptions were filled.

**LWC signals:** P&T Review Upcoming (Kaiser Pending), Step Therapy Required (Kaiser)

---

### Dr. Brian Sullivan — Minimal But Clean

**Channel:** Medical Benefit Part B | **Site:** Hospital Outpatient (CPMC) | **Diagnosis:** NSCLC Upper lobe, right (C34.11)

| Period | Units | Paid | Status |
|---|---|---|---|
| Jan 2026 | 2 | $7,760 | Paid |
| Mar 2026 | 2 | $7,760 | Paid |

**Story:** Only 2 claims — consistent with his 1–2 TRx/month. Both paid without issue. Sutter Health Plus formulary has Immunonco at Tier 2 with PA, but his few claims cleared. The barrier isn't access — it's conviction. He's an Onclaris loyalist who hasn't been motivated to switch.

**LWC signals:** None critical

---

### Dr. Nina Chandra — VA/Government Channel (340B Pricing)

**Channel:** VA/Government | **Site:** VA Medical Center | **Diagnosis:** NSCLC Upper lobe, unspecified (C34.10)

| Period | Units | ASP/Unit | Paid | Status |
|---|---|---|---|---|
| Nov 2025 | 2 | $3,395 | $6,790 | Paid |
| Dec 2025 | 4 | $3,395 | $13,580 | Paid |
| Jan 2026 | 6 | $3,395 | $20,370 | Paid |
| Feb 2026 | 8 | $3,395 | $27,160 | Paid |
| Mar 2026 | 10 | $3,395 | $33,950 | Paid |

**Story:** VA uses 340B ceiling pricing at $3,395/unit (vs $4,850 commercial ASP) — a 30% discount. Every claim paid, steadily growing with her prescribing ramp. Zero patient responsibility (VA covers 100%). No PA barriers. This is the most cost-effective channel in the territory, demonstrating how government formulary access + 340B pricing enables rapid adoption.

**LWC signals:** Strong Access Position

---

## Buy-and-Bill Economics Summary

| Channel | ASP/Unit | Payer Pays | Patient Pays | PA Required |
|---|---|---|---|---|
| Medicare Part B (Thornton) | $4,850 | 80% | 20% | No (UCSF) |
| Commercial Part B (Wong) | $4,850 | 70–80% | 20–30% | Yes (Anthem) |
| Pharmacy Benefit (Patel) | Varies | Flat copay | Fixed copay | Yes + step therapy |
| VA 340B (Chandra) | $3,395 | 100% | $0 | No |

---

## How to Load

```apex
DemoDataLoader.loadScenario('demo_claims_oncology_usw_sf');
DemoDataLoader.loadScenario('demo_formulary_oncology_usw_sf');
```

Both datasets should be loaded together. Formulary data is global (not HCP-specific) and appears on every HCP's `accessStatus` LWC view.
