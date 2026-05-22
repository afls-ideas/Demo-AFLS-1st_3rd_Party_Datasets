import { LightningElement, api, track, wire } from 'lwc';
import getDataForAccount from '@salesforce/apex/DemoDataLoader.getDataForAccount';

const COLUMN_MAP = {
    prescription: [
        { label: 'Product', fieldName: 'product', type: 'text' },
        { label: 'Category', fieldName: 'product_category', type: 'text' },
        { label: 'Period', fieldName: 'period', type: 'text' },
        { label: 'TRx', fieldName: 'trx', type: 'number' },
        { label: 'NRx', fieldName: 'nrx', type: 'number' },
        { label: 'Payer', fieldName: 'payer_segment', type: 'text' }
    ],
    specialty_pharmacy: [
        { label: 'Product', fieldName: 'product', type: 'text' },
        { label: 'Pharmacy', fieldName: 'pharmacy_name', type: 'text' },
        { label: 'Period', fieldName: 'period', type: 'text' },
        { label: 'Fills', fieldName: 'fills', type: 'number' },
        { label: 'Refills', fieldName: 'refills', type: 'number' },
        { label: 'Adherence (PDC)', fieldName: 'adherence_pdc', type: 'percent' },
        { label: 'Abandon Rate', fieldName: 'abandonment_rate', type: 'percent' }
    ],
    claims: [
        { label: 'Claim ID', fieldName: 'claim_id', type: 'text' },
        { label: 'Product', fieldName: 'product', type: 'text' },
        { label: 'Diagnosis', fieldName: 'diagnosis_desc', type: 'text' },
        { label: 'Line', fieldName: 'line_of_therapy', type: 'text' },
        { label: 'Period', fieldName: 'period', type: 'text' },
        { label: 'Allowed', fieldName: 'total_allowed', type: 'currency' },
        { label: 'Status', fieldName: 'status', type: 'text' }
    ],
    formulary: [
        { label: 'Plan', fieldName: 'plan_name', type: 'text' },
        { label: 'Product', fieldName: 'product', type: 'text' },
        { label: 'Status', fieldName: 'status', type: 'text' },
        { label: 'Tier', fieldName: 'tier', type: 'text' },
        { label: 'PA Required', fieldName: 'pa_required', type: 'boolean' },
        { label: 'Step Therapy', fieldName: 'step_therapy', type: 'boolean' }
    ],
    patient_journey: [
        { label: 'Product', fieldName: 'product', type: 'text' },
        { label: 'Period', fieldName: 'period', type: 'text' },
        { label: 'Enrolled', fieldName: 'patients_enrolled', type: 'number' },
        { label: 'PA Approved', fieldName: 'pa_approved', type: 'number' },
        { label: 'PA Denied', fieldName: 'pa_denied', type: 'number' },
        { label: 'Persistency', fieldName: 'persistency_rate', type: 'percent' }
    ],
    medical_event: [
        { label: 'Product', fieldName: 'product', type: 'text' },
        { label: 'Event', fieldName: 'event', type: 'text' },
        { label: 'Grade', fieldName: 'grade', type: 'number' },
        { label: 'Organ System', fieldName: 'organ_system', type: 'text' },
        { label: 'Date', fieldName: 'period', type: 'text' },
        { label: 'Outcome', fieldName: 'outcome', type: 'text' }
    ]
};

export default class DemoDataViewer extends LightningElement {
    @api recordId;
    @track selectedType = 'prescription';
    @track tableData = [];
    @track tableColumns = [];

    typeOptions = [
        { label: 'Prescriptions', value: 'prescription' },
        { label: 'Specialty Pharmacy', value: 'specialty_pharmacy' },
        { label: 'Claims', value: 'claims' },
        { label: 'Formulary', value: 'formulary' },
        { label: 'Patient Journey', value: 'patient_journey' },
        { label: 'Medical Events', value: 'medical_event' }
    ];

    @wire(getDataForAccount, { accountId: '$recordId', dataType: '$selectedType' })
    wiredData({ error, data }) {
        if (data) {
            this.tableColumns = COLUMN_MAP[this.selectedType] || this.buildDynamicColumns(data);
            this.tableData = data.map((rec, idx) => {
                const parsed = JSON.parse(rec.Payload__c);
                return { ...parsed, id: rec.Id || String(idx) };
            });
        } else if (error) {
            this.tableData = [];
        }
    }

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
        this.tableData = [];
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

    get hasData() {
        return this.tableData && this.tableData.length > 0;
    }
}