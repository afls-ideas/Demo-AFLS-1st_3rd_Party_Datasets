# Medical Events and Safety Data — SP-ONC-USW-SF-001

**Static Resource:** `demo_medical_event_oncology_usw_sf`
**Type:** `medical_event`
**Records:** 14 (13 adverse events + 1 territory safety signal)
**Period:** Nov 2025 – Mar 2026
**LWC:** `lscMobileInline_safetyAlerts` (Demo AFLS Safety and Medical Events)

---

## What This Dataset Represents

Adverse event (AE) reports and pharmacovigilance safety signals — the kind of data from post-marketing surveillance, REMS programs, or manufacturer safety databases. Each record is one AE reported for one patient, graded by CTCAE severity (1–5), with organ system classification, treatment cycle, outcome, and management details.

This is first-party data from the manufacturer's safety monitoring system. It answers: **"What adverse events are this HCP's patients experiencing, how serious are they, and is there a pattern we need to act on?"**

The dataset also includes a territory-wide **auto-detected safety signal** — a pharmacovigilance alert triggered when a cluster of serious events exceeds the expected rate.

---

## Schema

| Field | Type | Description |
|---|---|---|
| `scenario_id` | String | `SP-ONC-USW-SF-001` |
| `subtype` | String | `adverse_event` or `safety_signal` |
| `hcp_name` | String | Reporting HCP (null for territory-wide signals) |
| `product` | String | `Immunonco (US)` |
| `period` | Date | Event date |
| `event` | String | AE name (e.g., Colitis, Diarrhea, Hypothyroidism) |
| `grade` | Integer | CTCAE grade: 1 (mild) – 5 (death). Null for signals. |
| `organ_system` | String | GI, Endocrine, Dermatologic, Constitutional, Hepatic, Pulmonary |
| `cycle` | Integer | Treatment cycle when AE occurred |
| `outcome` | String | Resolved, Ongoing - managed, Resolved with intervention, Permanent discontinuation |
| `management` | String | Treatment/intervention details |
| `days_to_resolution` | Integer | Days from onset to resolution (null if ongoing) |
| `reporter` | String | HCP name or "Pharmacovigilance - Auto-Detection" |
| `serious` | Boolean | Grade 3+ or requires hospitalization/discontinuation |

---

## CTCAE Grading Reference

| Grade | Severity | LWC Badge Color | Definition |
|---|---|---|---|
| 1 | Mild | Green | Asymptomatic or mild symptoms; no intervention needed |
| 2 | Moderate | Orange | Moderate; minimal or local intervention indicated |
| 3 | Severe | Red | Severe; hospitalization or IV intervention indicated |
| 4 | Life-threatening | Dark Red | Life-threatening; urgent intervention indicated |
| 5 | Death | Dark Red | Death related to AE |

---

## Territory Safety Signal

**Event:** Grade 3+ Colitis Signal
**Detected:** Feb 15, 2026
**Reporter:** Pharmacovigilance — Auto-Detection
**Status:** Signal under investigation

Three Grade 3+ colitis cases in this territory exceeded the expected background rate:
1. **Dr. Matthew Wong** — Jan 2026, Grade 3 colitis (Cycle 6), resolved with intervention
2. **Dr. Matthew Wong** — Feb 2026, Grade 3 colitis (Cycle 8), **permanent discontinuation**
3. **Dr. Nina Chandra** — Mar 2026, Grade 3 colitis (Cycle 7), resolved with intervention

The safety signal appears on **every HCP's view** as a territory-level banner. The LWC includes compliance-aware guidance: reps should **not proactively discuss** the safety signal unless the HCP raises the topic first.

**Field action:** Safety team notified; field alert distributed to territory reps.

---

## HCP Stories

### Dr. Lisa Thornton — Manageable Safety Profile

4 AEs across 4 organ systems, all Grade 1–2. The expected tolerability profile for an IO agent.

| Date | Event | Grade | Organ System | Cycle | Outcome | Management | Days |
|---|---|---|---|---|---|---|---|
| Nov 15, 2025 | Diarrhea | 1 | GI | 2 | Resolved | Loperamide | 5 |
| Dec 20, 2025 | Hypothyroidism | 2 | Endocrine | 4 | Ongoing — managed | Levothyroxine replacement | — |
| Jan 10, 2026 | Rash (maculopapular) | 1 | Dermatologic | 5 | Resolved | Topical corticosteroid | 10 |
| Feb 15, 2026 | Fatigue | 2 | Constitutional | 7 | Ongoing — managed | Dose modification, supportive care | — |

**Serious events:** 0
**Organ system chips:** GI (1), Endocrine (1), Dermatologic (1), Constitutional (1) — all single occurrences

**Story:** Textbook IO tolerability. Four different organ systems involved but all manageable — the Grade 1 events (diarrhea, rash) resolved quickly, while the Grade 2 events (hypothyroidism, fatigue) are ongoing but managed with standard interventions. No dose-limiting toxicity. Her prescribing confidence isn't affected — Immunonco TRx continued climbing through all AE events. This is the baseline to show: "AEs happen, they're manageable, patients stay on therapy."

**LWC signals:** Manageable Safety Profile + territory colitis signal banner

---

### Dr. Matthew Wong — Safety Crisis / Pharmacovigilance Trigger

3 AEs with escalating severity. The primary trigger for the territory-wide colitis safety signal.

| Date | Event | Grade | Organ System | Cycle | Outcome | Management | Days |
|---|---|---|---|---|---|---|---|
| Nov 20, 2025 | ALT elevation | 2 | Hepatic | 3 | Resolved with intervention | Treatment hold, prednisone taper | 21 |
| Jan 5, 2026 | **Colitis** | **3** | GI | 6 | Resolved with intervention | IV methylprednisolone, treatment hold, infliximab | 28 |
| Feb 10, 2026 | **Colitis** | **3** | GI | 8 | **Permanent discontinuation** | IV methylprednisolone, infliximab, permanent discontinuation | 35 |

**Serious events:** 2 (both Grade 3 colitis)
**Organ system chips:** Hepatic (1), GI (2) — **GI highlighted red (2+ events)**

**Story:** This HCP is the epicenter of the safety narrative. The ALT elevation in Nov was a warning sign — hepatic irAEs can presage GI toxicity. The first colitis event in Jan required IV steroids + infliximab (steroid-refractory) and took 28 days to resolve. Despite resolution, the second colitis in Feb was worse — 35 days, requiring permanent Immunonco discontinuation. This directly drives his prescribing pullback (10 → 4 TRx), hub collapse (persistency 0.92 → 0.50), and claims denial (PA lapsed).

Every signal type fires for this HCP:
- Grade 3+ Event (x2)
- Recurrent AE Pattern (2 GI events)
- Treatment Discontinued (permanent)
- Territory Safety Signal

**This is the primary demo trigger for the Pharmacovigilance agent workflow.**

**LWC signals:** Grade 3+ Event, Recurrent AE Pattern, Treatment Discontinued, territory colitis signal

---

### Dr. Kevin Patel — Mild Mixed AEs

2 AEs, both manageable. Low event count reflects his low Immunonco volume.

| Date | Event | Grade | Organ System | Cycle | Outcome | Management | Days |
|---|---|---|---|---|---|---|---|
| Jan 20, 2026 | Pneumonitis | 2 | Pulmonary | 3 | Resolved with intervention | Treatment hold, oral prednisone 1mg/kg taper × 6 weeks | 42 |
| Mar 1, 2026 | Hypothyroidism | 1 | Endocrine | 5 | Ongoing — managed | Levothyroxine replacement | — |

**Serious events:** 0
**Organ system chips:** Pulmonary (1), Endocrine (1)

**Story:** The Grade 2 pneumonitis is clinically significant — it required a 6-week steroid taper and 42 days to resolve. Pneumonitis is one of the more concerning IO irAEs because it can escalate. However, it resolved and the patient resumed therapy. Hypothyroidism is a common IO class effect, easily managed with levothyroxine. No safety red flags from his limited prescribing, but the pneumonitis warrants monitoring.

**LWC signals:** Manageable Safety Profile + territory colitis signal banner

---

### Dr. Brian Sullivan — Minimal Exposure

1 AE total — the cleanest safety profile in the territory.

| Date | Event | Grade | Organ System | Cycle | Outcome | Management | Days |
|---|---|---|---|---|---|---|---|
| Feb 1, 2026 | Rash (maculopapular) | 1 | Dermatologic | 2 | Resolved | Topical corticosteroid, antihistamine | 7 |

**Serious events:** 0
**Organ system chips:** Dermatologic (1)

**Story:** A single Grade 1 rash that resolved in 7 days with OTC treatment. Consistent with his minimal Immunonco patient count (1-2 TRx/month). The territory colitis signal still appears as a banner — this gives him visibility into safety trends across the broader territory even without personal exposure. The low AE count is reassuring but not conclusive given the small sample.

**LWC signals:** Manageable Safety Profile + territory colitis signal banner

---

### Dr. Nina Chandra — GI Escalation Pattern

3 AEs showing a progression from low-grade GI symptoms to Grade 3 colitis. The third contributor to the territory safety signal.

| Date | Event | Grade | Organ System | Cycle | Outcome | Management | Days |
|---|---|---|---|---|---|---|---|
| Dec 15, 2025 | Fatigue | 1 | Constitutional | 2 | Resolved | Supportive care, activity modification | 14 |
| Jan 25, 2026 | Diarrhea | 2 | GI | 4 | Resolved | Loperamide, hydration | 8 |
| Mar 1, 2026 | **Colitis** | **3** | GI | 7 | Resolved with intervention | IV methylprednisolone, treatment hold | 18 |

**Serious events:** 1 (Grade 3 colitis)
**Organ system chips:** Constitutional (1), GI (2) — **GI highlighted red (2+ events)**

**Story:** A clinically important escalation pattern: diarrhea (Grade 2, Cycle 4) → colitis (Grade 3, Cycle 7). The GI recurrence signal is a key insight — low-grade diarrhea can be a precursor to serious colitis. Unlike Dr. Wong, the colitis resolved (18 days vs 35 days) and the patient continued therapy. This is the third Grade 3+ colitis case contributing to the territory safety signal. Despite the event, her prescribing continued to ramp — she managed through it, unlike Dr. Wong who pulled back entirely.

**LWC signals:** Grade 3+ Event, Recurrent AE Pattern (diarrhea → colitis), territory colitis signal

---

## Territory Safety Summary

| HCP | Total AEs | Serious (Gr 3+) | Organ Systems | Discontinuations | Profile |
|---|---|---|---|---|---|
| Lisa Thornton | 4 | 0 | 4 (GI, Endo, Derm, Const) | 0 | Manageable |
| Matthew Wong | 3 | **2** | 2 (Hepatic, GI) | **1** | **Crisis** |
| Kevin Patel | 2 | 0 | 2 (Pulmonary, Endo) | 0 | Manageable |
| Brian Sullivan | 1 | 0 | 1 (Dermatologic) | 0 | Minimal |
| Nina Chandra | 3 | **1** | 2 (Constitutional, GI) | 0 | Escalation |

**Territory totals:** 13 AEs, 3 serious (Grade 3+), 1 permanent discontinuation, 1 active safety signal

### Organ System Distribution

| Organ System | Events | Grade Range | HCPs Affected |
|---|---|---|---|
| GI | 5 | 1–3 | Thornton, Wong (x2), Chandra (x2) |
| Endocrine | 3 | 1–2 | Thornton, Patel, Chandra (fatigue) |
| Dermatologic | 2 | 1 | Thornton, Sullivan |
| Constitutional | 2 | 1–2 | Thornton, Chandra |
| Hepatic | 1 | 2 | Wong |
| Pulmonary | 1 | 2 | Patel |

**GI is the dominant safety concern** — 5 events across 3 HCPs, including all 3 Grade 3+ events. The colitis signal is specifically about the Grade 3+ GI cluster.

---

## How to Load

```apex
DemoDataLoader.loadScenario('demo_medical_event_oncology_usw_sf');
```

The safety signal record (subtype = `safety_signal`) is loaded via the global `getDataByType` wire, not the account-specific `getDataForAccount` wire. This ensures every HCP's view shows the territory-level signal regardless of their own AE history.
