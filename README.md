# Demo Framework — Generic Data Loader

Load any type of demo data (Rx, specialty pharmacy, claims, formulary, etc.) into your AFLS org on demand. One generic object, JSON payloads, scenario-swappable, Data Cloud-ready.

## Architecture

```
Static Resource (JSON)  →  Apex Loader  →  Demo_Data__c  →  LWCs / Agentforce / Data Cloud
```

1. **Static Resources** hold scenario-specific JSON arrays (named `demo_<type>_<ta>_<territory>.json`)
2. **DemoDataLoader** (Apex) parses JSON, creates one `Demo_Data__c` record per row with the JSON in `Payload__c`
3. **Demo Data Launcher** (LWC) — admin tool to load/swap scenarios
4. **Demo Data Viewer** (LWC) — account-level view, cacheable for offline, placed on Account record pages

## Schema: Demo_Data__c

One generic object holds all data types. The payload is JSON — the LWC decompresses client-side.

| Field | Type | Purpose |
|---|---|---|
| Type__c | Picklist | `prescription`, `specialty_pharmacy`, `claims`, `antibiogram`, `medical_event`, `patient_journey`, `formulary` |
| Account__c | Lookup(Account) | Ties data to HCP/HCO. Auto-resolved from NPI during load. |
| Scenario__c | Text(100) | Which scenario loaded this row |
| Period__c | Date | Time-series filtering (month/date) |
| Payload__c | Long Text Area (131K) | JSON object with type-specific data |
| External_Key__c | Text(255) | Composite upsert key (type-aware) |
| Subtype__c | Text(100) | Optional secondary classifier |

## Fictitious Product Portfolio

All drug names are fictional. No real brand names.

| TA | Product | Category | 
|---|---|---|
| Cardiology | **Corventis** | Heart Failure (ARNI) |
| Cardiology | **Velostra** | PCSK9 Inhibitor |
| Cardiology | **Stavorin** | Statin (generic) |
| Cardiology | **Glucanex** | SGLT2 Inhibitor |
| Cardiology | **Thrombulex** | Anticoagulant |
| Oncology | **Onclaris** | PD-1 Inhibitor |
| Oncology | **Nivolara** | PD-1 Inhibitor |
| Oncology | **Zelimumab** | Anti-PD-L1/TGF-B (our product) |
| Oncology | **Tecriva** | PD-L1 Inhibitor |
| Oncology | **Osivant** | TKI |

## Included Scenarios

| Static Resource | Type | TA | HCPs | Products | Rows |
|---|---|---|---|---|---|
| `demo_prescription_cardiology_northeast` | prescription | Cardiology | 5 | Corventis, Velostra, Stavorin, Glucanex, Thrombulex | ~75 |
| `demo_prescription_oncology_metro` | prescription | Oncology | 4 | Onclaris, Nivolara, Zelimumab, Tecriva, Osivant | ~48 |

## Adding a New Scenario

1. Create a JSON file — array of objects matching your data type's schema:
   ```json
   [
     {"npi":"1100000001","hcp_name":"Dr. Chen","product":"Corventis","period":"2025-01-01","trx":42,"nrx":8,"payer_segment":"Commercial"},
     ...
   ]
   ```
2. Name it `demo_<type>_<ta>_<territory>.json`
3. Add the `.resource-meta.xml` with `contentType: application/json`
4. The Launcher LWC auto-discovers any static resource matching `demo_%`

### Adding a New Data Type

1. Add the type value to the `Type__c` picklist on `Demo_Data__c`
2. Add a column mapping in the LWC `COLUMN_MAP` constant
3. Add external key logic in `DemoDataLoader.buildExternalKey()`
4. Create your JSON static resource

## Data Cloud Path

When ready for full-scale data:

```
Demo_Data__c  →  Data Cloud Connector  →  DMO (flatten Payload__c via recipe)
```

The one-record-per-row design maps directly to Data Cloud ingestion. Each `Payload__c` JSON object becomes one DMO row. The `Type__c` field maps to different DMOs.

For production: replace static resources with Data Cloud ingestion API, skip `Demo_Data__c` entirely, and stream JSON payloads directly into Data Cloud DMOs.

## Deploy

```bash
sf project deploy start --source-dir demo-framework/force-app --target-org <alias>
```

## Usage

### Via LWC (recommended)
- **Demo Data Launcher** → App Page, Home Page, or Utility Bar. Pick scenario → Load.
- **Demo Data Viewer** → Account record page. Shows Rx/SP/claims data for that HCP.

### Via Anonymous Apex
```apex
DemoDataLoader.ScenarioResult result = DemoDataLoader.loadScenario('demo_prescription_cardiology_northeast');
System.debug('Loaded: ' + result.recordsLoaded);
```

### Query data (cacheable, offline-ready)
```apex
List<Demo_Data__c> rxData = DemoDataLoader.getDataByType('prescription', 'demo_prescription_cardiology_northeast');
List<Demo_Data__c> hcpData = DemoDataLoader.getDataForAccount(accountId, 'prescription');
```

## Design Decisions

- **One generic object**: `Demo_Data__c` holds all data types. No per-type custom objects.
- **JSON payload**: Schema-flexible. Add new data types without new fields. LWC parses client-side.
- **One record per row**: Maps cleanly to Data Cloud DMOs. SOQL-filterable by Type/Period/Scenario.
- **Account lookup with NPI resolution**: Loader queries `Account.NPI_Number__c` to auto-link records.
- **Cacheable Apex**: `getDataByType` and `getDataForAccount` are `@AuraEnabled(cacheable=true)` for offline.
- **Fictitious drugs only**: All product names are fictional to avoid compliance issues in demos.
- **Static Resources as scenario packs**: Deploy with project, version-controlled, storage-free until loaded.
