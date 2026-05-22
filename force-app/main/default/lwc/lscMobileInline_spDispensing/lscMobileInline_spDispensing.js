import { LightningElement, api, wire } from 'lwc';
import { gql, graphql, refreshGraphQL } from 'lightning/uiGraphQLApi';

const VERSION = 'v1.1.0 — 2026-05-21 — GraphQL offline';

export default class LscMobileInline_spDispensing extends LightningElement {
    @api recordId;
    @api mobileHeight = 550;

    version = VERSION;
    refreshing = false;

    signals = [];
    tableData = [];
    hasData = false;
    flowCards = [];
    compareRows = [];
    selectedProduct = '';
    productOptions = [];
    _allParsed = [];
    _wireResult;

    columns = [
        { label: 'Pharmacy', fieldName: 'pharmacy_name', type: 'text' },
        { label: 'Payer', fieldName: 'payer_segment', type: 'text' },
        { label: 'Period', fieldName: 'period', type: 'text' },
        { label: 'Fills', fieldName: 'fills', type: 'number' },
        { label: 'Refills', fieldName: 'refills', type: 'number' },
        { label: 'Days to Fill', fieldName: 'avg_days_to_fill', type: 'number' },
        { label: 'PDC', fieldName: 'adherence_pdc', type: 'number', typeAttributes: { minimumFractionDigits: 2 } },
        { label: 'Abandon %', fieldName: 'abandonment_rate', type: 'number', typeAttributes: { minimumFractionDigits: 2 } }
    ];

    @wire(graphql, {
        query: gql`
            query SpDispensing {
                uiapi {
                    query {
                        Demo_Data__c(
                            where: { Type__c: { eq: "specialty_pharmacy" } }
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
    wiredData(result) {
        this._wireResult = result;
        const { data, errors } = result;
        if (errors) {
            this.hasData = false;
            return;
        }
        const allEdges = data?.uiapi?.query?.Demo_Data__c?.edges || [];
        const records = allEdges
            .filter((e) => e.node.Account__c?.value === this.recordId)
            .map((e) => ({
                Id: e.node.Id,
                Payload__c: e.node.Payload__c?.value
            }));

        if (records.length) {
            this.hasData = true;
            this._allParsed = records.map((rec, idx) => {
                const parsed = JSON.parse(rec.Payload__c);
                return { ...parsed, id: rec.Id || String(idx) };
            });
            const products = [...new Set(this._allParsed.map((r) => r.product || 'Unknown'))];
            this.productOptions = products.map((p) => ({ label: p, value: p }));
            this.selectedProduct = products[0] || '';
            this.processForProduct();
        } else {
            this.hasData = false;
            this._allParsed = [];
            this.tableData = [];
            this.signals = [];
            this.flowCards = [];
            this.compareRows = [];
        }
    }

    async handleRefresh() {
        if (this.refreshing) return;
        this.refreshing = true;
        try {
            if (this._wireResult) {
                await refreshGraphQL(this._wireResult);
            }
        } catch (e) {
            // swallow — refresh is best-effort
        } finally {
            this.refreshing = false;
        }
    }

    handleProductChange(event) {
        this.selectedProduct = event.detail.value;
        this.processForProduct();
    }

    get filteredTableData() {
        return this.tableData;
    }

    processForProduct() {
        const rows = this._allParsed.filter((r) => (r.product || 'Unknown') === this.selectedProduct);
        this.tableData = rows;
        this.processAll(rows);
    }

    processAll(data) {
        const byPharmacy = {};
        data.forEach((r) => {
            const name = r.pharmacy_name || 'Unknown';
            if (!byPharmacy[name]) byPharmacy[name] = { rows: [], payer: r.payer_segment || '' };
            byPharmacy[name].rows.push(r);
        });

        const spNames = Object.keys(byPharmacy);
        const spStats = {};

        spNames.forEach((name) => {
            const rows = byPharmacy[name].rows.sort((a, b) => a.period.localeCompare(b.period));
            const totalFills = rows.reduce((s, r) => s + (r.fills || 0), 0);
            const latest = rows[rows.length - 1];
            spStats[name] = {
                rows, totalFills, latest,
                payer: byPharmacy[name].payer,
                latestPdc: latest.adherence_pdc,
                latestAbandon: latest.abandonment_rate,
                latestTtf: latest.avg_days_to_fill,
                latestCopay: latest.copay_assistance_used
            };
        });

        const ranked = spNames.sort((a, b) => {
            const pa = spStats[a].latestPdc || 0;
            const pb = spStats[b].latestPdc || 0;
            return pb - pa;
        });

        this.flowCards = ranked.map((name, idx) => {
            const s = spStats[name];
            const pdcRaw = s.latestPdc;
            const pdcPct = pdcRaw != null ? (pdcRaw * 100).toFixed(0) + '%' : '—';
            const abandonPct = s.latestAbandon != null ? (s.latestAbandon * 100).toFixed(0) + '%' : '—';
            const avgDays = s.latestTtf != null ? String(s.latestTtf) : '—';

            let tier = 'good';
            if (idx === 0) tier = 'best';
            else if (pdcRaw != null && pdcRaw < 0.80) tier = 'bad';
            else if (pdcRaw != null && pdcRaw < 0.88) tier = 'warn';

            let pdcColor = 'flow-sp-pdc flow-sp-pdc-good';
            if (pdcRaw != null && pdcRaw < 0.80) pdcColor = 'flow-sp-pdc flow-sp-pdc-bad';
            else if (pdcRaw != null && pdcRaw < 0.88) pdcColor = 'flow-sp-pdc flow-sp-pdc-warn';

            return {
                id: name, name, payer: s.payer, totalFills: s.totalFills,
                pdcPct, abandonPct, avgDays,
                cardClass: 'flow-sp-card flow-sp-' + tier,
                pdcValueClass: pdcColor
            };
        });

        this.compareRows = ranked.map((name, idx) => {
            const s = spStats[name];
            const rank = idx + 1;
            const pdcRaw = s.latestPdc;
            const pdcPct = pdcRaw != null ? Math.round(pdcRaw * 100) : 0;
            const pdcStr = pdcRaw != null ? pdcPct + '%' : '—';
            const abandonRaw = s.latestAbandon;
            const abandonStr = abandonRaw != null ? (abandonRaw * 100).toFixed(0) + '%' : '—';
            const ttfStr = s.latestTtf != null ? s.latestTtf + 'd' : '—';

            const pdcLvl = pdcRaw == null ? 'neutral' : pdcRaw >= 0.90 ? 'good' : pdcRaw >= 0.85 ? 'warn' : 'bad';
            const abandonLvl = abandonRaw == null ? 'neutral' : abandonRaw <= 0.05 ? 'good' : abandonRaw <= 0.12 ? 'warn' : 'bad';
            const ttfLvl = s.latestTtf == null ? 'neutral' : s.latestTtf <= 3 ? 'good' : s.latestTtf <= 5 ? 'warn' : 'bad';

            return {
                id: name, name, payer: s.payer, rank,
                rankClass: 'compare-rank rank-' + Math.min(rank, 4),
                pdc: pdcStr, pdcClass: 'compare-val-' + pdcLvl,
                pdcBarClass: 'compare-bar-fill compare-bar-' + pdcLvl,
                pdcBarStyle: `width:${pdcPct}%`,
                totalFills: String(s.totalFills),
                ttf: ttfStr, ttfClass: 'compare-val-' + ttfLvl,
                abandon: abandonStr, abandonClass: 'compare-val-' + abandonLvl,
                copay: s.latestCopay ? 'Active' : 'Inactive',
                copayClass: s.latestCopay ? 'copay-yes' : 'copay-no'
            };
        });

        this.detectSignals(spStats, ranked);
    }

    detectSignals(spStats, ranked) {
        const detected = [];
        const product = this.selectedProduct;

        if (ranked.length >= 2) {
            const best = spStats[ranked[0]];
            const worst = spStats[ranked[ranked.length - 1]];
            if (best.latestPdc != null && worst.latestPdc != null) {
                const gap = best.latestPdc - worst.latestPdc;
                if (gap > 0.10) {
                    detected.push({
                        level: 'error', icon: 'utility:warning',
                        label: 'Channel Performance Gap',
                        message: `${ranked[ranked.length - 1]} (${(worst.latestPdc * 100).toFixed(0)}% PDC) is ${(gap * 100).toFixed(0)} points behind ${ranked[0]} (${(best.latestPdc * 100).toFixed(0)}%) — ${worst.payer} patients getting worse outcomes`,
                        action: `Escalate ${ranked[ranked.length - 1]} performance to trade/channel team. Patients on ${worst.payer} should be enrolled in the ${product} Patient Support Program for adherence reminders and community support.`,
                        id: 'sig-disparity'
                    });
                }
            }
        }

        ranked.forEach((name) => {
            const s = spStats[name];
            if (s.latestPdc != null && s.latestPdc < 0.85) {
                detected.push({
                    level: s.latestPdc < 0.80 ? 'error' : 'warning',
                    icon: 'utility:trending_down',
                    label: `Low Adherence — ${name}`,
                    message: `PDC at ${(s.latestPdc * 100).toFixed(0)}% for ${s.payer} patients — risk of treatment gaps`,
                    action: `Discuss with HCP: refer ${s.payer} patients to the ${product} Patient Support Program (PSP). PSP provides automated refill reminders, nurse check-ins, and peer community support to improve adherence.`,
                    id: 'sig-pdc-' + name.replace(/\s/g, '')
                });
            }
            if (s.latestAbandon != null && s.latestAbandon > 0.15) {
                detected.push({
                    level: s.latestAbandon > 0.20 ? 'error' : 'warning',
                    icon: 'utility:close',
                    label: `High Abandonment — ${name}`,
                    message: `${(s.latestAbandon * 100).toFixed(0)}% of ${s.payer} patients not picking up scripts`,
                    action: `Work with Hub to identify abandon root cause. If cost-driven, ensure copay card enrollment. If complexity-driven, offer PSP enrollment for onboarding support and care navigation.`,
                    id: 'sig-abandon-' + name.replace(/\s/g, '')
                });
            }
            if (s.latestTtf != null && s.latestTtf > 5) {
                detected.push({
                    level: s.latestTtf > 7 ? 'error' : 'warning',
                    icon: 'utility:clock',
                    label: `Slow Fill — ${name}`,
                    message: `${s.latestTtf}-day avg fill time for ${s.payer} patients`,
                    action: `Contact ${name} liaison to clear bottleneck. If PA-related, engage field reimbursement for ${s.payer}. Patients waiting >5 days should receive PSP outreach to stay engaged.`,
                    id: 'sig-ttf-' + name.replace(/\s/g, '')
                });
            }
            if (s.rows.length >= 2 && s.latestCopay === false) {
                const prior = s.rows[s.rows.length - 2];
                if (prior.copay_assistance_used === true) {
                    detected.push({
                        level: 'warning', icon: 'utility:moneybag',
                        label: `Copay Inactive — ${name}`,
                        message: `Copay assistance dropped for ${s.payer} patients — financial barrier risk`,
                        action: `Check if patients hit annual max. Re-enroll via Hub or explore foundation assistance. PSP can help navigate alternative financial support options.`,
                        id: 'sig-copay-' + name.replace(/\s/g, '')
                    });
                }
            }
        });

        if (ranked.length >= 2) {
            const best = spStats[ranked[0]];
            if (best.latestPdc != null && best.latestPdc >= 0.93 && best.latestAbandon != null && best.latestAbandon <= 0.05) {
                detected.push({
                    level: 'success', icon: 'utility:check',
                    label: `Top Channel — ${ranked[0]}`,
                    message: `${(best.latestPdc * 100).toFixed(0)}% PDC, ${(best.latestAbandon * 100).toFixed(0)}% abandon via ${best.payer} — model for other channels`,
                    action: `Share ${ranked[0]}'s process with underperforming SPs. Recommend this channel to HCP for new patients where ${best.payer} is the payer.`,
                    id: 'sig-best'
                });
            }
        }

        this.signals = detected.map((s) => ({ ...s, bannerClass: 'signal-banner signal-' + s.level }));
    }

    get hasSignals() { return this.signals.length > 0; }
    get hasMultiplePharmacies() { return this.flowCards.length > 1; }
    get headerBadge() {
        const issues = this.signals.filter((s) => s.level === 'error' || s.level === 'warning').length;
        return issues > 0 ? `${issues} channel issue(s)` : `${this.flowCards.length} SP channels`;
    }
}