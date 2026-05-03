public with sharing class DemoDataLoader {

    public class ScenarioResult {
        @AuraEnabled public Integer recordsLoaded;
        @AuraEnabled public Integer recordsDeleted;
        @AuraEnabled public String scenarioName;
        @AuraEnabled public String error;
    }

    public class ScenarioInfo {
        @AuraEnabled public String name;
        @AuraEnabled public String dataType;
        @AuraEnabled public String label;
    }

    @AuraEnabled
    public static List<ScenarioInfo> getAvailableScenarios() {
        List<ScenarioInfo> scenarios = new List<ScenarioInfo>();
        for (StaticResource sr : [
            SELECT Name FROM StaticResource
            WHERE Name LIKE 'demo_%'
            ORDER BY Name
        ]) {
            ScenarioInfo info = new ScenarioInfo();
            info.name = sr.Name;
            info.dataType = parseDataType(sr.Name);
            info.label = formatLabel(sr.Name);
            scenarios.add(info);
        }
        return scenarios;
    }

    @AuraEnabled
    public static String getActiveScenario() {
        List<AggregateResult> results = [
            SELECT Scenario__c, COUNT(Id) cnt
            FROM Demo_Data__c
            GROUP BY Scenario__c
            ORDER BY COUNT(Id) DESC
            LIMIT 1
        ];
        if (results.isEmpty()) {
            return null;
        }
        return (String) results[0].get('Scenario__c');
    }

    @AuraEnabled
    public static ScenarioResult loadScenario(String scenarioName) {
        ScenarioResult result = new ScenarioResult();
        result.scenarioName = scenarioName;

        try {
            String dataType = parseDataType(scenarioName);
            Integer deleted = clearByScenario(scenarioName);
            result.recordsDeleted = deleted;

            StaticResource sr = [
                SELECT Body FROM StaticResource
                WHERE Name = :scenarioName
                LIMIT 1
            ];

            String jsonBody = sr.Body.toString();
            List<Object> rawRecords = (List<Object>) JSON.deserializeUntyped(jsonBody);

            Map<String, Id> accountMap = resolveAccounts(rawRecords);

            List<Demo_Data__c> records = new List<Demo_Data__c>();
            for (Object rawRecord : rawRecords) {
                Map<String, Object> payload = (Map<String, Object>) rawRecord;
                Demo_Data__c rec = new Demo_Data__c();
                rec.Type__c = dataType;
                rec.Scenario__c = scenarioName;
                rec.Payload__c = JSON.serialize(payload);
                rec.External_Key__c = buildExternalKey(dataType, payload);
                rec.Subtype__c = payload.containsKey('subtype')
                    ? String.valueOf(payload.get('subtype')) : null;

                String periodStr = payload.containsKey('period')
                    ? String.valueOf(payload.get('period')) : null;
                if (String.isNotBlank(periodStr)) {
                    rec.Period__c = Date.valueOf(periodStr);
                }

                String npi = payload.containsKey('npi')
                    ? String.valueOf(payload.get('npi')) : null;
                if (npi != null && accountMap.containsKey(npi)) {
                    rec.Account__c = accountMap.get(npi);
                }

                records.add(rec);
            }

            if (!records.isEmpty()) {
                upsert records External_Key__c;
            }
            result.recordsLoaded = records.size();
        } catch (Exception e) {
            result.error = e.getMessage();
        }
        return result;
    }

    @AuraEnabled
    public static ScenarioResult clearAllData() {
        ScenarioResult result = new ScenarioResult();
        try {
            List<Demo_Data__c> existing = [SELECT Id FROM Demo_Data__c LIMIT 10000];
            result.recordsDeleted = existing.size();
            if (!existing.isEmpty()) {
                delete existing;
            }
            result.recordsLoaded = 0;
        } catch (Exception e) {
            result.error = e.getMessage();
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<Demo_Data__c> getDataByType(String dataType, String scenario) {
        return [
            SELECT Id, Type__c, Scenario__c, Period__c, Payload__c,
                   Subtype__c, Account__c, Account__r.Name, External_Key__c
            FROM Demo_Data__c
            WHERE Type__c = :dataType
            AND Scenario__c = :scenario
            ORDER BY Period__c ASC
            LIMIT 2000
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Demo_Data__c> getDataForAccount(Id accountId, String dataType) {
        return [
            SELECT Id, Type__c, Scenario__c, Period__c, Payload__c,
                   Subtype__c, External_Key__c
            FROM Demo_Data__c
            WHERE Account__c = :accountId
            AND Type__c = :dataType
            ORDER BY Period__c ASC
            LIMIT 500
        ];
    }

    private static Integer clearByScenario(String scenarioName) {
        List<Demo_Data__c> existing = [
            SELECT Id FROM Demo_Data__c
            WHERE Scenario__c = :scenarioName
            LIMIT 10000
        ];
        Integer count = existing.size();
        if (!existing.isEmpty()) {
            delete existing;
        }
        return count;
    }

    private static Map<String, Id> resolveAccounts(List<Object> rawRecords) {
        Set<String> npis = new Set<String>();
        for (Object rawRecord : rawRecords) {
            Map<String, Object> payload = (Map<String, Object>) rawRecord;
            if (payload.containsKey('npi')) {
                npis.add(String.valueOf(payload.get('npi')));
            }
        }

        Map<String, Id> accountMap = new Map<String, Id>();
        if (!npis.isEmpty()) {
            for (Account a : [
                SELECT Id, NPI_Number__c FROM Account
                WHERE NPI_Number__c IN :npis
            ]) {
                accountMap.put(a.NPI_Number__c, a.Id);
            }
        }
        return accountMap;
    }

    @TestVisible
    private static String buildExternalKey(String dataType, Map<String, Object> payload) {
        if (dataType == 'prescription') {
            return 'rx|' + payload.get('npi') + '|' + payload.get('product')
                + '|' + payload.get('period') + '|' + payload.get('payer_segment');
        } else if (dataType == 'specialty_pharmacy') {
            return 'sp|' + payload.get('npi') + '|' + payload.get('product')
                + '|' + payload.get('period') + '|' + payload.get('pharmacy_id');
        } else if (dataType == 'claims') {
            return 'cl|' + payload.get('claim_id');
        } else if (dataType == 'formulary') {
            return 'fm|' + payload.get('plan_id') + '|' + payload.get('product');
        } else {
            return dataType + '|' + String.valueOf(payload).hashCode();
        }
    }

    @TestVisible
    private static String parseDataType(String scenarioName) {
        List<String> parts = scenarioName.replace('demo_', '').split('_');
        return parts.isEmpty() ? 'unknown' : parts[0];
    }

    private static String formatLabel(String scenarioName) {
        return scenarioName
            .replace('demo_', '')
            .replace('_', ' ')
            .capitalize();
    }
}
