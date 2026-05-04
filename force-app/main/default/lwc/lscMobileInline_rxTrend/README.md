# Demo AFLS Prescribing Snapshot

LWC component that displays prescribing trends for an HCP, showing Immunonco adoption relative to competitors.

## Data Source

- **Wire:** `getDataForAccount` with `dataType: 'prescription'`
- **Scenario:** `demo_prescription_oncology_usw_sf` (or any prescription-type scenario)

## What It Shows

- **KPI Cards:** Immunonco TRx (with trend arrow), Market Share %, New Patients (NRx), Products Prescribed count
- **Product Breakdown:** Horizontal bar chart comparing TRx across products, with trend pills (Up/Down/Stable)
- **Detail Table:** Lightning-datatable with Product, Category, Period, TRx, NRx, Payer Segment

## Signals Detected

| Signal | Condition | Level |
|---|---|---|
| Trend Reversal | TRx declining >20% vs prior period | warning |
| Strong Growth | TRx growing >15% vs prior period | success |
| Low Adoption | Total Immunonco TRx <= 3 | error |
| Zero Adoption | No Immunonco prescriptions on record | error |
| Competitor Gaining | Competitor TRx growing 30%+ while Immunonco flat/declining | warning |

## HCP Scenarios (SP-ONC-USW-SF-001)

### Dr. Lisa Thornton — Champion Prescriber

- **Institution:** UCSF Medical Center (Medical Oncology)
- **Immunonco TRx:** 4 → 8 → 10 → 12 → 14 → 16 → 18 (steady ramp over 6 months)
- **Onclaris TRx:** 12 → 8 → 5 (declining as Immunonco grows)
- **Tecriva TRx:** 3 → 2 → 1 (marginal, fading)
- **Expected signals:** Strong Growth (Immunonco up >15% period-over-period)
- **Demo story:** Classic champion adoption curve. Immunonco overtakes Onclaris by Dec 2025 and dominates by Mar 2026. Market share shifts decisively toward our product.

### Dr. Matthew Wong — Access Collapse

- **Institution:** Stanford Health Care (Medical Oncology)
- **Immunonco TRx:** 6 → 8 → 10 → 8 → 6 → 4 (peaked Dec, then reversed)
- **Onclaris TRx:** 4 → 5 → 7 → 11 (gaining as Immunonco declines)
- **Tecriva TRx:** 3 → 3 (flat, minor player)
- **Expected signals:** Trend Reversal (TRx declining >20%), Competitor Gaining (Onclaris rising while Immunonco falls)
- **Demo story:** Started strong but Grade 3 colitis events drove prescribing pullback. Patients switching back to Onclaris. This HCP shows what happens when safety events erode confidence.

### Dr. Kevin Patel — Formulary Blocker

- **Institution:** Kaiser Permanente (Medical Oncology)
- **Immunonco TRx:** 1 → 2 → 3 → 3 (minimal, stuck behind formulary wall)
- **Onclaris TRx:** 10 → 11 → 12 → 11 → 12 → 13 (dominant, entrenched)
- **Tecriva TRx:** 2 → 1 (fading)
- **Expected signals:** Low Adoption (Immunonco TRx <= 3)
- **Demo story:** Kaiser requires step therapy through Onclaris before Immunonco. P&T review not until Jun 2026. Immunonco creeping up via exception requests but Onclaris remains the workhorse. Opportunity: KAM engagement with Kaiser P&T.

### Dr. Brian Sullivan — Community Late Adopter

- **Institution:** Sutter Health CPMC (Hematology/Oncology)
- **Immunonco TRx:** 1 → 1 → 2 → 2 (minimal, flat)
- **Onclaris TRx:** 14 → 15 → 16 → 15 → 16 → 17 (dominant and growing)
- **Osivant TRx:** 5 → 6 → 7 (TKI usage, different MOA)
- **Expected signals:** Low Adoption (Immunonco TRx <= 3), Competitor Gaining (Onclaris growing)
- **Demo story:** Loyal Onclaris prescriber, not yet convinced to switch. His few Immunonco patients are doing well but volume hasn't moved. Needs clinical evidence or peer influence to tip adoption. No Tecriva — uses Osivant as his combination/sequencing agent.

### Dr. Nina Chandra — VA Success Story

- **Institution:** Zuckerberg San Francisco General (Medical Oncology)
- **Immunonco TRx:** 0 → 2 → 4 → 6 → 8 → 10 (aggressive ramp from zero)
- **Onclaris TRx:** 8 → 6 → 4 → 3 (declining as Immunonco takes share)
- **Tecriva TRx:** 2 → 1 (fading)
- **Expected signals:** Strong Growth (Immunonco up >15% period-over-period)
- **Demo story:** Started from zero and ramped aggressively. VA formulary has no PA barriers, making adoption frictionless. Dual-channel prescriber (VA + commercial). By Mar 2026, Immunonco is her dominant IO agent. Mirror image of Dr. Thornton's trajectory but from a standing start.

## Placement

Add to Account record page (Person Account / HCP). Targets: `lightning__RecordPage`, `lightning__Tab`.
