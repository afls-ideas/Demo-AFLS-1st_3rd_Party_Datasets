# Demo AFLS Specialty Pharmacy Channel

LWC component that visualizes specialty pharmacy dispensing performance across multiple SP channels for an HCP's patients.

## Data Source

- **Wire:** `getDataForAccount` with `dataType: 'specialty_pharmacy'`
- **Scenario:** `demo_specialty_pharmacy_oncology_usw_sf`

## What It Shows

- **Distribution Flow Diagram:** Manufacturer (Makana Pharma) at top with branch lines flowing to each SP channel below, showing how patients are distributed across pharmacies by payer
- **SP Channel Cards:** Each pharmacy displayed with PDC adherence hero number, total fills, fill time, abandonment rate, color-coded by performance tier
- **SP Comparison Table:** Ranked table with PDC bar charts, fill metrics, copay status — lets the rep compare channels at a glance
- **Detail Table:** Lightning-datatable with per-period dispensing metrics

## Signals Detected

| Signal | Condition | Level |
|---|---|---|
| Channel Performance Gap | Best vs worst SP PDC gap > 10 points | error |
| Low Adherence | PDC < 85% (error if < 80%) | warning/error |
| High Abandonment | Abandonment > 15% (error if > 20%) | warning/error |
| Slow Fill | Avg days to fill > 5 (error if > 7) | warning/error |
| Copay Dropped | Copay assistance was active, now inactive | warning |
| Top Channel | PDC >= 93% and abandonment <= 5% | success |

Each signal recommends Patient Support Program (PSP) enrollment for low-adherence channels.

## HCP Scenarios (SP-ONC-USW-SF-001)

### Dr. Lisa Thornton — Multi-Channel with Diverging Performance

- **Channels:** Optum Specialty, CVS Specialty, Accredo Specialty, AllianceRx Walgreens (4 SPs)
- **Optum (primary):** PDC 0.94 → 0.95 → 0.96, abandonment 4% → 2%, fills 3 → 7. Top-tier performance.
- **CVS:** PDC 0.86 → 0.83 → 0.78, abandonment 12% → 20%, copay dropped in Feb 2026. Deteriorating channel.
- **Accredo:** PDC 0.91 → 0.92 → 0.93, abandonment 6% → 4%. Steady performer.
- **AllianceRx:** PDC 0.88 → 0.89 → 0.91, abandonment 10% → 6%. Improving.
- **Expected signals:** Channel Performance Gap (Optum 0.96 vs CVS 0.78 = 18pt gap), Low Adherence (CVS < 80%), High Abandonment (CVS 20%), Copay Dropped (CVS), Top Channel (Optum)
- **Demo story:** Richest multi-channel view. Optum is the gold standard, CVS is collapsing — copay assistance dropped and patients are abandoning. Rep should escalate CVS channel issues and recommend PSP enrollment for CVS patients.

### Dr. Matthew Wong — Single Channel Decline

- **Channel:** CVS Specialty only
- **CVS:** PDC 0.88 → 0.91 → 0.82 → 0.78 → 0.74, abandonment 10% → 22%, copay dropped Feb 2026
- **Expected signals:** Low Adherence (PDC < 80%), High Abandonment (22%), Copay Dropped
- **Demo story:** Mirrors his prescribing collapse. CVS adherence and abandonment track his safety-event-driven pullback. Copay assistance stopped as patients discontinued. The SP data corroborates the access collapse narrative visible in the Rx trend.

### Dr. Kevin Patel — Kaiser Closed Pharmacy

- **Channel:** Kaiser Specialty Pharmacy only
- **Kaiser:** PDC 0.70 → 0.75 → 0.78 → 0.80, abandonment 25% → 15%, copay started Feb 2026
- **Expected signals:** Low Adherence (PDC < 85%), High Abandonment (25% initially, improving)
- **Demo story:** Kaiser's closed pharmacy system has the lowest adherence in the territory but is slowly improving. High initial abandonment driven by formulary step therapy requirements. Copay assistance recently activated — a positive sign. This channel is constrained by the Kaiser formulary blocker, not by pharmacy performance.

### Dr. Brian Sullivan — Stable Single Channel

- **Channel:** Accredo Specialty Pharmacy only
- **Accredo:** PDC 0.85 → 0.88 → 0.88 → 0.90, abandonment 12% → 8%, copay active throughout
- **Expected signals:** None critical — PDC borderline (just at 85% threshold), gradually improving
- **Demo story:** Low-volume but stable. His few Immunonco patients are well-managed through Accredo. Consistent copay assistance. No alarming trends — this reflects his cautious, small-scale adoption.

### Dr. Nina Chandra — VA Gold Standard

- **Channel:** VA Consolidated Mail Outpatient Pharmacy (CMOP) only
- **VA CMOP:** PDC 0.95 → 0.96 → 0.97 → 0.98 → 0.98, abandonment 2% → 1%, no copay needed (340B)
- **Expected signals:** Top Channel (PDC 0.98, abandonment 1%)
- **Demo story:** Near-perfect adherence, zero cost barriers. VA's 340B ceiling pricing eliminates patient financial burden. CMOP is the highest-performing channel in the territory. This is what frictionless access looks like — no PA, no copay, no abandonment. The benchmark against which all other channels should be measured.

## Placement

Add to Account record page (Person Account / HCP). Targets: `lightning__RecordPage`, `lightning__Tab`.
