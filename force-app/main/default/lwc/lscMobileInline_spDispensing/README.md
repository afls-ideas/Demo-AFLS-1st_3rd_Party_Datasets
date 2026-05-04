# Demo AFLS Specialty Pharmacy Channel

LWC component that visualizes specialty pharmacy dispensing performance across multiple SP channels for an HCP's patients.

## Data Source

- **Wire:** `getDataForAccount` with `dataType: 'specialty_pharmacy'`
- **Scenario:** `demo_specialty_pharmacy_oncology_usw_sf`

## What It Shows

- **Product Selector:** Dropdown to filter by product (supports multi-product portfolios)
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

- **Channels:** Optum Specialty, ABC Pharmacy, Accredo Specialty, AllianceRx Walgreens (4 SPs)
- **Optum (primary):** PDC 0.94 → 0.96, abandonment 4% → 2%, fills 3 → 7. Top-tier performance.
- **ABC Pharmacy:** PDC 0.86 → 0.78, abandonment 12% → 20%, copay dropped Feb 2026. Deteriorating channel.
- **Accredo:** PDC 0.91 → 0.93, abandonment 6% → 4%. Steady performer.
- **AllianceRx:** PDC 0.88 → 0.91, abandonment 10% → 6%. Improving.
- **Expected signals:** Channel Performance Gap (Optum 0.96 vs ABC 0.78 = 18pt gap), Low Adherence (ABC < 80%), High Abandonment (ABC 20%), Copay Dropped (ABC), Top Channel (Optum)
- **Demo story:** Richest multi-channel view. Optum is the gold standard, ABC Pharmacy is collapsing — copay assistance dropped and patients are abandoning. Rep should escalate ABC channel issues and recommend PSP enrollment for ABC patients.

### Dr. Matthew Wong — Multi-Channel with One Declining

- **Channels:** ABC Pharmacy, Optum Specialty, Accredo Specialty (3 SPs)
- **ABC Pharmacy (Aetna):** PDC 0.88 → 0.91 → 0.82 → 0.74, abandonment 10% → 22%, copay dropped Feb 2026. Collapsing.
- **Optum (UHC):** PDC 0.92 → 0.93 → 0.94, abandonment 5% → 3%. Strong and improving.
- **Accredo (Cigna):** PDC 0.89 → 0.90 → 0.91, abandonment 9% → 6%. Steady mid-tier.
- **Expected signals:** Channel Performance Gap (Optum 0.94 vs ABC 0.74 = 20pt gap), Low Adherence (ABC < 80%), High Abandonment (ABC 22%), Copay Dropped (ABC)
- **Demo story:** ABC Pharmacy mirrors his prescribing collapse on the Aetna book. Optum and Accredo patients are fine — the problem is payer-specific, not HCP-wide. The SP data lets the rep pinpoint the channel that needs intervention.

### Dr. Kevin Patel — Three Channels, Wide Performance Spread

- **Channels:** Kaiser Specialty, ABC Pharmacy, Optum Specialty (3 SPs)
- **Kaiser (closed system):** PDC 0.70 → 0.80, abandonment 25% → 15%, copay started Feb 2026. Improving but constrained by formulary.
- **ABC Pharmacy (Anthem):** PDC 0.65 → 0.72, abandonment 30% → 24%. Worst channel in territory.
- **Optum (UHC):** PDC 0.87 → 0.90 → 0.92, abandonment 8% → 4%. Strong performer.
- **Expected signals:** Channel Performance Gap (Optum 0.92 vs ABC 0.72 = 20pt gap), Low Adherence (Kaiser, ABC), High Abandonment (ABC 24%, Kaiser), Slow Fill (ABC 7–9 days)
- **Demo story:** Optum patients do well; Kaiser is improving but formulary-constrained; ABC is the worst channel in the territory with the slowest fills and highest abandonment. Three very different stories for the same HCP.

### Dr. Brian Sullivan — Three Channels, ABC Deteriorating

- **Channels:** Accredo Specialty, ABC Pharmacy, AllianceRx Walgreens (3 SPs)
- **Accredo (Cigna):** PDC 0.85 → 0.90, abandonment 12% → 8%. Steady improvement.
- **ABC Pharmacy (Anthem):** PDC 0.79 → 0.75 → 0.72 → 0.70, abandonment 18% → 28%, copay dropped Dec 2025. Actively deteriorating.
- **AllianceRx (Blue Shield CA):** PDC 0.86 → 0.89 → 0.91, abandonment 8% → 5%. Improving.
- **Expected signals:** Channel Performance Gap (AllianceRx 0.91 vs ABC 0.70 = 21pt gap), Low Adherence (ABC < 80%), High Abandonment (ABC 28%), Slow Fill (ABC 7–10 days), Copay Dropped (ABC)
- **Demo story:** Sullivan's ABC Pharmacy channel is the worst in his panel and getting worse — fill times up to 10 days, abandonment at 28%, copay dropped. Accredo and AllianceRx patients are doing fine. The rep should escalate ABC Pharmacy and redirect Anthem patients to a better channel.

### Dr. Nina Chandra — VA Primary + Medi-Cal Secondary

- **Channels:** VA CMOP, Accredo Specialty (2 SPs)
- **VA CMOP:** PDC 0.95 → 0.98, abandonment 2% → 1%, no copay needed (340B). Gold standard.
- **Accredo (Medi-Cal):** PDC 0.91 → 0.93 → 0.94, abandonment 5% → 3%. Strong secondary channel.
- **Expected signals:** Top Channel (VA CMOP — PDC 0.98, abandonment 1%)
- **Demo story:** Both channels performing well. VA CMOP is the benchmark for the territory. Medi-Cal patients through Accredo also show strong adherence. This is what frictionless access looks like.

## Placement

Add to Account record page (Person Account / HCP). Targets: `lightning__RecordPage`, `lightning__Tab`, `lightning__RecordAction`.

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `mobileHeight` | Integer | 550 | Height in pixels for mobile display |
