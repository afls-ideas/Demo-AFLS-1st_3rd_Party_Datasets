import { LightningElement, api, wire } from 'lwc';
import getDataForAccount from '@salesforce/apex/DemoDataLoader.getDataForAccount';
import getDataByType from '@salesforce/apex/DemoDataLoader.getDataByType';

const OUR_PRODUCT = 'Immunonco (US)';

export default class LscMobileInline_accessStatus extends LightningElement {
    @api recordId;
    signals = [];
    formularyCards = [];
    claimCards = [];
    hasFormulary = false;
    hasClaims = false;
    kpi = {};

    _formularyAll = [];
    _claimsAll = [];

    @wire(getDataForAccount, { accountId: '$recordId', dataType: 'claims' })
    wiredClaims({ error, data }) {
        if (data && data.length) {
            this.hasClaims = true;
            this._claimsAll = data.map((rec, idx) => {
                const parsed = JSON.parse(rec.Payload__c);
                return { ...parsed, id: rec.Id || String(idx) };
            });
        } else {
            this.hasClaims = false;
            this._claimsAll = [];
        }
        this.processAll();
    }

    @wire(getDataByType, { dataType: 'formulary', scenario: 'demo_formulary_oncology_usw_sf' })
    wiredFormulary({ error, data }) {
        if (data && data.length) {
            this.hasFormulary = true;
            this._formularyAll = data.map((rec, idx) => {
                const parsed = JSON.parse(rec.Payload__c);
                return { ...parsed, id: rec.Id || String(idx) };
            });
        } else {
            this.hasFormulary = false;
            this._formularyAll = [];
        }
        this.processAll();
    }

    processAll() {
        const ourFormulary = this._formularyAll.filter(f => f.product === OUR_PRODUCT);
        const listedCount = ourFormulary.filter(f => f.status === 'Listed' || f.status === 'Preferred').length;
        const paCount = ourFormulary.filter(f => f.pa_required).length;

        this.formularyCards = ourFormulary.map(f => {
            let pillClass = 'status-pill ';
            const s = (f.status || '').toLowerCase();
            if (s === 'listed' || s === 'preferred') pillClass += 'status-listed';
            else if (s === 'pending') pillClass += 'status-pending';
            else if (s === 'not listed') pillClass += 'status-notlisted';
            else pillClass += 'status-restricted';
            return { ...f, statusPillClass: pillClass };
        });

        const ourClaims = this._claimsAll.filter(c => c.product === OUR_PRODUCT);
        const paidClaims = ourClaims.filter(c => c.status && c.status.toLowerCase().includes('paid') && !c.status.toLowerCase().includes('denied'));
        const totalPaid = ourClaims.reduce((s, c) => s + (c.total_paid || 0), 0);
        const avgReimb = ourClaims.length > 0 ? Math.round(totalPaid / ourClaims.length) : 0;

        this.claimCards = this._claimsAll.sort((a, b) => (b.period || '').localeCompare(a.period || '')).map(c => {
            const st = (c.status || '').toLowerCase();
            let statusClass = 'claim-status-pending';
            if (st.includes('paid') && !st.includes('denied') && !st.includes('partial')) statusClass = 'claim-status-paid';
            else if (st.includes('denied')) statusClass = 'claim-status-denied';
            else if (st.includes('partial')) statusClass = 'claim-status-partial';
            return { ...c, statusClass, total_paid: (c.total_paid || 0).toLocaleString() };
        });

        const deniedCount = ourClaims.filter(c => c.status && (c.status.toLowerCase().includes('denied') || c.status.toLowerCase().includes('partial'))).length;
        this.kpi = {
            plansListed: String(listedCount),
            totalPlans: String(ourFormulary.length),
            plansCardClass: 'kpi-card' + (listedCount < ourFormulary.length / 2 ? ' kpi-card-warn' : ' kpi-card-success'),
            claimsPaid: String(paidClaims.length),
            totalClaims: String(ourClaims.length),
            claimsCardClass: 'kpi-card' + (deniedCount > 0 ? ' kpi-card-error' : ' kpi-card-success'),
            avgReimbursement: '$' + avgReimb.toLocaleString(),
            paRequired: String(paCount),
            paCardClass: 'kpi-card' + (paCount > 2 ? ' kpi-card-warn' : '')
        };

        this.detectSignals(ourFormulary, ourClaims);
    }

    detectSignals(ourFormulary, ourClaims) {
        const detected = [];

        ourFormulary.forEach(f => {
            if (f.status === 'Pending' && f.pt_committee_date) {
                detected.push({
                    level: 'warning', icon: 'utility:event', label: 'P&T Review Upcoming',
                    message: `${f.plan_name}: committee review on ${f.pt_committee_date}`,
                    action: 'Coordinate with KAM to prepare clinical dossier. Ensure medical affairs has submitted outcomes data to the P&T committee.',
                    id: 'sig-pt-' + f.plan_id
                });
            }
            if (f.step_therapy === true) {
                detected.push({
                    level: 'info', icon: 'utility:steps', label: 'Step Therapy Required',
                    message: `${f.plan_name} requires step therapy. ${f.notes || ''}`,
                    action: 'Educate HCP on step therapy pathway and expected timeline. Prepare medical exception letter template if patients have contraindications.',
                    id: 'sig-step-' + f.plan_id
                });
            }
            if (f.status === 'Not Listed') {
                detected.push({
                    level: 'error', icon: 'utility:block_visitor', label: 'Not on Formulary',
                    message: `${f.plan_name}: ${OUR_PRODUCT} not listed`,
                    action: 'Flag to managed markets team. Discuss medical exception / single-patient override with HCP for immediate patient needs.',
                    id: 'sig-notlisted-' + f.plan_id
                });
            }
        });

        const denied = ourClaims.filter(c => c.status && c.status.toLowerCase().includes('denied'));
        if (denied.length > 0) {
            detected.push({
                level: 'error', icon: 'utility:error', label: 'Claims Denied',
                message: `${denied.length} of ${ourClaims.length} claims denied — latest: ${denied[denied.length - 1].status} (${denied[denied.length - 1].period})`,
                action: 'Engage field reimbursement manager to review denial reasons. Assist office with appeal process and ensure correct J-code/diagnosis coding.',
                id: 'sig-denied'
            });
        }

        const partial = ourClaims.filter(c => c.status && c.status.toLowerCase().includes('partial'));
        if (partial.length > 0 && denied.length === 0) {
            detected.push({
                level: 'warning', icon: 'utility:warning', label: 'Partial Reimbursement',
                message: `${partial.length} claims with partial payment — possible coding or coverage issues`,
                action: 'Review claim coding with office staff. Connect with reimbursement hotline to clarify coverage criteria.',
                id: 'sig-partial'
            });
        }

        if (denied.length === 0 && ourFormulary.every(f => f.status === 'Listed' || f.status === 'Preferred')) {
            detected.push({
                level: 'success', icon: 'utility:check', label: 'Strong Access Position',
                message: `${OUR_PRODUCT} listed on all ${ourFormulary.length} plans with no denied claims`,
                action: 'Leverage strong access position in HCP discussions. Focus on clinical value and patient identification.',
                id: 'sig-good-access'
            });
        }

        this.signals = detected.map(s => ({ ...s, bannerClass: 'signal-banner signal-' + s.level }));
    }

    get hasSignals() { return this.signals.length > 0; }
    get hasData() { return this.hasFormulary || this.hasClaims; }
    get headerBadge() {
        const issues = this.signals.filter(s => s.level === 'error' || s.level === 'warning').length;
        return issues > 0 ? `${issues} issue(s) need attention` : 'No issues';
    }
}
