# Scenario: Prescription — Cardiology Northeast

**Static Resource:** `demo_prescription_cardiology_northeast`
**Type:** prescription
**Therapeutic Area:** Cardiology
**Records:** 75
**Period:** January – June 2025

## HCP Panel (5 Prescribers)

| HCP | Specialty | Key Pattern |
|---|---|---|
| Dr. Sarah Chen | Cardiology | Highest volume prescriber, strong across all product categories |
| Dr. Michael Torres | Cardiology | Steady prescriber with Medicare Part D focus |
| Dr. Priya Patel | Internal Medicine | Lower volume, growing SGLT2 inhibitor adoption |
| Dr. James Liu | Cardiology | PCSK9 inhibitor specialist, Velostra champion |
| Dr. Amanda Reeves | Internal Medicine | Broad prescriber with balanced payer mix |

## Products

| Product | Category |
|---|---|
| Corventis | Heart Failure (ARNI) |
| Velostra | PCSK9 Inhibitor |
| Stavorin | Statin (generic) |
| Glucanex | SGLT2 Inhibitor |
| Thrombulex | Anticoagulant |

All product names are fictional.

## Fields

`npi`, `hcp_name`, `specialty`, `product`, `product_category`, `period`, `trx`, `nrx`, `payer_segment` (Commercial, Medicare Part D)

## How to Load

```apex
DemoDataLoader.loadScenario('demo_prescription_cardiology_northeast');
```
