import { LightningElement, api, wire } from 'lwc';
import getDataForAccount from '@salesforce/apex/DemoDataLoader.getDataForAccount';

const OUR_PRODUCT = 'Immunonco (US)';

export default class LscMobileInline_rxTrend extends LightningElement {
    @api recordId;
    signals = [];
    tableData = [];
    hasData = false;
    productSummaries = [];
    kpi = { ourTrx: '—', ourShare: '—', ourNrx: '—', ourTrxTrend: '', totalProducts: '0' };
    _ourTrending = 'flat';

    columns = [
        { label: 'Product', fieldName: 'product', type: 'text' },
        { label: 'Category', fieldName: 'product_category', type: 'text' },
        { label: 'Period', fieldName: 'period', type: 'text' },
        { label: 'TRx', fieldName: 'trx', type: 'number' },
        { label: 'NRx', fieldName: 'nrx', type: 'number' },
        { label: 'Payer', fieldName: 'payer_segment', type: 'text' }
    ];

    @wire(getDataForAccount, { accountId: '$recordId', dataType: 'prescription' })
    wiredData({ error, data }) {
        if (data && data.length) {
            this.hasData = true;
            this.tableData = data.map((rec, idx) => {
                const parsed = JSON.parse(rec.Payload__c);
                return { ...parsed, id: rec.Id || String(idx) };
            });
            this.processAll();
        } else {
            this.hasData = false;
            this.tableData = [];
            this.signals = [];
            this.productSummaries = [];
        }
    }

    processAll() {
        const byProduct = {};
        this.tableData.forEach(r => {
            if (!byProduct[r.product]) byProduct[r.product] = [];
            byProduct[r.product].push(r);
        });

        const productStats = {};
        let grandTotalTrx = 0;
        let maxTrx = 0;

        Object.keys(byProduct).forEach(product => {
            const rows = byProduct[product].sort((a, b) => a.period.localeCompare(b.period));
            const totalTrx = rows.reduce((sum, r) => sum + (r.trx || 0), 0);
            const totalNrx = rows.reduce((sum, r) => sum + (r.nrx || 0), 0);
            grandTotalTrx += totalTrx;
            if (totalTrx > maxTrx) maxTrx = totalTrx;
            productStats[product] = { rows, totalTrx, totalNrx };
        });

        const ourData = productStats[OUR_PRODUCT];
        let recentAvg = 0;
        let earlierAvg = 0;
        if (ourData) {
            const rows = ourData.rows;
            if (rows.length >= 3) {
                const recent = rows.slice(-2);
                const earlier = rows.slice(-4, -2);
                recentAvg = recent.reduce((s, r) => s + r.trx, 0) / recent.length;
                earlierAvg = earlier.length ? earlier.reduce((s, r) => s + r.trx, 0) / earlier.length : recentAvg;
            }
            const share = grandTotalTrx > 0 ? ((ourData.totalTrx / grandTotalTrx) * 100).toFixed(0) : '0';
            let trendText = 'Stable';
            if (recentAvg > earlierAvg * 1.05) {
                trendText = 'Trending up';
                this._ourTrending = 'up';
            } else if (recentAvg < earlierAvg * 0.95) {
                trendText = 'Trending down';
                this._ourTrending = 'down';
            }
            this.kpi = {
                ourTrx: String(ourData.totalTrx),
                ourShare: share + '%',
                ourNrx: String(ourData.totalNrx),
                ourTrxTrend: trendText,
                totalProducts: String(Object.keys(byProduct).length)
            };
        } else {
            this._ourTrending = 'down';
            this.kpi = {
                ourTrx: '0',
                ourShare: '0%',
                ourNrx: '0',
                ourTrxTrend: 'Not prescribed',
                totalProducts: String(Object.keys(byProduct).length)
            };
        }

        this.productSummaries = Object.keys(productStats).map(product => {
            const d = productStats[product];
            const rows = d.rows;
            const isOurs = product === OUR_PRODUCT;
            let trendLabel = 'Stable';
            let trendDir = 'flat';
            if (rows.length >= 3) {
                const r2 = rows.slice(-2).reduce((s, r) => s + r.trx, 0) / 2;
                const e2 = rows.slice(-4, -2);
                const eAvg = e2.length ? e2.reduce((s, r) => s + r.trx, 0) / e2.length : r2;
                if (r2 > eAvg * 1.10) { trendLabel = 'Up'; trendDir = 'up'; }
                else if (r2 < eAvg * 0.90) { trendLabel = 'Down'; trendDir = 'down'; }
            }
            const barPct = maxTrx > 0 ? Math.round((d.totalTrx / maxTrx) * 100) : 0;
            return {
                id: product,
                product,
                totalTrx: d.totalTrx,
                totalNrx: d.totalNrx,
                isOurs,
                trendLabel,
                trendPillClass: 'trend-pill trend-' + trendDir,
                nameClass: isOurs ? 'product-name product-name-ours' : 'product-name',
                barClass: isOurs ? 'product-bar product-bar-ours' : 'product-bar',
                barStyle: `width:${barPct}%`
            };
        }).sort((a, b) => b.totalTrx - a.totalTrx);

        this.detectSignals(productStats, ourData, recentAvg, earlierAvg);
    }

    detectSignals(productStats, ourData, recentAvg, earlierAvg) {
        const detected = [];

        if (ourData) {
            if (ourData.rows.length >= 3 && recentAvg < earlierAvg * 0.8) {
                detected.push({
                    level: 'warning', icon: 'utility:trending_down', label: 'Trend Reversal',
                    message: `${OUR_PRODUCT} TRx declining: avg ${Math.round(recentAvg)} (recent) vs ${Math.round(earlierAvg)} (prior)`,
                    action: 'Schedule a call to discuss clinical outcomes and address prescribing concerns. Bring updated efficacy data.',
                    id: 'sig-trend'
                });
            } else if (ourData.rows.length >= 3 && recentAvg > earlierAvg * 1.15) {
                detected.push({
                    level: 'success', icon: 'utility:trending_up', label: 'Strong Growth',
                    message: `${OUR_PRODUCT} TRx growing: avg ${Math.round(recentAvg)} vs ${Math.round(earlierAvg)} prior`,
                    action: 'Reinforce relationship — share new clinical data, discuss expanding to additional patient segments.',
                    id: 'sig-growth'
                });
            }
            if (ourData.totalTrx <= 3) {
                detected.push({
                    level: 'error', icon: 'utility:ban', label: 'Low Adoption',
                    message: `Only ${ourData.totalTrx} total TRx across ${ourData.rows.length} periods`,
                    action: 'Initiate pull-through plan: share pivotal trial data, offer peer-to-peer speaker program or lunch-and-learn.',
                    id: 'sig-low'
                });
            }
        } else {
            detected.push({
                level: 'error', icon: 'utility:ban', label: 'Zero Adoption',
                message: `No ${OUR_PRODUCT} prescriptions on record`,
                action: 'Priority target — schedule introductory meeting with clinical data. Consider sample drop and patient identification discussion.',
                id: 'sig-zero'
            });
        }

        Object.keys(productStats).forEach(product => {
            if (product === OUR_PRODUCT) return;
            const comp = productStats[product];
            if (comp.rows.length >= 2 && ourData && ourData.rows.length >= 2) {
                const compRecent = comp.rows.slice(-2).reduce((s, r) => s + r.trx, 0) / 2;
                const compEarlier = comp.rows.slice(0, 2).reduce((s, r) => s + r.trx, 0) / 2;
                const ourRecent = ourData.rows.slice(-2).reduce((s, r) => s + r.trx, 0) / 2;
                const ourEarlier = ourData.rows.slice(0, 2).reduce((s, r) => s + r.trx, 0) / 2;
                if (compRecent > compEarlier * 1.3 && ourRecent <= ourEarlier) {
                    detected.push({
                        level: 'warning', icon: 'utility:shift_pattern_entry', label: 'Competitor Gaining',
                        message: `${product} growing (${Math.round(compEarlier)}→${Math.round(compRecent)} TRx) while ${OUR_PRODUCT} flat/declining`,
                        action: `Prepare competitive differentiation vs ${product}. Focus on Immunonco's unique MOA and safety profile advantages.`,
                        id: 'sig-comp-' + product.replace(/\s/g, '')
                    });
                }
            }
        });

        this.signals = detected.map(s => ({
            ...s,
            bannerClass: 'signal-banner signal-' + s.level
        }));
    }

    get hasSignals() { return this.signals.length > 0; }
    get hasProductSummaries() { return this.productSummaries.length > 0; }
    get headerBadge() {
        const total = this.tableData.length;
        return `${total} records across ${this.kpi.totalProducts} products`;
    }
    get ourTrxKpiClass() {
        if (this._ourTrending === 'down') return 'kpi-card kpi-card-error';
        if (this._ourTrending === 'up') return 'kpi-card kpi-card-success';
        return 'kpi-card';
    }
}
