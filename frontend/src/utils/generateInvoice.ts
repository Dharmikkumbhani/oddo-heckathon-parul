export function openInvoice(trip: any, days: any[]) {
  const invoiceNumber = `TL-${Date.now().toString().slice(-6)}`;
  const today = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const totalCost = days.reduce(
    (sum, d) => sum + d.items.reduce((s: number, i: any) => s + (parseFloat(i.cost.replace(/[^0-9.]/g, "")) || 0), 0),
    0
  );
  const budgetLimit = Number(trip.budget_range) || 0;

  const stopsRows = days
    .map(
      (d) => `
      <tr class="stop-header">
        <td colspan="3" style="background:#f0f4ff;font-weight:700;padding:8px 12px;color:#3b3f8c;">
          📍 Stop ${d.day}: ${d.city} &nbsp;&nbsp; <span style="font-weight:400;color:#555;font-size:12px;">${d.date}</span>
        </td>
      </tr>
      ${d.items
        .map(
          (it: any) => `
        <tr>
          <td style="padding:7px 12px;">${it.time}</td>
          <td style="padding:7px 12px;">${it.title} <span style="color:#888;font-size:11px;">(${it.cat})</span></td>
          <td style="padding:7px 12px;text-align:right;font-weight:600;">${it.cost}</td>
        </tr>`
        )
        .join("")}`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice — ${trip.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f7f8fc; color: #222; }
    .page { max-width: 760px; margin: 30px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,.10); }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #0ea5e9 100%); padding: 40px 48px 32px; color: #fff; }
    .header h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .header .sub { font-size: 13px; opacity: .8; margin-top: 4px; }
    .meta { display: flex; gap: 32px; margin-top: 24px; }
    .meta-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: .7; }
    .meta-item p { font-size: 14px; font-weight: 700; margin-top: 2px; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
    .brand-dot { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,.25); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .brand-name { font-size: 22px; font-weight: 900; letter-spacing: -1px; }
    .brand-tag { font-size: 11px; opacity: .7; }
    .body { padding: 36px 48px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    table thead th { text-align: left; padding: 10px 12px; background: #f0f4ff; color: #3b3f8c; font-size: 11px; text-transform: uppercase; letter-spacing: .6px; }
    table thead th:last-child { text-align: right; }
    table tbody tr:hover td { background: #f8f9ff; }
    table tbody td { border-bottom: 1px solid #eef0f8; }
    .total-section { margin-top: 24px; display: flex; justify-content: flex-end; }
    .total-box { background: #f0f4ff; border-radius: 12px; padding: 20px 28px; min-width: 240px; }
    .total-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
    .total-row.big { font-size: 18px; font-weight: 800; color: #1e3a8a; border-top: 2px solid #c7d2fe; padding-top: 10px; margin-top: 4px; }
    .budget-status { margin-top: 8px; font-size: 12px; font-weight: 700; text-align: right; }
    .under { color: #16a34a; }
    .over { color: #dc2626; }
    .footer { border-top: 1px solid #eee; padding: 20px 48px; display: flex; justify-content: space-between; font-size: 11px; color: #999; background: #fafbff; }
    .status-chip { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700;
      background: ${trip.status === "completed" ? "#dcfce7" : trip.status === "ongoing" ? "#fef9c3" : "#dbeafe"};
      color: ${trip.status === "completed" ? "#166534" : trip.status === "ongoing" ? "#854d0e" : "#1e40af"}; }
    @media print {
      body { background: #fff; }
      .page { box-shadow: none; margin: 0; border-radius: 0; }
      @page { margin: 0; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      <div class="brand-dot">✈️</div>
      <div>
        <div class="brand-name">Traveloop</div>
        <div class="brand-tag">Trip Planning Platform</div>
      </div>
    </div>
    <h1>${trip.title}</h1>
    <div class="sub"><span class="status-chip">${(trip.status || "upcoming").toUpperCase()}</span></div>
    <div class="meta">
      <div class="meta-item"><label>Invoice No.</label><p>${invoiceNumber}</p></div>
      <div class="meta-item"><label>Issue Date</label><p>${today}</p></div>
      <div class="meta-item"><label>Travel Dates</label><p>${trip.start_date ? new Date(trip.start_date).toLocaleDateString("en-IN") : "TBD"} → ${trip.end_date ? new Date(trip.end_date).toLocaleDateString("en-IN") : "TBD"}</p></div>
      <div class="meta-item"><label>Budget Limit</label><p>$${budgetLimit.toLocaleString()}</p></div>
    </div>
  </div>
  <div class="body">
    <table>
      <thead>
        <tr>
          <th style="width:70px">Time</th>
          <th>Activity / Description</th>
          <th style="width:90px;text-align:right">Cost</th>
        </tr>
      </thead>
      <tbody>${stopsRows}</tbody>
    </table>
    <div class="total-section">
      <div class="total-box">
        <div class="total-row"><span>Subtotal</span><span>$${totalCost.toLocaleString()}</span></div>
        <div class="total-row"><span>Budget Limit</span><span>$${budgetLimit.toLocaleString()}</span></div>
        <div class="total-row big"><span>Total Cost</span><span>$${totalCost.toLocaleString()}</span></div>
        ${budgetLimit > 0 ? `<div class="budget-status ${budgetLimit < totalCost ? "over" : "under"}">
          ${budgetLimit < totalCost ? `⚠️ $${(totalCost - budgetLimit).toLocaleString()} over budget` : `✅ $${(budgetLimit - totalCost).toLocaleString()} under budget`}
        </div>` : ""}
      </div>
    </div>
  </div>
  <div class="footer">
    <span>Generated by Traveloop · ${today}</span>
    <span>Invoice ${invoiceNumber} · This is an estimate document</span>
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
