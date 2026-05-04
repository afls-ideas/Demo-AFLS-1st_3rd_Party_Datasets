# Specialty Pharmacy Data — SP-ONC-USW-SF-001

**Static Resource:** `demo_specialty_pharmacy_oncology_usw_sf`
**Type:** `specialty_pharmacy`
**Records:** 31
**Period:** Oct 2025 – Mar 2026 (bimonthly)
**LWC:** `lscMobileInline_spDispensing` (Demo AFLS Specialty Pharmacy Channel)

---

## What This Dataset Represents

Specialty pharmacy dispensing data — the kind of data pharma manufacturers receive from their SP network (Optum, CVS, Accredo, etc.) or from hub/REMS programs. Each record is one HCP × pharmacy × period, with fill counts, adherence (PDC), abandonment rates, and copay assistance status.

This dataset maps how patients flow through the SP distribution channel after a prescription is written. It answers: **"Are patients actually filling and staying on therapy, and which pharmacy channels are performing?"**

---

## Schema

| Field | Type | Description |
|---|---|---|
| `scenario_id` | String | `SP-ONC-USW-SF-001` |
| `hcp_name` | String | Prescribing HCP |
| `product` | String | `Immunonco (US)` |
| `pharmacy_name` | String | SP channel name |
| `period` | Date | Reporting period |
| `fills` | Integer | Total prescriptions filled |
| `refills` | Integer | Refill count (subset of fills) |
| `avg_days_to_fill` | Integer | Average days from Rx written to dispensed |
| `abandonment_rate` | Float | % of prescriptions written but never filled (0.0–1.0) |
| `adherence_pdc` | Float | Proportion of Days Covered — adherence measure (0.0–1.0) |
| `reversal_rate` | Float | % of fills reversed/returned |
| `payer_segment` | String | Insurance plan routing to this SP |
| `copay_assistance_used` | Boolean | Whether copay card/assistance is active |
| `avg_copay_after_assist` | Float | Patient OOP cost after copay assistance ($) |

---

## SP Channel Map

| Pharmacy | HCP Routed | Payer | Channel Type |
|---|---|---|---|
| Optum Specialty Pharmacy | Lisa Thornton | UnitedHealthcare Commercial | Open network SP |
| CVS Specialty | Lisa Thornton, Matthew Wong | Anthem Blue Cross, Aetna Commercial | Open network SP |
| Accredo Specialty Pharmacy | Lisa Thornton, Brian Sullivan | Cigna, Sutter Health Plus | Open network SP |
| AllianceRx Walgreens | Lisa Thornton | Medicare Part D | Open network SP |
| Kaiser Specialty Pharmacy | Kevin Patel | Kaiser Permanente | Closed pharmacy system |
| VA CMOP | Nina Chandra | VA/Government | Government pharmacy |

---

## HCP Stories

### Dr. Lisa Thornton — Multi-Channel with Diverging Performance

**4 SP channels** — the richest multi-channel view in the territory.

| Pharmacy | Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|---|
| **Optum** | Oct 2025 | 3 | 0.94 | 4% | Active ($35) |
| **Optum** | Dec 2025 | 5 | 0.95 | 3% | Active ($35) |
| **Optum** | Feb 2026 | 7 | 0.96 | 2% | Active ($35) |
| **CVS** | Oct 2025 | 2 | 0.86 | 12% | Active ($55) |
| **CVS** | Dec 2025 | 3 | 0.83 | 15% | Active ($55) |
| **CVS** | Feb 2026 | 2 | 0.78 | 20% | **Dropped** |
| **Accredo** | Nov 2025 | 2 | 0.91 | 6% | Active ($40) |
| **Accredo** | Jan 2026 | 4 | 0.92 | 5% | Active ($40) |
| **Accredo** | Mar 2026 | 5 | 0.93 | 4% | Active ($40) |
| **AllianceRx** | Nov 2025 | 1 | 0.88 | 10% | Active ($25) |
| **AllianceRx** | Jan 2026 | 2 | 0.89 | 8% | Active ($25) |
| **AllianceRx** | Mar 2026 | 3 | 0.91 | 6% | Active ($25) |

**Story:** Optum is the gold standard (PDC 0.96, abandonment 2%). CVS is collapsing — PDC dropped from 0.86 to 0.78 and copay assistance was dropped in Feb 2026, causing abandonment to spike to 20%. Accredo and AllianceRx are steady mid-tier performers, both improving. The 18-point PDC gap between Optum and CVS is the headline finding.

**LWC signals:** Channel Performance Gap (18pt), Low Adherence (CVS < 80%), High Abandonment (CVS 20%), Copay Dropped (CVS), Top Channel (Optum)

---

### Dr. Matthew Wong — Single Channel Decline

**1 SP channel** — CVS Specialty only.

| Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|
| Oct 2025 | 5 | 0.88 | 10% | Active ($55) |
| Nov 2025 | 7 | 0.90 | 8% | Active ($55) |
| Dec 2025 | 8 | 0.91 | 6% | Active ($55) |
| Jan 2026 | 6 | 0.82 | 15% | Active ($55) |
| Feb 2026 | 4 | 0.78 | 18% | **Dropped** |
| Mar 2026 | 3 | 0.74 | 22% | **Dropped** |

**Story:** Mirrors his prescribing collapse. CVS adherence peaked at 0.91 in Dec 2025, then cratered to 0.74 by Mar 2026. Copay assistance dropped in Feb as patients discontinued. Abandonment spiked to 22% — nearly 1 in 4 prescriptions written are never filled. The SP data corroborates the safety-driven access collapse visible across all his datasets.

**LWC signals:** Low Adherence (PDC 0.74 < 80%), High Abandonment (22% > 20%), Copay Dropped

---

### Dr. Kevin Patel — Kaiser Closed Pharmacy

**1 SP channel** — Kaiser Specialty Pharmacy (closed system).

| Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|
| Oct 2025 | 1 | 0.70 | 25% | Not active |
| Dec 2025 | 2 | 0.75 | 20% | Not active |
| Feb 2026 | 2 | 0.78 | 18% | **Activated** ($30) |
| Mar 2026 | 3 | 0.80 | 15% | Active ($30) |

**Story:** Lowest adherence in the territory but slowly improving. High initial abandonment (25%) driven by Kaiser's step therapy requirement — patients must try Onclaris first. Copay assistance was recently activated in Feb 2026 as exception requests started succeeding. The trajectory is positive (PDC 0.70 → 0.80, abandonment 25% → 15%) but still below threshold. The channel is constrained by the formulary, not by pharmacy operations.

**LWC signals:** Low Adherence (PDC < 85%), High Abandonment (25% initially)

---

### Dr. Brian Sullivan — Stable Single Channel

**1 SP channel** — Accredo Specialty Pharmacy.

| Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|
| Oct 2025 | 1 | 0.85 | 12% | Active ($40) |
| Dec 2025 | 1 | 0.88 | 10% | Active ($40) |
| Jan 2026 | 2 | 0.88 | 10% | Active ($40) |
| Mar 2026 | 2 | 0.90 | 8% | Active ($40) |

**Story:** Low-volume but stable and gradually improving. PDC went from borderline (0.85) to solid (0.90). Copay assistance active throughout. His few Immunonco patients are well-managed. No dramatic signals — this reflects his cautious, small-scale adoption with good follow-through.

**LWC signals:** None critical — borderline PDC, improving

---

### Dr. Nina Chandra — VA Gold Standard

**1 SP channel** — VA Consolidated Mail Outpatient Pharmacy (CMOP).

| Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|
| Nov 2025 | 2 | 0.95 | 2% | Not needed (340B) |
| Dec 2025 | 4 | 0.96 | 1% | Not needed (340B) |
| Jan 2026 | 6 | 0.97 | 1% | Not needed (340B) |
| Feb 2026 | 8 | 0.98 | 1% | Not needed (340B) |
| Mar 2026 | 10 | 0.98 | 1% | Not needed (340B) |

**Story:** Near-perfect performance across every metric. PDC 0.95 → 0.98, abandonment consistently at 1–2%, fills scaling with her prescribing ramp (2 → 10). No copay needed because VA 340B ceiling pricing eliminates patient financial burden. This is what frictionless specialty pharmacy looks like — the benchmark against which all other channels should be measured.

**LWC signals:** Top Channel (PDC >= 93%, abandonment <= 5%)

---

## Territory Channel Comparison

| SP Channel | Best PDC | Worst PDC | Abandonment Range | Copay Status |
|---|---|---|---|---|
| VA CMOP | 0.98 | 0.95 | 1–2% | Not needed (340B) |
| Optum | 0.96 | 0.94 | 2–4% | Active ($35) |
| Accredo | 0.93 | 0.85 | 4–12% | Active ($40) |
| AllianceRx | 0.91 | 0.88 | 6–10% | Active ($25) |
| CVS (Thornton) | 0.86 | 0.78 | 12–20% | Dropped Feb 2026 |
| CVS (Wong) | 0.91 | 0.74 | 6–22% | Dropped Feb 2026 |
| Kaiser | 0.80 | 0.70 | 15–25% | Activated Feb 2026 |

**Key insight:** CVS is the weakest open-network SP — both Thornton's and Wong's CVS channels show declining adherence and lost copay assistance. VA CMOP is the gold standard. The gap between best (0.98) and worst (0.70) is 28 PDC points.

---

## How to Load

```apex
DemoDataLoader.loadScenario('demo_specialty_pharmacy_oncology_usw_sf');
```
