# Prescription Data — SP-ONC-USW-SF-001

**Static Resource:** `demo_prescription_oncology_usw_sf`
**Type:** `prescription`
**Records:** 66
**Period:** Oct 2025 – Mar 2026 (monthly)
**LWC:** `lscMobileInline_rxTrend` (Demo AFLS Prescribing Snapshot)

---

## What This Dataset Represents

Third-party prescription data (TRx/NRx) from pharmacy claims aggregators — the kind of data IQVIA, Symphony Health, or Veeva Compass would provide. Each record is one HCP × product × period × payer segment, showing total prescriptions (TRx) and new prescriptions (NRx) written.

This dataset tracks the Immunonco launch trajectory across 5 prescribers, showing adoption curves, competitive dynamics, and payer mix. It answers the rep's core question: **"Is this HCP writing my product, and is the trend going up or down?"**

---

## Schema

| Field | Type | Description |
|---|---|---|
| `scenario_id` | String | `SP-ONC-USW-SF-001` |
| `hcp_name` | String | Prescriber name (matched to `Account.Name`) |
| `specialty` | String | Medical Oncology or Hematology/Oncology |
| `institution` | String | Hospital/practice affiliation |
| `product` | String | Drug name — Immunonco (US), Onclaris, Tecriva, Osivant |
| `product_category` | String | MOA class — PD-L1/TGF-B, PD-1, PD-L1, TKI |
| `period` | Date | Month (first of month, e.g. `2025-10-01`) |
| `trx` | Integer | Total prescriptions dispensed |
| `nrx` | Integer | New prescriptions (subset of TRx) |
| `payer_segment` | String | Commercial or Medicare Part D |

---

## Competitive Landscape

| Product | Category | Role in Demo |
|---|---|---|
| **Immunonco (US)** | PD-L1/TGF-B Bifunctional | Our product — newly launched |
| **Onclaris** | PD-1 Inhibitor | Market leader, entrenched formulary position |
| **Tecriva** | PD-L1 Inhibitor | Third-line option, restricted access |
| **Osivant** | TKI | Different MOA, used in combination/sequencing |

---

## HCP Stories

### Dr. Lisa Thornton — Champion Prescriber

**Institution:** UCSF Medical Center | **Specialty:** Medical Oncology

| Period | Immunonco TRx | Onclaris TRx | Tecriva TRx | Payer |
|---|---|---|---|---|
| Oct 2025 | 4 (Comm) + 8 (MedD) | 12 | 3 | Split |
| Nov 2025 | 10 | — | — | Commercial |
| Dec 2025 | 6 (Comm) + 12 (MedD) | 8 | — | Split |
| Jan 2026 | 14 | — | 2 | Commercial |
| Feb 2026 | 16 | — | — | Commercial |
| Mar 2026 | 9 (Comm) + 18 (MedD) | 5 | 1 | Split |

**Story:** Classic champion adoption. Immunonco ramps steadily from 4 → 18 TRx while Onclaris declines from 12 → 5. By Mar 2026, Immunonco is her dominant IO agent. Strong NRx indicates she's starting new patients on Immunonco, not just maintaining existing ones. Payer mix shows both commercial and Medicare Part D, reflecting her academic medical center patient population.

**LWC signals:** Strong Growth (>15% period-over-period increase)

---

### Dr. Matthew Wong — Access Collapse

**Institution:** Stanford Health Care | **Specialty:** Medical Oncology

| Period | Immunonco TRx | Onclaris TRx | Tecriva TRx |
|---|---|---|---|
| Oct 2025 | 6 | 4 | 3 |
| Nov 2025 | 8 | — | — |
| Dec 2025 | 10 | 5 | — |
| Jan 2026 | 8 | 7 | — |
| Feb 2026 | 6 | — | — |
| Mar 2026 | 4 | 11 | 3 |

**Story:** Started strong — Immunonco peaked at 10 TRx in Dec 2025, then reversed to 4 by Mar 2026. Meanwhile Onclaris recovered from 4 → 11. Two Grade 3 colitis events (see Medical Events dataset) eroded his confidence. Patients are switching back to Onclaris. The prescribing data alone shows the reversal; cross-referencing with safety and claims data reveals why.

**LWC signals:** Trend Reversal (TRx declining >20%), Competitor Gaining (Onclaris up 30%+ while Immunonco declining)

---

### Dr. Kevin Patel — Formulary Blocker

**Institution:** Kaiser Permanente | **Specialty:** Medical Oncology

| Period | Immunonco TRx | Onclaris TRx | Tecriva TRx |
|---|---|---|---|
| Oct 2025 | 1 | 10 | 2 |
| Nov 2025 | — | 11 | — |
| Dec 2025 | 2 | 12 | — |
| Jan 2026 | — | 11 | — |
| Feb 2026 | 3 | 12 | — |
| Mar 2026 | 3 | 13 | 1 |

**Story:** Immunonco is stuck at 1–3 TRx because Kaiser requires step therapy through Onclaris. Onclaris dominates at 10–13 TRx/month and is still growing. The few Immunonco prescriptions are exception requests that made it through. P&T review scheduled Jun 2026 — until then, this HCP is formulary-locked. Tecriva is fading (2 → 1).

**LWC signals:** Low Adoption (Immunonco TRx <= 3)

---

### Dr. Brian Sullivan — Community Late Adopter

**Institution:** Sutter Health CPMC | **Specialty:** Hematology/Oncology

| Period | Immunonco TRx | Onclaris TRx | Osivant TRx |
|---|---|---|---|
| Oct 2025 | 1 | 14 | 5 |
| Nov 2025 | — | 15 | — |
| Dec 2025 | 1 | 16 | — |
| Jan 2026 | 2 | 15 | 6 |
| Feb 2026 | — | 16 | — |
| Mar 2026 | 2 | 17 | 7 |

**Story:** Highest-volume prescriber in the territory by total scripts, but almost all Onclaris (14 → 17 TRx). Immunonco stays flat at 1–2 TRx. He also prescribes Osivant (TKI) for combination/sequencing — no Tecriva at all. His Immunonco patients are doing well (see Hub data: 100% persistency) but he hasn't been convinced to switch from Onclaris at scale. This is a peer-influence and clinical evidence opportunity.

**LWC signals:** Low Adoption (Immunonco TRx <= 3), Competitor Gaining (Onclaris growing)

---

### Dr. Nina Chandra — VA Success Story

**Institution:** Zuckerberg San Francisco General | **Specialty:** Medical Oncology

| Period | Immunonco TRx | Onclaris TRx | Tecriva TRx | Payer |
|---|---|---|---|---|
| Oct 2025 | 0 | 8 | 2 | — |
| Nov 2025 | 2 | — | — | VA |
| Dec 2025 | 4 | 6 | — | VA |
| Jan 2026 | 2 (Comm) + 6 (VA) | — | — | Split |
| Feb 2026 | 8 | — | — | VA |
| Mar 2026 | 4 (Comm) + 10 (VA) | 3 | 1 | Split |

**Story:** Started from zero in Oct 2025 and ramped aggressively to 10 TRx by Mar 2026. VA formulary has no PA barriers, enabling frictionless adoption. Dual-channel prescriber: started with VA patients, then expanded to commercial (2 → 4 TRx). Onclaris declined from 8 → 3 as Immunonco took share. Mirror of Dr. Thornton's trajectory but from a standing start and VA-first.

**LWC signals:** Strong Growth (>15% period-over-period increase)

---

## Cross-HCP Territory Summary

| HCP | Immunonco Trend | Latest TRx | Market Share Trajectory | Primary Barrier |
|---|---|---|---|---|
| Lisa Thornton | Ramp ↑ | 18 | Growing → dominant | None (champion) |
| Matthew Wong | Peak → decline ↓ | 4 | Lost to Onclaris | Safety events (colitis) |
| Kevin Patel | Flat → slow growth | 3 | Minimal | Kaiser formulary step therapy |
| Brian Sullivan | Flat | 2 | Negligible | Conviction / habit (Onclaris loyalist) |
| Nina Chandra | Ramp ↑ (from 0) | 10 | Growing → dominant | None (VA frictionless) |

---

## How to Load

```apex
DemoDataLoader.loadScenario('demo_prescription_oncology_usw_sf');
```

Or use the Demo Data Launcher LWC. The controller matches HCP records by `Account.Name` (case-insensitive).
