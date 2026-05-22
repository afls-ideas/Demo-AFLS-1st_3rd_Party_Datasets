import { LightningElement, api, wire } from 'lwc';
import { gql, graphql, refreshGraphQL } from 'lightning/uiGraphQLApi';

const VERSION = 'v1.1.0 — 2026-05-21 — GraphQL offline';
const OUR_PRODUCT = 'Immunonco (US)';

export default class LscMobileInline_accessStatus extends LightningElement {
    @api recordId;
    @api mobileHeight = 550;

    version = VERSION;
    refreshing = false;

    signals = [];
    formularyCards = [];
    claimCards = [];
    hasFormulary = false;
    hasClaims = false;
    kpi = {};

    _formularyAll = [];
    _claimsAll = [];
    _claimsWireResult;
    _formularyWireResult;

    @wire(graphql, {
        query: gql`
            query AccessClaims {
                uiapi {
                    query {
                        Demo_Data__c(
                            where: { Type__c: { eq: "claims" } }
                            first: 200
                        ) {
                            edges {
                                node {
                                    Id
                                    Account__c { value }
                                    Payload__c { value }
                                }
                            }
                        }
                    }
                }
            }
        `
    })
    wiredClaims(result) {
        this._claimsWireResult = result;
        const { data, errors } = result;
        if (errors) {
            this.hasClaims = false;
            this._claimsAll = [];
            this.processAll();
            return;
        }
        const allEdges = data?.uiapi?.query?.Demo_Data__c?.edges || [];
        const rows = allEdges
            .filter((e) => e.node.Account__c?.value === this.recordId)
            .map((e, idx) => {
                const parsed = JSON.parse(e.node.Payload__c?.value || '{}');
                return { ...parsed, id: e.node.Id || String(idx) };
            });
        if (rows.length) {
            this.hasClaims = true;
            this._claimsAll = rows;
        } else {
            this.hasClaims = false;
            this._claimsAll = [];
        }
        this.processAll();
    }

    @wire(graphql, {
        query: gql`
            query AccessFormulary {
                uiapi {
                    query {
                        Demo_Data__c(
                            where: {
                                and: [
                                    { Type__c: { eq: "formulary" } }
                                    { Scenario__c: { eq: "demo_formulary_oncology_usw_sf" } }
                                ]
                            }
                            first: 200
                        ) {
                            edges {
                                node {
                                    Id
                                    Payload__c { value }
                                }
                            }
                        }
                    }
                }
            }
        `
    })
    wiredFormulary(result) {
        this._formularyWireResult = result;
        const { data, errors } = result;
        if (errors) {
            this.hasFormulary = false;
            this._formularyAll = [];
            this.processAll();
            return;
        }
        const allEdges = data?.uiapi?.query?.Demo_Data__c?.edges || [];
        if (allEdges.length) {
            this.hasFormulary = true;
            this._formularyAll = allEdges.map((e, idx) => {
                const parsed = JSON.parse(e.node.Payload__c?.value || '{}');
                return { ...parsed, id: e.node.Id || String(idx) };
            });
        } else {
            this.hasFormulary = false;
            this._formularyAll = [];
        }
        this.processAll();
    }

    async handleRefresh() {
        if (this.refreshing) return;
        this.refreshing = true;
        try {
            const promises = [];
            if (this._claimsWireResult) promises.push(refreshGraphQL(this._claimsWireResult));
            if (this._formularyWireResult) promises.push(refreshGraphQL(this._formularyWireResult));
            await Promise.all(promises.map((p) => p.catch(() => null)));
        } finally {
            this.refreshing = false;
        }
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