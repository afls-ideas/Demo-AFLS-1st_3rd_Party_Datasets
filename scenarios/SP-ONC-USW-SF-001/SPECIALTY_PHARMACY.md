# Specialty Pharmacy Data — SP-ONC-USW-SF-001

**Static Resource:** `demo_specialty_pharmacy_oncology_usw_sf`
**Type:** `specialty_pharmacy`
**Records:** 53
**Period:** Oct 2025 – Mar 2026 (bimonthly)
**LWC:** `lscMobileInline_spDispensing` (Demo AFLS Specialty Pharmacy Channel)

---

## What This Dataset Represents

Specialty pharmacy dispensing data — the kind of data pharma manufacturers receive from their SP network (Optum, Accredo, ABC Pharmacy, etc.) or from hub/REMS programs. Each record is one HCP × pharmacy × period, with fill counts, adherence (PDC), abandonment rates, and copay assistance status.

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

| Pharmacy | HCPs Routed | Payer(s) | Channel Type |
|---|---|---|---|
| Optum Specialty Pharmacy | Thornton, Wong, Patel | UnitedHealthcare Commercial | Open network SP |
| ABC Pharmacy | Thornton, Wong, Patel, Sullivan | Anthem Blue Cross CA, Aetna Commercial | Open network SP |
| Accredo Specialty Pharmacy | Thornton, Wong, Sullivan, Chandra | Cigna/ESI, Medi-Cal Managed | Open network SP |
| AllianceRx Walgreens | Thornton, Sullivan | UCSF Health Plan, Blue Shield CA | Open network SP |
| Kaiser Specialty Pharmacy | Patel | Kaiser Commercial | Closed pharmacy system |
| VA CMOP | Chandra | VA/Government | Government pharmacy |

---

## HCP Stories

### Dr. Lisa Thornton — Multi-Channel with Diverging Performance

**4 SP channels** — the richest multi-channel view in the territory.

| Pharmacy | Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|---|
| **Optum** | Oct 2025 | 3 | 0.94 | 4% | Active ($35) |
| **Optum** | Dec 2025 | 5 | 0.95 | 3% | Active ($35) |
| **Optum** | Feb 2026 | 7 | 0.96 | 2% | Active ($30) |
| **ABC** | Oct 2025 | 2 | 0.86 | 12% | Active ($55) |
| **ABC** | Dec 2025 | 3 | 0.83 | 15% | Active ($60) |
| **ABC** | Feb 2026 | 2 | 0.78 | 20% | **Dropped** |
| **Accredo** | Nov 2025 | 2 | 0.91 | 6% | Active ($40) |
| **Accredo** | Jan 2026 | 4 | 0.92 | 5% | Active ($40) |
| **Accredo** | Mar 2026 | 5 | 0.93 | 4% | Active ($38) |
| **AllianceRx** | Nov 2025 | 1 | 0.88 | 10% | Active ($45) |
| **AllianceRx** | Jan 2026 | 2 | 0.89 | 8% | Active ($42) |
| **AllianceRx** | Mar 2026 | 3 | 0.91 | 6% | Active ($40) |

**Story:** Optum is the gold standard (PDC 0.96, abandonment 2%). ABC Pharmacy is collapsing — PDC dropped from 0.86 to 0.78 and copay assistance was dropped in Feb 2026, causing abandonment to spike to 20%. Accredo and AllianceRx are steady mid-tier performers, both improving. The 18-point PDC gap between Optum and ABC is the headline finding.

**LWC signals:** Channel Performance Gap (18pt), Low Adherence (ABC < 80%), High Abandonment (ABC 20%), Copay Dropped (ABC), Top Channel (Optum)

---

### Dr. Matthew Wong — Multi-Channel with One Declining

**3 SP channels** — ABC Pharmacy declining while Optum and Accredo hold steady.

| Pharmacy | Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|---|
| **ABC** | Oct 2025 | 5 | 0.88 | 10% | Active ($50) |
| **ABC** | Nov 2025 | 7 | 0.90 | 8% | Active ($50) |
| **ABC** | Dec 2025 | 8 | 0.91 | 6% | Active ($45) |
| **ABC** | Jan 2026 | 6 | 0.82 | 15% | Active ($60) |
| **ABC** | Feb 2026 | 4 | 0.78 | 18% | **Dropped** |
| **ABC** | Mar 2026 | 3 | 0.74 | 22% | **Dropped** |
| **Optum** | Oct 2025 | 3 | 0.92 | 5% | Active ($40) |
| **Optum** | Dec 2025 | 4 | 0.93 | 4% | Active ($38) |
| **Optum** | Feb 2026 | 5 | 0.94 | 3% | Active ($35) |
| **Accredo** | Nov 2025 | 2 | 0.89 | 9% | Active ($45) |
| **Accredo** | Jan 2026 | 3 | 0.90 | 7% | Active ($42) |
| **Accredo** | Mar 2026 | 4 | 0.91 | 6% | Active ($40) |

**Story:** ABC Pharmacy mirrors his prescribing collapse on the Aetna book — PDC peaked at 0.91 in Dec 2025 then cratered to 0.74 by Mar 2026. Copay dropped in Feb as patients discontinued. But Optum (UHC) and Accredo (Cigna) patients are doing fine — PDC 0.94 and 0.91 respectively. The problem is payer-channel-specific, not HCP-wide.

**LWC signals:** Channel Performance Gap (Optum 0.94 vs ABC 0.74 = 20pt gap), Low Adherence (ABC < 80%), High Abandonment (ABC 22%), Copay Dropped (ABC)

---

### Dr. Kevin Patel — Three Channels, Wide Performance Spread

**3 SP channels** — Kaiser closed system, ABC Pharmacy struggling, Optum performing well.

| Pharmacy | Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|---|
| **Kaiser** | Oct 2025 | 1 | 0.70 | 25% | Not active |
| **Kaiser** | Dec 2025 | 2 | 0.75 | 20% | Not active |
| **Kaiser** | Feb 2026 | 2 | 0.78 | 18% | Activated ($55) |
| **Kaiser** | Mar 2026 | 3 | 0.80 | 15% | Active ($50) |
| **ABC** | Oct 2025 | 1 | 0.65 | 30% | Not active |
| **ABC** | Dec 2025 | 1 | 0.68 | 28% | Not active |
| **ABC** | Feb 2026 | 2 | 0.72 | 24% | Active ($65) |
| **Optum** | Nov 2025 | 1 | 0.87 | 8% | Active ($42) |
| **Optum** | Jan 2026 | 2 | 0.90 | 6% | Active ($38) |
| **Optum** | Mar 2026 | 3 | 0.92 | 4% | Active ($35) |

**Story:** Wide performance spread — Optum patients at 0.92 PDC while ABC Pharmacy patients at 0.72 and Kaiser at 0.80. ABC Pharmacy is the worst channel in the territory (30% initial abandonment, 9-day fills). Kaiser is constrained by formulary step therapy but slowly improving. Optum patients do well with consistent copay support.

**LWC signals:** Channel Performance Gap (Optum 0.92 vs ABC 0.72 = 20pt gap), Low Adherence (Kaiser, ABC), High Abandonment (ABC 24%, Kaiser), Slow Fill (ABC 7–9 days)

---

### Dr. Brian Sullivan — Three Channels, ABC Deteriorating

**3 SP channels** — Accredo stable, AllianceRx improving, ABC Pharmacy actively deteriorating.

| Pharmacy | Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|---|
| **Accredo** | Oct 2025 | 1 | 0.85 | 12% | Active ($55) |
| **Accredo** | Dec 2025 | 1 | 0.88 | 10% | Active ($50) |
| **Accredo** | Jan 2026 | 2 | 0.88 | 10% | Active ($50) |
| **Accredo** | Mar 2026 | 2 | 0.90 | 8% | Active ($45) |
| **ABC** | Oct 2025 | 1 | 0.79 | 18% | Active ($65) |
| **ABC** | Dec 2025 | 1 | 0.75 | 22% | **Dropped** |
| **ABC** | Jan 2026 | 1 | 0.72 | 25% | **Dropped** |
| **ABC** | Mar 2026 | 1 | 0.70 | 28% | **Dropped** |
| **AllianceRx** | Nov 2025 | 1 | 0.86 | 8% | Active ($48) |
| **AllianceRx** | Jan 2026 | 2 | 0.89 | 6% | Active ($44) |
| **AllianceRx** | Mar 2026 | 2 | 0.91 | 5% | Active ($40) |

**Story:** ABC Pharmacy is the worst and getting worse — PDC dropped from 0.79 to 0.70, fill times ballooned to 10 days, copay dropped in Dec 2025, abandonment at 28%. Accredo is steady (PDC 0.85 → 0.90) and AllianceRx is improving (0.86 → 0.91). The rep should escalate ABC Pharmacy and redirect Anthem patients to a better-performing channel.

**LWC signals:** Channel Performance Gap (AllianceRx 0.91 vs ABC 0.70 = 21pt gap), Low Adherence (ABC < 80%), High Abandonment (ABC 28%), Slow Fill (ABC 10 days), Copay Dropped (ABC)

---

### Dr. Nina Chandra — VA Primary + Medi-Cal Secondary

**2 SP channels** — VA CMOP gold standard, Accredo Medi-Cal secondary.

| Pharmacy | Period | Fills | PDC | Abandonment | Copay |
|---|---|---|---|---|---|
| **VA CMOP** | Nov 2025 | 2 | 0.95 | 2% | Not needed (340B) |
| **VA CMOP** | Dec 2025 | 4 | 0.96 | 1% | Not needed (340B) |
| **VA CMOP** | Jan 2026 | 6 | 0.97 | 1% | Not needed (340B) |
| **VA CMOP** | Feb 2026 | 8 | 0.98 | 1% | Not needed (340B) |
| **VA CMOP** | Mar 2026 | 10 | 0.98 | 1% | Not needed (340B) |
| **Accredo** | Nov 2025 | 1 | 0.91 | 5% | Not needed ($0) |
| **Accredo** | Jan 2026 | 2 | 0.93 | 4% | Not needed ($0) |
| **Accredo** | Mar 2026 | 3 | 0.94 | 3% | Not needed ($0) |

**Story:** Near-perfect performance across both channels. VA CMOP is the territory benchmark (PDC 0.98, abandonment 1%). Medi-Cal patients through Accredo also show strong adherence (PDC 0.94). No copay barriers in either channel — VA has 340B pricing, Medi-Cal covers fully. This is what frictionless specialty pharmacy looks like.

**LWC signals:** Top Channel (VA CMOP — PDC 0.98, abandonment 1%)

---

## Territory Channel Comparison

| SP Channel | Best PDC | Worst PDC | Abandonment Range | Copay Status |
|---|---|---|---|---|
| VA CMOP | 0.98 | 0.95 | 1–2% | Not needed (340B) |
| Optum | 0.96 | 0.87 | 2–8% | Active ($35–42) |
| Accredo | 0.94 | 0.85 | 3–12% | Active/Not needed |
| AllianceRx | 0.91 | 0.86 | 5–10% | Active ($40–48) |
| Kaiser | 0.80 | 0.70 | 15–25% | Activated Feb 2026 |
| ABC Pharmacy | 0.91 | 0.65 | 6–30% | Dropped across multiple HCPs |

**Key insight:** ABC Pharmacy is the weakest open-network SP — every HCP's ABC channel shows declining adherence and lost copay assistance. VA CMOP is the gold standard. The gap between best (0.98) and worst (0.65) is 33 PDC points. Optum is consistently the strongest commercial channel.

---

## How to Load

```apex
DemoDataLoader.loadScenario('demo_specialty_pharmacy_oncology_usw_sf');
```
