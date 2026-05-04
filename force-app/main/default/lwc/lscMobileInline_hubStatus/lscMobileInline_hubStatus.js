import { LightningElement, api, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import d3js from '@salesforce/resourceUrl/d3js';
import getDataForAccount from '@salesforce/apex/DemoDataLoader.getDataForAccount';

export default class LscMobileInline_hubStatus extends LightningElement {
    @api recordId;
    signals = [];
    hasData = false;
    latestSnapshot = null;
    trendRows = [];
    kpi = {};
    _allData = [];
    _d3Loaded = false;
    _funnelData = [];

    connectedCallback() {
        loadScript(this, d3js).then(() => {
            this._d3Loaded = true;
            this._tryRenderFunnel();
        });
    }

    @wire(getDataForAccount, { accountId: '$recordId', dataType: 'patient_journey' })
    wiredData({ error, data }) {
        if (data && data.length) {
            this.hasData = true;
            this._allData = data.map((rec, idx) => {
                const parsed = JSON.parse(rec.Payload__c);
                return { ...parsed, id: rec.Id || String(idx) };
            });
            this.processAll();
        } else {
            this.hasData = false;
            this._allData = [];
            this.signals = [];
            this.latestSnapshot = null;
            this.trendRows = [];
            this._funnelData = [];
        }
    }

    processAll() {
        const sorted = [...this._allData].sort((a, b) => a.period.localeCompare(b.period));
        const latest = sorted[sorted.length - 1];
        const prior = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
        if (!latest) return;

        this.latestSnapshot = { period: latest.period };

        const referred = latest.referred_to_hub || 0;
        const verified = latest.benefits_verified || 0;
        const approved = latest.approved_for_therapy || 0;
        const started = latest.started_therapy || 0;
        const onTherapy = latest.on_therapy || 0;
        const enrolled = latest.patients_enrolled || 0;
        const paApproved = latest.pa_approved || 0;
        const paDenied = latest.pa_denied || 0;
        const abandoned = latest.abandonment_count || 0;
        const persistRaw = latest.persistency_rate;
        const paAvgDays = latest.pa_avg_days_to_decision || 0;
        const copayReduction = latest.copay_avg_oop_reduction || 0;
        const persistPct = persistRaw != null ? (persistRaw * 100).toFixed(0) + '%' : '—';
        const totalPa = paApproved + paDenied;

        const verifyDrop = referred - verified;
        const approvalDrop = verified - approved;
        const startDrop = approved - started;
        const therapyDrop = started - onTherapy;

        this._funnelData = [
            { label: 'Referred to Hub', value: referred, color: '#032d60', drop: null },
            { label: 'Benefits Verified', value: verified, color: '#0b5cab', drop: verifyDrop > 0 ? `${verifyDrop} not verified` : null },
            { label: 'Approved for Therapy', value: approved, color: '#1b96ff', drop: approvalDrop > 0 ? `${approvalDrop} denied · ${paAvgDays}d avg` : null },
            { label: 'Started Therapy', value: started, color: '#2e844a', drop: startDrop > 0 ? `${startDrop} never started` : null },
            { label: 'On Therapy', value: onTherapy, color: '#194e31', drop: therapyDrop > 0 ? `${therapyDrop} discontinued` : null }
        ];

        this._tryRenderFunnel();

        let persistStatus = 'On target';
        let persistLevel = 'outcome-card-success';
        if (persistRaw != null && persistRaw < 0.70) { persistStatus = 'Critical'; persistLevel = 'outcome-card-error'; }
        else if (persistRaw != null && persistRaw < 0.80) { persistStatus = 'Below target'; persistLevel = 'outcome-card-warn'; }

        let paStatus = 'Fast';
        let paLevel = 'outcome-card-success';
        if (paAvgDays > 10) { paStatus = 'Very slow'; paLevel = 'outcome-card-error'; }
        else if (paAvgDays > 7) { paStatus = 'Slow'; paLevel = 'outcome-card-warn'; }
        else if (paAvgDays > 4) { paStatus = 'Normal'; paLevel = 'outcome-card'; }

        const conversionRate = referred > 0 ? onTherapy / referred : 0;
        const conversionPct = referred > 0 ? Math.round(conversionRate * 100) + '%' : '—';
        let conversionStatus = 'Strong';
        let conversionLevel = 'outcome-card-success';
        if (conversionRate < 0.35) { conversionStatus = 'Low'; conversionLevel = 'outcome-card-error'; }
        else if (conversionRate < 0.50) { conversionStatus = 'Below target'; conversionLevel = 'outcome-card-warn'; }

        let enrollDelta = '—';
        let enrollSub = '';
        let enrollLevel = 'outcome-card';
        if (prior) {
            const diff = referred - (prior.referred_to_hub || 0);
            enrollDelta = diff >= 0 ? '+' + diff : String(diff);
            enrollSub = `${prior.referred_to_hub || 0} → ${referred} referrals`;
            if (diff > 0) enrollLevel = 'outcome-card-success';
            else if (diff < 0) enrollLevel = 'outcome-card-warn';
        } else {
            enrollDelta = String(referred);
            enrollSub = 'first period';
        }

        this.kpi = {
            persistency: persistPct, persistStatus, persistCardClass: persistLevel,
            paAvgDays: String(paAvgDays), paStatus, paCardClass: paLevel,
            conversion: conversionPct, conversionStatus, conversionCardClass: conversionLevel,
            enrollDelta, enrollSub, enrollCardClass: enrollLevel
        };

        this.trendRows = sorted.map(r => {
            const ref = r.referred_to_hub || 0;
            const ot = r.on_therapy || 0;
            const conv = ref > 0 ? Math.round(ot / ref * 100) + '%' : '—';
            const convLevel = ref === 0 ? 'trend-val-neutral' :
                ot / ref >= 0.50 ? 'trend-val-good' :
                ot / ref >= 0.35 ? 'trend-val-warn' : 'trend-val-bad';
            const pRate = r.persistency_rate != null ? (r.persistency_rate * 100).toFixed(0) + '%' : '—';
            const pLevel = r.persistency_rate == null ? 'trend-val-neutral' :
                r.persistency_rate >= 0.85 ? 'trend-val-good' :
                r.persistency_rate >= 0.75 ? 'trend-val-warn' : 'trend-val-bad';
            const abandonVal = r.abandonment_count || 0;
            return {
                id: r.id, period: r.period,
                referred: String(ref),
                verified: String(r.benefits_verified || 0),
                approved: String(r.approved_for_therapy || 0),
                started: String(r.started_therapy || 0),
                onTherapy: String(ot),
                conversion: conv, conversionClass: convLevel,
                persist: pRate, persistClass: pLevel,
                abandon: String(abandonVal), abandonClass: abandonVal > 0 ? 'trend-val-warn' : 'trend-val-good'
            };
        });

        this.detectSignals(latest, prior, persistRaw, paAvgDays, totalPa, paDenied, referred, abandoned, conversionRate);
    }

    _tryRenderFunnel() {
        if (!this._d3Loaded || this._funnelData.length === 0) return;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        requestAnimationFrame(() => this._drawFunnel());
    }

    _clearContainer(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    _drawFunnel() {
        const container = this.template.querySelector('.funnel-chart');
        if (!container) return;
        this._clearContainer(container);

        const d3 = window.d3;
        const data = this._funnelData;
        const n = data.length;
        const topVal = Math.max(data[0].value, 1);
        const font = 'system-ui, -apple-system, sans-serif';

        const W = 600;
        const stageH = 44;
        const totalH = n * stageH;
        const padTop = 10;
        const padBot = 10;
        const H = totalH + padTop + padBot;
        const cx = W / 2 + 36;
        const maxHalfW = 190;
        const minHalfW = 42;
        const labelX = cx - maxHalfW - 16;

        const halfW = (val) => {
            const ratio = val / topVal;
            return minHalfW + (maxHalfW - minHalfW) * ratio;
        };

        const svg = d3.select(container)
            .append('svg')
            .attr('viewBox', `0 0 ${W} ${H}`)
            .attr('width', '100%')
            .attr('style', 'display:block');

        const defs = svg.append('defs');

        data.forEach((d, i) => {
            const y1 = padTop + i * stageH;
            const y2 = y1 + stageH;
            const hw1 = halfW(d.value);
            const hw2 = i < n - 1 ? halfW(data[i + 1].value) : hw1 * 0.85;

            const topL = cx - hw1;
            const topR = cx + hw1;
            const botL = cx - hw2;
            const botR = cx + hw2;

            const gradId = 'fg-' + i;
            const grad = defs.append('linearGradient').attr('id', gradId)
                .attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
            grad.append('stop').attr('offset', '0%').attr('stop-color', d.color).attr('stop-opacity', 0.95);
            grad.append('stop').attr('offset', '100%').attr('stop-color', d3.color(d.color).brighter(0.3)).attr('stop-opacity', 0.9);

            // Trapezoid: top = current width, bottom = next width
            svg.append('path')
                .attr('d', `M${topL},${y1} L${topR},${y1} L${botR},${y2} L${botL},${y2} Z`)
                .attr('fill', `url(#${gradId})`);

            // Thin separator line between stages
            if (i < n - 1) {
                svg.append('line')
                    .attr('x1', botL).attr('y1', y2)
                    .attr('x2', botR).attr('y2', y2)
                    .attr('stroke', 'rgba(255,255,255,0.5)').attr('stroke-width', 1.5);
            }

            // Count centered
            const midY = (y1 + y2) / 2;
            svg.append('text')
                .attr('x', cx)
                .attr('y', midY + 6)
                .attr('text-anchor', 'middle')
                .attr('font-size', '16px')
                .attr('font-weight', '800')
                .attr('fill', '#ffffff')
                .attr('font-family', font)
                .text(d.value);

            // Label on left
            svg.append('text')
                .attr('x', labelX)
                .attr('y', midY - 1)
                .attr('text-anchor', 'end')
                .attr('font-size', '10px')
                .attr('font-weight', '700')
                .attr('fill', '#181818')
                .attr('font-family', font)
                .text(d.label);

            const pct = topVal > 0 ? Math.round((d.value / topVal) * 100) : 0;
            svg.append('text')
                .attr('x', labelX)
                .attr('y', midY + 10)
                .attr('text-anchor', 'end')
                .attr('font-size', '9px')
                .attr('fill', '#706e6b')
                .attr('font-family', font)
                .text(pct + '%');

            // Connector line from label to funnel edge
            svg.append('line')
                .attr('x1', labelX + 6).attr('y1', midY)
                .attr('x2', topL + (botL - topL) * 0.5 - 4).attr('y2', midY)
                .attr('stroke', '#d8d8d8').attr('stroke-width', 1)
                .attr('stroke-dasharray', '3,3');

            // Drop-off annotation on the right side
            if (d.drop && i < n - 1) {
                const dropY = y2;
                const rightEdge = (topR + botR) / 2;
                const badgeX = rightEdge + 14;

                svg.append('line')
                    .attr('x1', rightEdge + 2).attr('y1', dropY)
                    .attr('x2', badgeX - 2).attr('y2', dropY)
                    .attr('stroke', '#ea001e').attr('stroke-width', 1)
                    .attr('stroke-dasharray', '2,2');

                const badgeText = '−' + d.drop;
                const textW = d.drop.length * 5 + 16;

                svg.append('rect')
                    .attr('x', badgeX)
                    .attr('y', dropY - 8)
                    .attr('width', textW)
                    .attr('height', 16)
                    .attr('rx', 8)
                    .attr('fill', '#fef1ee')
                    .attr('stroke', '#fcd4cc')
                    .attr('stroke-width', 0.5);

                svg.append('text')
                    .attr('x', badgeX + textW / 2)
                    .attr('y', dropY + 3)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '8.5px')
                    .attr('font-weight', '700')
                    .attr('fill', '#ea001e')
                    .attr('font-family', font)
                    .text(badgeText);
            }
        });

        // Outer edge highlight (left and right sides of funnel)
        const leftPath = data.map((d, i) => {
            const y = padTop + i * stageH;
            return `${cx - halfW(d.value)},${y}`;
        });
        const lastBot = padTop + n * stageH;
        const lastHw = halfW(data[n - 1].value) * 0.85;
        leftPath.push(`${cx - lastHw},${lastBot}`);

        const rightPath = data.map((d, i) => {
            const y = padTop + i * stageH;
            return `${cx + halfW(d.value)},${y}`;
        });
        rightPath.push(`${cx + lastHw},${lastBot}`);

        svg.append('polyline')
            .attr('points', leftPath.join(' '))
            .attr('fill', 'none')
            .attr('stroke', 'rgba(0,0,0,0.08)')
            .attr('stroke-width', 1);

        svg.append('polyline')
            .attr('points', rightPath.join(' '))
            .attr('fill', 'none')
            .attr('stroke', 'rgba(0,0,0,0.08)')
            .attr('stroke-width', 1);
    }

    renderedCallback() {
        this._tryRenderFunnel();
    }

    detectSignals(latest, prior, persistRaw, paAvgDays, totalPa, paDenied, referred, abandoned, conversionRate) {
        const detected = [];

        if (persistRaw != null && persistRaw < 0.80) {
            detected.push({
                level: persistRaw < 0.70 ? 'error' : 'warning',
                icon: 'utility:trending_down', label: 'Low Persistency',
                message: `Only ${(persistRaw * 100).toFixed(0)}% persistency in ${latest.period} — patients falling off therapy`,
                action: 'Discuss with HCP: identify patients at risk of discontinuation. Coordinate with Hub for nurse educator outreach and adherence support calls.',
                id: 'sig-persist'
            });
        }

        if (paAvgDays > 7) {
            detected.push({
                level: paAvgDays > 10 ? 'error' : 'warning',
                icon: 'utility:clock', label: 'PA Processing Delay',
                message: `Avg ${paAvgDays} days to PA decision — patients waiting for treatment`,
                action: 'Escalate to field reimbursement. Offer to help office staff with PA submission and provide pre-filled PA forms.',
                id: 'sig-pa-delay'
            });
        }

        if (totalPa > 0 && paDenied / totalPa > 0.3) {
            detected.push({
                level: 'error', icon: 'utility:ban', label: 'High PA Denial Rate',
                message: `${paDenied} of ${totalPa} PAs denied (${Math.round(paDenied / totalPa * 100)}%)`,
                action: 'Review denial reasons with Hub. Ensure letter of medical necessity includes required clinical criteria. Consider peer-to-peer review request.',
                id: 'sig-pa-deny'
            });
        }

        if (abandoned > 0 && latest.abandonment_reasons) {
            detected.push({
                level: 'warning', icon: 'utility:user', label: 'Patient Abandonment',
                message: `${abandoned} patient(s) abandoned: ${latest.abandonment_reasons}`,
                action: 'Address root causes — if cost-related, verify copay assistance. If side-effect related, discuss management strategies. Offer PSP re-enrollment.',
                id: 'sig-abandon'
            });
        }

        if (prior && referred < (prior.referred_to_hub || 0)) {
            detected.push({
                level: 'warning', icon: 'utility:trending_down', label: 'Referrals Declining',
                message: `Dropped from ${prior.referred_to_hub} to ${referred} referrals between ${prior.period} and ${latest.period}`,
                action: 'Discuss patient identification with HCP — are there eligible patients not being referred? Share disease awareness materials.',
                id: 'sig-enroll-drop'
            });
        }

        if (conversionRate < 0.35 && referred > 0) {
            detected.push({
                level: 'error', icon: 'utility:warning', label: 'Low Funnel Conversion',
                message: `Only ${Math.round(conversionRate * 100)}% of referred patients reach therapy — significant drop-off in the journey`,
                action: 'Review each stage for bottlenecks: benefits verification delays, PA denials, or patients not starting after approval. Coordinate with Hub for targeted outreach.',
                id: 'sig-conversion'
            });
        }

        if (persistRaw != null && persistRaw >= 0.85 && abandoned === 0 && totalPa > 0 && paDenied / totalPa <= 0.1) {
            detected.push({
                level: 'success', icon: 'utility:check', label: 'Strong Hub Performance',
                message: `${(persistRaw * 100).toFixed(0)}% persistency, no abandonment, ${Math.round((1 - paDenied / totalPa) * 100)}% PA approval rate`,
                action: 'Share positive outcomes with HCP to reinforce prescribing confidence. Discuss expanding to new patient populations.',
                id: 'sig-good-hub'
            });
        }

        this.signals = detected.map(s => ({ ...s, bannerClass: 'signal-banner signal-' + s.level }));
    }

    get hasSignals() { return this.signals.length > 0; }
    get hasSnapshot() { return this.latestSnapshot != null; }
    get hasTrendData() { return this.trendRows.length > 1; }
    get headerBadge() {
        return this.latestSnapshot ? `Latest: ${this.latestSnapshot.period}` : '';
    }
}
