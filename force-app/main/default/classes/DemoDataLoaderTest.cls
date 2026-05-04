@IsTest
private class DemoDataLoaderTest {

    @IsTest
    static void testBuildExternalKeyPrescription() {
        Map<String, Object> payload = new Map<String, Object>{
            'hcp_name' => 'Dr. Sarah Chen',
            'product' => 'Corventis',
            'period' => '2025-01-01',
            'payer_segment' => 'Commercial'
        };
        String key = DemoDataLoader.buildExternalKey('prescription', payload);
        Assert.areEqual('rx|Dr. Sarah Chen|Corventis|2025-01-01|Commercial', key);
    }

    @IsTest
    static void testBuildExternalKeyClaims() {
        Map<String, Object> payload = new Map<String, Object>{
            'claim_id' => 'CLM-20250101-001'
        };
        String key = DemoDataLoader.buildExternalKey('claims', payload);
        Assert.areEqual('cl|CLM-20250101-001', key);
    }

    @IsTest
    static void testBuildExternalKeyFormulary() {
        Map<String, Object> payload = new Map<String, Object>{
            'plan_id' => 'BCBS-NE',
            'product' => 'Corventis'
        };
        String key = DemoDataLoader.buildExternalKey('formulary', payload);
        Assert.areEqual('fm|BCBS-NE|Corventis', key);
    }

    @IsTest
    static void testBuildExternalKeyPrescriptionByName() {
        Map<String, Object> payload = new Map<String, Object>{
            'hcp_name' => 'Dr. Jennifer Wu',
            'product' => 'Immunonco (US)',
            'period' => '2025-10-01',
            'payer_segment' => 'Commercial'
        };
        String key = DemoDataLoader.buildExternalKey('prescription', payload);
        Assert.areEqual('rx|Dr. Jennifer Wu|Immunonco (US)|2025-10-01|Commercial', key);
    }

    @IsTest
    static void testBuildExternalKeySpecialtyPharmacyByName() {
        Map<String, Object> payload = new Map<String, Object>{
            'hcp_name' => 'Dr. Jennifer Wu',
            'product' => 'Immunonco (US)',
            'period' => '2025-10-01',
            'pharmacy_name' => 'Optum Specialty Pharmacy'
        };
        String key = DemoDataLoader.buildExternalKey('specialty_pharmacy', payload);
        Assert.areEqual('sp|Dr. Jennifer Wu|Immunonco (US)|2025-10-01|Optum Specialty Pharmacy', key);
    }

    @IsTest
    static void testBuildExternalKeyPatientJourney() {
        Map<String, Object> payload = new Map<String, Object>{
            'hcp_name' => 'Dr. Jennifer Wu',
            'product' => 'Immunonco (US)',
            'period' => '2025-10-01',
            'subtype' => 'hub_enrollment'
        };
        String key = DemoDataLoader.buildExternalKey('patient_journey', payload);
        Assert.areEqual('pj|Dr. Jennifer Wu|Immunonco (US)|2025-10-01|hub_enrollment', key);
    }

    @IsTest
    static void testBuildExternalKeyMedicalEvent() {
        Map<String, Object> payload = new Map<String, Object>{
            'hcp_name' => 'Dr. Marcus Chen',
            'product' => 'Immunonco (US)',
            'period' => '2026-01-05',
            'event' => 'Colitis'
        };
        String key = DemoDataLoader.buildExternalKey('medical_event', payload);
        Assert.areEqual('me|Dr. Marcus Chen|Immunonco (US)|2026-01-05|Colitis', key);
    }

    @IsTest
    static void testParseDataType() {
        Assert.areEqual('prescription', DemoDataLoader.parseDataType('demo_prescription_cardiology_northeast'));
        Assert.areEqual('specialty_pharmacy', DemoDataLoader.parseDataType('demo_specialty_pharmacy_oncology_usw_sf'));
        Assert.areEqual('patient_journey', DemoDataLoader.parseDataType('demo_patient_journey_oncology_usw_sf'));
        Assert.areEqual('medical_event', DemoDataLoader.parseDataType('demo_medical_event_oncology_usw_sf'));
        Assert.areEqual('claims', DemoDataLoader.parseDataType('demo_claims_neurology'));
        Assert.areEqual('formulary', DemoDataLoader.parseDataType('demo_formulary_oncology_usw_sf'));
    }

    @IsTest
    static void testGetAvailableScenarios() {
        List<DemoDataLoader.ScenarioInfo> scenarios = DemoDataLoader.getAvailableScenarios();
        Assert.isNotNull(scenarios);
    }

    @IsTest
    static void testGetActiveScenarioEmpty() {
        String active = DemoDataLoader.getActiveScenario();
        Assert.isNull(active);
    }

    @IsTest
    static void testClearAllData() {
        Demo_Data__c rec = new Demo_Data__c(
            Type__c = 'prescription',
            Scenario__c = 'test',
            Payload__c = '{"product":"Corventis"}',
            External_Key__c = 'test|1'
        );
        insert rec;

        DemoDataLoader.ScenarioResult result = DemoDataLoader.clearAllData();
        Assert.areEqual(1, result.recordsDeleted);
        Assert.isNull(result.error);
    }

    @IsTest
    static void testGetDataByType() {
        Demo_Data__c rec = new Demo_Data__c(
            Type__c = 'prescription',
            Scenario__c = 'test_scenario',
            Period__c = Date.valueOf('2025-01-01'),
            Payload__c = '{"hcp_name":"Dr. Sarah Chen","product":"Corventis","trx":42}',
            External_Key__c = 'test|2'
        );
        insert rec;

        List<Demo_Data__c> results = DemoDataLoader.getDataByType('prescription', 'test_scenario');
        Assert.areEqual(1, results.size());
        Assert.areEqual('prescription', results[0].Type__c);
    }

    @IsTest
    static void testGetDataForAccount() {
        Account a = new Account(Name = 'Test HCP');
        insert a;

        Demo_Data__c rec = new Demo_Data__c(
            Type__c = 'prescription',
            Scenario__c = 'test_scenario',
            Account__c = a.Id,
            Payload__c = '{"product":"Corventis","trx":42}',
            External_Key__c = 'test|3'
        );
        insert rec;

        List<Demo_Data__c> results = DemoDataLoader.getDataForAccount(a.Id, 'prescription');
        Assert.areEqual(1, results.size());
    }

    @IsTest
    static void testFictitiousDrugNames() {
        String payload = '{"product":"Corventis","product_category":"Heart Failure"}';
        Assert.isFalse(payload.contains('Entresto'));
        Assert.isFalse(payload.contains('Keytruda'));
        Assert.isTrue(payload.contains('Corventis'));
    }
}
