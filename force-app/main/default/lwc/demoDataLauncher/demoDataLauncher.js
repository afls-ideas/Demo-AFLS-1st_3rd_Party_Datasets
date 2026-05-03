import { LightningElement, track, wire } from 'lwc';
import getAvailableScenarios from '@salesforce/apex/DemoDataLoader.getAvailableScenarios';
import getActiveScenario from '@salesforce/apex/DemoDataLoader.getActiveScenario';
import loadScenario from '@salesforce/apex/DemoDataLoader.loadScenario';
import clearAllData from '@salesforce/apex/DemoDataLoader.clearAllData';
import getDataByType from '@salesforce/apex/DemoDataLoader.getDataByType';
import { refreshApex } from '@salesforce/apex';

const COLUMN_MAP = {
    prescription: [
        { label: 'HCP', fieldName: 'hcp_name', type: 'text' },
        { label: 'Specialty', fieldName: 'specialty', type: 'text' },
        { label: 'Product', fieldName: 'product', type: 'text' },
        { label: 'Category', fieldName: 'product_category', type: 'text' },
        { label: 'Period', fieldName: 'period', type: 'text' },
        { label: 'TRx', fieldName: 'trx', type: 'number' },
        { label: 'NRx', fieldName: 'nrx', type: 'number' },
        { label: 'Payer', fieldName: 'payer_segment', type: 'text' }
    ],
    specialty_pharmacy: [
        { label: 'HCP', fieldName: 'hcp_name', type: 'text' },
        { label: 'Product', fieldName: 'product', type: 'text' },
        { label: 'Pharmacy', fieldName: 'pharmacy_name', type: 'text' },
        { label: 'Period', fieldName: 'period', type: 'text' },
        { label: 'Fills', fieldName: 'fills', type: 'number' },
        { label: 'Status', fieldName: 'status', type: 'text' }
    ],
    claims: [
        { label: 'Claim ID', fieldName: 'claim_id', type: 'text' },
        { label: 'Diagnosis', fieldName: 'diagnosis', type: 'text' },
        { label: 'Procedure', fieldName: 'procedure', type: 'text' },
        { label: 'Date', fieldName: 'period', type: 'text' },
        { label: 'Amount', fieldName: 'amount', type: 'currency' }
    ]
};

export default class DemoDataLauncher extends LightningElement {
    @track scenarioOptions = [];
    @track selectedScenario = '';
    @track activeScenario = '';
    @track activeDataType = '';
    @track isLoading = false;
    @track loadingMessage = '';
    @track result = null;
    @track tableData = [];
    @track tableColumns = [];

    _wiredDataResult;

    connectedCallback() {
        this.init();
    }

    async init() {
        await this.loadOptions();
        await this.loadActiveScenario();
    }

    async loadOptions() {
        try {
            const scenarios = await getAvailableScenarios();
            this.scenarioOptions = scenarios.map(s => ({
                label: s.label,
                value: s.name
            }));
        } catch (error) {
            this.result = { error: error.body?.message || 'Failed to load scenarios' };
        }
    }

    async loadActiveScenario() {
        try {
            this.activeScenario = await getActiveScenario();
            if (this.activeScenario) {
                this.activeDataType = this.parseType(this.activeScenario);
                await this.refreshTable();
            }
        } catch (error) {
            // No active scenario
        }
    }

    get activeScenarioLabel() {
        if (!this.activeScenario) return '';
        return this.activeScenario
            .replace('demo_', '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    parseType(scenarioName) {
        const parts = scenarioName.replace('demo_', '').split('_');
        return parts[0] || 'unknown';
    }

    handleScenarioChange(event) {
        this.selectedScenario = event.detail.value;
        this.result = null;
    }

    async handleLoad() {
        this.isLoading = true;
        this.loadingMessage = 'Loading scenario data...';
        this.result = null;
        this.tableData = [];

        try {
            const res = await loadScenario({ scenarioName: this.selectedScenario });
            this.result = res;
            if (!res.error) {
                this.activeScenario = this.selectedScenario;
                this.activeDataType = this.parseType(this.selectedScenario);
                await this.refreshTable();
            }
        } catch (error) {
            this.result = { error: error.body?.message || 'Failed to load scenario' };
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    async handleClear() {
        this.isLoading = true;
        this.loadingMessage = 'Clearing all demo data...';
        this.result = null;

        try {
            const res = await clearAllData();
            this.result = res;
            this.activeScenario = '';
            this.activeDataType = '';
            this.tableData = [];
            this.tableColumns = [];
        } catch (error) {
            this.result = { error: error.body?.message || 'Failed to clear data' };
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    async refreshTable() {
        if (!this.activeScenario || !this.activeDataType) return;

        try {
            const records = await getDataByType({
                dataType: this.activeDataType,
                scenario: this.activeScenario
            });
            this.tableColumns = COLUMN_MAP[this.activeDataType] || this.buildDynamicColumns(records);
            this.tableData = records.map((rec, idx) => {
                const parsed = JSON.parse(rec.Payload__c);
                return { ...parsed, id: rec.Id || String(idx) };
            });
        } catch (error) {
            // Table display is best-effort
        }
    }

    buildDynamicColumns(records) {
        if (!records || !records.length) return [];
        const first = JSON.parse(records[0].Payload__c);
        return Object.keys(first).map(key => ({
            label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            fieldName: key,
            type: typeof first[key] === 'number' ? 'number' : 'text'
        }));
    }

    get isLoadDisabled() {
        return !this.selectedScenario || this.isLoading;
    }

    get isClearDisabled() {
        return !this.activeScenario || this.isLoading;
    }
}
