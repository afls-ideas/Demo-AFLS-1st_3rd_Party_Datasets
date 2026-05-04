import { LightningElement, api, wire } from 'lwc';
import getDataForAccount from '@salesforce/apex/DemoDataLoader.getDataForAccount';
import getDataByType from '@salesforce/apex/DemoDataLoader.getDataByType';

export default class LscMobileInline_safetyAlerts extends LightningElement {
    @api recordId;
    @api mobileHeight = 550;
    signals = [];
    aeCards = [];
    organChips = [];
    hasData = false;
    seriousCount = 0;
    totalCount = 0;
    kpi = {};

    _accountEvents = [];
    _allEvents = [];

    @wire(getDataForAccount, { accountId: '$recordId', dataType: 'medical_event' })
    wiredAccountData({ error, data }) {
        if (data && data.length) {
            this._accountEvents = data.map((rec, idx) => {
                const parsed = JSON.parse(rec.Payload__c);
                return { ...parsed, id: rec.Id || String(idx) };
            });
        } else {
            this._accountEvents = [];
        }
        this.processAll();
    }

    @wire(getDataByType, { dataType: 'medical_event', scenario: 'demo_medical_event_oncology_usw_sf' })
    wiredAllData({ error, data }) {
        if (data && data.length) {
            this._allEvents = data.map((rec, idx) => {
                const parsed = JSON.parse(rec.Payload__c);
                return { ...parsed, id: 'all-' + (rec.Id || String(idx)) };
            });
        } else {
            this._allEvents = [];
        }
        this.processAll();
    }

    processAll() {
        const accountAEs = this._accountEvents.filter(e => e.subtype === 'adverse_event');
        const aeData = accountAEs.sort((a, b) => (b.period || '').localeCompare(a.period || ''));

        this.hasData = accountAEs.length > 0 || this._allEvents.some(e => e.subtype === 'safety_signal');
        this.seriousCount = accountAEs.filter(e => e.serious || e.grade >= 3).length;
        this.totalCount = accountAEs.length;

        this.aeCards = aeData.map(ae => {
            const g = ae.grade || 1;
            let gradeClass = 'grade-badge grade-' + Math.min(g, 5);
            let cardClass = 'ae-card';
            if (ae.serious || g >= 3) cardClass += ' ae-card-serious';
            return { ...ae, gradeClass, cardClass };
        });

        const organCounts = {};
        aeData.forEach(e => {
            if (!organCounts[e.organ_system]) organCounts[e.organ_system] = 0;
            organCounts[e.organ_system]++;
        });
        const organs = Object.keys(organCounts);
        this.organChips = organs.map(organ => ({
            id: organ,
            label: `${organ} (${organCounts[organ]})`,
            chipClass: organCounts[organ] >= 2 ? 'organ-chip organ-chip-hot' : 'organ-chip'
        }));

        const grade3plus = aeData.filter(e => e.grade >= 3);
        const safetySignals = this._allEvents.filter(e => e.subtype === 'safety_signal');
        const discontinued = aeData.filter(e => e.outcome && e.outcome.toLowerCase().includes('discontinuation'));

        const signalCount = (grade3plus.length > 0 ? 1 : 0) + safetySignals.length +
            Object.keys(organCounts).filter(o => organCounts[o] >= 2).length + (discontinued.length > 0 ? 1 : 0);

        this.kpi = {
            totalAE: String(this.totalCount),
            totalCardClass: 'kpi-card' + (this.totalCount > 5 ? ' kpi-card-warn' : ''),
            serious: String(this.seriousCount),
            seriousCardClass: 'kpi-card' + (this.seriousCount > 0 ? ' kpi-card-error' : ' kpi-card-success'),
            organSystems: String(organs.length),
            signalCount: String(signalCount),
            signalCardClass: 'kpi-card' + (signalCount > 0 ? ' kpi-card-warn' : ' kpi-card-success')
        };

        this.detectSignals(aeData, grade3plus, safetySignals, organCounts, discontinued);
    }

    detectSignals(aeData, grade3plus, safetySignals, organCounts, discontinued) {
        const detected = [];

        if (grade3plus.length > 0) {
            const latest = grade3plus[0];
            detected.push({
                level: 'error', icon: 'utility:error', label: `Grade ${latest.grade} Event`,
                message: `${latest.event} (Grade ${latest.grade}) reported ${latest.period} — ${latest.outcome}`,
                action: 'Acknowledge awareness in next call. Do NOT proactively discuss — only if HCP raises it. Have REMS/safety data ready if asked.',
                id: 'sig-grade3'
            });
        }

        safetySignals.forEach(ss => {
            detected.push({
                level: 'error', icon: 'utility:shield', label: 'Territory Safety Signal',
                message: `${ss.event} detected ${ss.period}. ${ss.management || ''}`,
                action: 'Review Dear HCP letter and updated PI. Be prepared to discuss risk mitigation strategies if HCP asks. Do not initiate safety discussions.',
                id: 'sig-signal-' + ss.id
            });
        });

        Object.keys(organCounts).forEach(organ => {
            if (organCounts[organ] >= 2) {
                detected.push({
                    level: 'warning', icon: 'utility:refresh', label: 'Recurrent AE Pattern',
                    message: `${organCounts[organ]} events in ${organ} system across multiple cycles`,
                    action: 'Note pattern for awareness. If HCP raises tolerability concerns, discuss dose modification protocols and supportive care guidelines.',
                    id: 'sig-recur-' + organ
                });
            }
        });

        if (discontinued.length > 0) {
            detected.push({
                level: 'error', icon: 'utility:stop', label: 'Treatment Discontinued',
                message: `${discontinued[0].event} led to permanent discontinuation of therapy`,
                action: 'Sensitive topic — do not bring up proactively. If HCP discusses, listen and share re-challenge data if applicable per approved labeling.',
                id: 'sig-discontinue'
            });
        }

        if (this.seriousCount === 0 && this.totalCount > 0 && grade3plus.length === 0) {
            detected.push({
                level: 'success', icon: 'utility:check', label: 'Manageable Safety Profile',
                message: `${this.totalCount} AE(s) on record, all Grade 1-2 — no serious events`,
                action: 'Reinforce positive tolerability profile in next discussion. Share real-world safety data and patient quality-of-life outcomes.',
                id: 'sig-clean'
            });
        }

        this.signals = detected.map(s => ({ ...s, bannerClass: 'signal-banner signal-' + s.level }));
    }

    get hasSignals() { return this.signals.length > 0; }
    get hasOrganChips() { return this.organChips.length > 0; }
    get headerBadge() {
        if (this.seriousCount > 0) return `${this.seriousCount} serious event(s)`;
        return `${this.totalCount} event(s), all manageable`;
    }
}
