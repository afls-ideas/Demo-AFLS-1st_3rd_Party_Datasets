# Scenario: Prescription — Oncology Metro

**Static Resource:** `demo_prescription_oncology_metro`
**Type:** prescription
**Therapeutic Area:** Oncology
**Records:** 48
**Period:** January – June 2025

## HCP Panel (4 Prescribers)

| HCP | Specialty | Key Pattern |
|---|---|---|
| Dr. Robert Kim | Medical Oncology | Onclaris-dominant, slow to adopt new agents |
| Dr. Lisa Huang | Medical Oncology | Balanced prescriber, trialing Zelimumab |
| Dr. David Martinez | Medical Oncology | PD-1 loyalist, high Nivolara usage |
| Dr. Rachel Foster | Medical Oncology | Highest volume, broad portfolio |

## Products

| Product | Category |
|---|---|
| Onclaris | PD-1 Inhibitor (market leader) |
| Nivolara | PD-1 Inhibitor |
| Zelimumab | Anti-PD-L1/TGF-B |
| Tecriva | PD-L1 Inhibitor |
| Osivant | TKI |

All product names are fictional.

## Fields

`npi`, `hcp_name`, `specialty`, `product`, `product_category`, `period`, `trx`, `nrx`, `payer_segment` (Commercial, Medicare Part D)

## How to Load

```apex
DemoDataLoader.loadScenario('demo_prescription_oncology_metro');
```
