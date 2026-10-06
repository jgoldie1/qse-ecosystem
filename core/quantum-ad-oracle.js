const fs = require('fs');
const path = require('path');

const campaignPath = path.join(__dirname, '..', 'data', 'sculptify-ad-campaign.json');
const metricsPath = path.join(__dirname, '..', 'data', 'sculptify-ad-metrics.json');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function plan() { return readJson(campaignPath, {}); }
function metrics() { return readJson(metricsPath, []); }

function record(event) {
  const rows = metrics();
  rows.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
    timestamp: new Date().toISOString(),
    platform: event.platform || 'unknown',
    campaignId: event.campaignId || 'unknown',
    event: event.event || 'unknown',
    value: Number(event.value || 0),
    source: event.source || 'site'
  });
  writeJson(metricsPath, rows.slice(-5000));
  return rows[rows.length - 1];
}

function summarize() {
  const rows = metrics();
  const out = {};
  for (const row of rows) {
    const key = row.platform + ':' + row.campaignId;
    if (!out[key]) out[key] = {events:0,revenue:0,bookings:0,purchases:0};
    out[key].events++;
    out[key].revenue += Number(row.value || 0);
    if (row.event === 'booking_submit' || row.event === 'deposit_paid') out[key].bookings++;
    if (row.event === 'deposit_paid' || row.event === 'course_purchase' || row.event === 'store_purchase') out[key].purchases++;
  }
  return out;
}

function recommend() {
  const p = plan();
  const s = summarize();
  return {
    poweredBy:'Stubbs AI',
    agent:'Quantum Scraper Oracle',
    market:p.market,
    rule:'Optimize to bookings and revenue, not vanity clicks. Use only public/non-sensitive market signals.',
    currentPlan:p.campaigns,
    performance:s
  };
}

module.exports = { plan, record, summarize, recommend };
