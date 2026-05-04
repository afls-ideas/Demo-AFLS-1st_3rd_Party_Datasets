# Scenario SP-ONC-USW-SF-001: Specialty Pharma Oncology — US-W San Francisco

**Org:** 260-lsdo
**Territory:** US-W-San Francisco
**Therapeutic Area:** Oncology (Solid Tumor — NSCLC)
**Product:** Immunonco (US) — PD-L1/TGF-B Bifunctional (IV infusion, buy-and-bill)
**Period:** Oct 2025 – Mar 2026 (6 months)
**Matching Strategy:** HCP name (no external ID / no NPI — controller resolves `hcp_name` against `Account.Name`)

---

## Data Sets Included

| File | Type | Records | Description |
|---|---|---|---|
| `demo_prescription_oncology_usw_sf` | prescription | 66 | TRx/NRx by HCP, product, payer segment, month |
| `demo_specialty_pharmacy_oncology_usw_sf` | specialty_pharmacy | 31 | SP dispensing across 4 SPs per HCP: fills, adherence PDC, abandonment, copay assist |
| `demo_claims_oncology_usw_sf` | claims | 22 | Part B buy-and-bill + pharmacy benefit claims with J-code, ASP, diagnosis, LOT |
| `demo_formulary_oncology_usw_sf` | formulary | 15 | Formulary status across 6 payers (UCSF, Kaiser, Anthem, Sutter, VA, Medicare Part B) |
| `demo_patient_journey_oncology_usw_sf` | patient_journey | 18 | ImmunoAssist Hub: referral → benefits verified → approved → started → on therapy funnel, PA, copay, abandonment, persistency |
| `demo_medical_event_oncology_usw_sf` | medical_event | 14 | Adverse events (graded, by organ system) + auto-detected safety signal |

---

## HCP Panel (5 Prescribers)

| HCP | Specialty | Institution | Immunonco Story Arc |
|---|---|---|---|
| **Dr. Jennifer Wu** | Medical Oncology | UCSF Helen Diller Comprehensive Cancer Center | **Champion prescriber.** Academic KOL, steady ramp from 8→18 TRx/mo. Strong UCSF formulary access (Preferred Specialty, no PA). High adherence (PDC 0.92→0.97). Manageable AEs (Grade 1-2 diarrhea, hypothyroidism, rash, fatigue). Hub running smoothly — 0 abandonments from access barriers. |
| **Dr. Marcus Chen** | Medical Oncology | Stanford Cancer Center | **Access collapse story.** Started strong (6→10 TRx), then reversed to 4 TRx by Mar 2026. Two Grade 3 colitis events — the second led to permanent Immunonco discontinuation. PA denials increasing (3 denied in Mar). SP abandonment spiked to 22%. Copay card enrollment dropped off. Hub shows deteriorating persistency (0.92→0.68). Patients switching back to Onclaris. |
| **Dr. Aisha Patel** | Medical Oncology | Kaiser Permanente San Francisco | **Formulary blocker.** Very low Immunonco adoption (1→3 TRx) because Kaiser requires step therapy through Onclaris. P&T review not until Jun 2026. Hub shows patients abandoning due to Kaiser formulary restriction. Immunonco slowly gaining as exception requests succeed. Onclaris remains her dominant IO agent (10→13 TRx). |
| **Dr. Thomas Brennan** | Hematology/Oncology | Sutter Health CPMC Cancer Center | **Community late adopter.** Minimal Immunonco usage (1→2 TRx) but stable. Onclaris is his workhorse (14→17 TRx). Sutter Health Plus formulary recently added Immunonco but SOC restricted to Sutter network. Low-risk AE profile (one Grade 1 rash). Hub shows 100% persistency — his few patients are doing well. Opportunity: he's not yet convinced to switch from Onclaris. |
| **Dr. Nadia Okonkwo** | Medical Oncology | San Francisco VA Medical Center | **VA success story.** Started from zero, ramped aggressively (0→10 TRx in 6 months). VA formulary has no PA barriers. VA pharmacy has near-perfect adherence (PDC 0.98) and zero abandonment. 340B ceiling pricing makes Immunonco cost-effective for VA. One Grade 3 colitis event in Mar 2026 — part of the safety signal cluster. Dual-channel: also writing commercial scrips (2→4 TRx). |

---

## Key Scenario Narratives

### 1. Immunonco Launch Trajectory
Immunonco launched mid-2025. This territory shows the first 6 months of real-world uptake. Dr. Wu and Dr. Okonkwo are driving growth, while Kaiser formulary restrictions (Dr. Patel) and safety events (Dr. Chen) create headwinds.

### 2. Grade 3+ Colitis Safety Signal
Three Grade 3+ colitis cases across Dr. Chen (2 events) and Dr. Okonkwo (1 event) triggered the auto-detection safety signal in Feb 2026. Dr. Chen's second event led to permanent discontinuation. The field alert was distributed territory-wide. This is a live demo trigger for the Pharmacovigilance agent workflow.

### 3. Kaiser Formulary Access Barrier
Kaiser Permanente Northern California has not yet added Immunonco to formulary — it requires step therapy through Onclaris. The P&T review is scheduled Jun 2026. Dr. Patel's patients are being abandoned at the PA stage or forced to start Onclaris first. This creates an opportunity for KAM engagement with Kaiser's P&T committee.

### 4. Buy-and-Bill Economics
Immunonco is an IV infusion covered under Medicare Part B (J-code J9999, ASP $4,850/unit). VA gets 340B ceiling pricing ($3,395/unit). The claims data shows the full reimbursement waterfall: allowed amounts, paid, patient responsibility. Dr. Chen's claims show a denial trajectory — partial denial in Jan, full denial in Mar when PA was required but not obtained (correlates with his colitis-driven prescribing pullback).

### 5. Specialty Pharmacy Channel Dynamics
Each HCP routes through a different SP: Optum (Wu), CVS (Chen), Kaiser internal (Patel), Accredo (Brennan), VA CMOP (Okonkwo). Adherence and abandonment vary dramatically by channel — VA CMOP has PDC 0.98 with zero cost barrier, while Kaiser SP has PDC 0.70-0.80 due to formulary restrictions.

---

## Competitive Landscape (in prescription data)

| Product | Category | Role |
|---|---|---|
| **Immunonco (US)** | PD-L1/TGF-B Bifunctional | Our product — newly launched |
| **Onclaris** | PD-1 Inhibitor | Market leader, entrenched preferred formulary position |
| **Tecriva** | PD-L1 Inhibitor | Third-line option, restricted access (step therapy, SOC limits) |
| **Osivant** | TKI | Different MOA, used in combination/sequencing |

---

## How to Load

All 6 datasets are loaded independently via the Demo Data Launcher LWC. Each static resource follows the naming convention `demo_<type>_oncology_usw_sf`. The controller matches HCP records by `Account.Name` (case-insensitive) since these datasets do not use NPI. Ensure the org has Account records with names matching the HCPs listed above (e.g., "Dr. Jennifer Wu").

Product matching is also by name — the product field value `Immunonco (US)` should match the Product record name in the org.
