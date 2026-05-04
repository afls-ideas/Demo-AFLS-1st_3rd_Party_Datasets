# Demo AFLS Safety and Medical Events

LWC component that displays adverse events reported for an HCP's patients and territory-wide safety signals.

## Data Sources

- **Wire 1:** `getDataForAccount` with `dataType: 'medical_event'` — account-specific adverse events
- **Wire 2:** `getDataByType` with `dataType: 'medical_event'`, `scenario: 'demo_medical_event_oncology_usw_sf'` — global safety signals (subtype = `safety_signal`)

## What It Shows

- **KPI Cards:** Total AEs, Serious Events (Grade 3+), Organ Systems affected, Active Signals count
- **Organ System Chips:** Each affected organ system with event count, highlighted red if 2+ events
- **Signal Banners:** Alerts for serious events, recurrent patterns, treatment discontinuation, and territory-wide signals. Includes compliance-aware guidance (e.g., "do NOT proactively discuss" for safety signals unless HCP raises the topic)
- **AE History Cards:** Each event displayed with name, organ system, period, cycle, outcome, management notes, and grade badge (1-2 green/orange, 3 red, 4-5 dark red)

## Signals Detected

| Signal | Condition | Level |
|---|---|---|
| Grade 3+ Event | Any event with grade >= 3 | error |
| Territory Safety Signal | From global signal dataset (subtype = safety_signal) | error |
| Recurrent AE Pattern | 2+ events in same organ system | warning |
| Treatment Discontinued | Outcome includes discontinuation | error |
| Manageable Safety Profile | All Grade 1-2, no serious events | success |

## Territory-Wide Safety Signal

A Grade 3+ Colitis signal was auto-detected in Feb 2026 by Pharmacovigilance. Three Grade 3+ colitis cases across Dr. Wong (2 events) and Dr. Chandra (1 event) triggered the alert. This signal appears on every HCP's view as a territory-level banner. Field alert distributed to all territory reps.

## HCP Scenarios (SP-ONC-USW-SF-001)

### Dr. Lisa Thornton — Manageable Safety Profile

- **Total AEs:** 4
- **Events:**
  - Nov 2025: Diarrhea, Grade 1, GI — Resolved
  - Dec 2025: Hypothyroidism, Grade 2, Endocrine — Ongoing, managed
  - Jan 2026: Rash (maculopapular), Grade 1, Dermatologic — Resolved
  - Feb 2026: Fatigue, Grade 2, Constitutional — Ongoing, managed
- **Organ systems:** GI, Endocrine, Dermatologic, Constitutional (4 systems, all low-grade)
- **Serious events:** 0
- **Expected signals:** Manageable Safety Profile (all Grade 1-2), plus territory colitis signal banner
- **Demo story:** Textbook manageable AE profile for an IO agent. Four different organ systems affected but all Grade 1-2, no dose modifications needed. The hypothyroidism and fatigue are ongoing but managed with supportive care. This is the "expected tolerability" baseline — shows that Immunonco AEs are real but controllable when patients are well-monitored.

### Dr. Matthew Wong — Safety Crisis

- **Total AEs:** 3
- **Events:**
  - Nov 2025: ALT elevation, Grade 2, Hepatic — Resolved with intervention
  - Jan 2026: Colitis, Grade 3, GI — Resolved with intervention (serious)
  - Feb 2026: Colitis, Grade 3, GI — Resulted in permanent discontinuation (serious)
- **Organ systems:** Hepatic, GI (2 systems, GI recurrent)
- **Serious events:** 2 (both Grade 3 colitis)
- **Expected signals:** Grade 3+ Event (x2), Recurrent AE Pattern (2 GI events), Treatment Discontinued, territory colitis signal
- **Demo story:** The most alarming safety profile in the territory. The first colitis event in Jan was managed, but the second in Feb led to permanent Immunonco discontinuation. This is the trigger case for the territory-wide colitis safety signal. Every signal type fires for this HCP — Grade 3+, recurrence, discontinuation, and territory signal. This is the primary Pharmacovigilance agent demo trigger.

### Dr. Kevin Patel — Mild, Mixed AEs

- **Total AEs:** 2
- **Events:**
  - Jan 2026: Pneumonitis, Grade 2, Pulmonary — Resolved with intervention
  - Mar 2026: Hypothyroidism, Grade 1, Endocrine — Ongoing, managed
- **Organ systems:** Pulmonary, Endocrine (2 systems, no recurrence)
- **Serious events:** 0
- **Expected signals:** Manageable Safety Profile, plus territory colitis signal banner
- **Demo story:** Low event count reflecting his low Immunonco volume. The Grade 2 pneumonitis required intervention but resolved — important to monitor since pneumonitis can escalate. Hypothyroidism is a common IO class effect, easily managed. No safety red flags from his limited prescribing.

### Dr. Brian Sullivan — Minimal Exposure

- **Total AEs:** 1
- **Events:**
  - Feb 2026: Rash (maculopapular), Grade 1, Dermatologic — Resolved
- **Organ systems:** Dermatologic (1 system)
- **Serious events:** 0
- **Expected signals:** Manageable Safety Profile, plus territory colitis signal banner
- **Demo story:** Only one AE in the entire observation period — consistent with his minimal Immunonco patient count. A single Grade 1 rash that resolved without intervention. The cleanest safety profile in the territory, though the small sample size means it's not conclusive. The territory colitis signal still appears as a banner, giving him visibility into the broader safety landscape even without personal exposure.

### Dr. Nina Chandra — Late Escalation

- **Total AEs:** 3
- **Events:**
  - Dec 2025: Fatigue, Grade 1, Constitutional — Resolved
  - Jan 2026: Diarrhea, Grade 2, GI — Resolved
  - Mar 2026: Colitis, Grade 3, GI — Resolved with intervention (serious)
- **Organ systems:** Constitutional, GI (GI recurrent — diarrhea then colitis)
- **Serious events:** 1 (Grade 3 colitis)
- **Expected signals:** Grade 3+ Event, Recurrent AE Pattern (2 GI events — diarrhea escalated to colitis), territory colitis signal
- **Demo story:** A progression pattern — low-grade GI symptoms (diarrhea) escalated to Grade 3 colitis. This is the third colitis case that contributed to the territory-wide safety signal. Unlike Dr. Wong, the event resolved and the patient continued therapy. Demonstrates the importance of monitoring GI symptoms early. The GI recurrence signal (diarrhea → colitis) is a key clinical insight for the rep.

## Placement

Add to Account record page (Person Account / HCP). Targets: `lightning__RecordPage`, `lightning__Tab`.
