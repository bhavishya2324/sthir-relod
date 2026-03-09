/**
 * SATYASAAR — Delhivery API Proxy
 * Deploy to Vercel: save as /api/delhivery.js
 * Set env var: DELHIVERY_TOKEN = your_token
 *
 * Get token: Delhivery Partner Portal → Settings → API
 */

const BASE  = 'https://track.delhivery.com';
const TOKEN = process.env.DELHIVERY_TOKEN;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k,v]) => res.setHeader(k,v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!TOKEN) return res.status(500).json({ error: 'DELHIVERY_TOKEN not set in environment variables' });

  const { action } = req.query;

  try {

    // ── TRACK SHIPMENT ──────────────────────────────────────────
    if (action === 'track') {
      const { waybill } = req.query;
      if (!waybill) return res.status(400).json({ error: 'waybill required' });

      const r = await fetch(`${BASE}/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}&verbose=1`, {
        headers: { 'Authorization': `Token ${TOKEN}` }
      });
      const data = await r.json();

      if (!data.ShipmentData?.length) {
        return res.status(404).json({ error: 'Waybill not found', code: 'NOT_FOUND' });
      }

      const s = data.ShipmentData[0].Shipment;
      return res.status(200).json({
        waybill:       s.AWB,
        status:        s.Status.Status,
        statusLabel:   mapStatus(s.Status.Status),
        expectedDate:  s.ExpectedDeliveryDate,
        deliveredDate: s.DeliveredDate || null,
        origin:        s.Origin,
        destination:   s.Destination,
        consignee:     { name: s.Consignee?.Name||'', city: s.Consignee?.City||'' },
        weight:        s.Weight,
        paymentMode:   s.PaymentMode,
        scans: (s.Scans||[]).map(sc => ({
          date:     sc.ScanDetail.ScanDateTime,
          status:   sc.ScanDetail.Scan,
          label:    mapStatus(sc.ScanDetail.Scan),
          location: sc.ScanDetail.ScannedLocation,
          remark:   sc.ScanDetail.Instructions||'',
        }))
      });
    }

    // ── PIN SERVICEABILITY + EDD ────────────────────────────────
    if (action === 'pincode') {
      const { pin } = req.query;
      if (!pin || !/^\d{6}$/.test(pin)) return res.status(400).json({ error: 'Valid 6-digit PIN required' });

      const r = await fetch(`${BASE}/c/api/pin-codes/json/?filter_codes=${pin}`, {
        headers: { 'Authorization': `Token ${TOKEN}` }
      });
      const data = await r.json();

      if (!data.delivery_codes?.length) {
        return res.status(200).json({ serviceable: false, pin, edd: null });
      }

      const info = data.delivery_codes[0].postal_code;
      const isODA = info.is_oda === 'Y';
      const days  = isODA ? 7 : Math.max(2, parseInt(info.pre_delivery_score)||3);
      const eddDate = addBusinessDays(new Date(), days + 1);

      return res.status(200).json({
        serviceable: true, pin,
        city:  info.name,
        state: info.state_code,
        zone:  info.zone_name,
        isODA,
        edd: {
          days:  days + 1,
          date:  eddDate.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' }),
          iso:   eddDate.toISOString().split('T')[0],
        }
      });
    }

    // ── CREATE SHIPMENT ─────────────────────────────────────────
    if (action === 'create') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
      const b = req.body;
      if (!b?.order_id || !b?.pin) return res.status(400).json({ error: 'order_id and pin required' });

      const isCOD = (b.payment_method||'').toLowerCase() === 'cod';
      const shipmentData = JSON.stringify({
        shipments: [{
          name: b.customer_name, add: b.address, pin: String(b.pin),
          city: b.city, state: b.state, country: 'India', phone: b.phone,
          order: b.order_id,
          payment_mode: isCOD ? 'COD' : 'Prepaid',
          return_pin: b.return_pin||'452001', return_city: b.return_city||'Indore',
          return_phone: b.return_phone||'9999999999', return_name: 'Satyasaar',
          return_add: b.return_address||'Satyasaar Warehouse',
          return_state: b.return_state||'Madhya Pradesh', return_country: 'India',
          products_desc: b.products||'Devotional Sculpture',
          hsn_code: '97010000',
          cod_amount: isCOD ? String(b.total) : '0',
          order_date: new Date().toISOString().split('T')[0],
          total_amount: String(b.total), seller_name: 'Satyasaar', seller_inv: b.order_id,
          quantity: String(b.quantity||1), waybill: '',
          shipment_width:'20', shipment_height:'20', shipment_length:'20',
          weight: String(b.weight||'0.8'), shipping_mode:'Surface', address_type:'home',
        }]
      });

      const r = await fetch(`${BASE}/api/cmu/create.json`, {
        method: 'POST',
        headers: { 'Content-Type':'application/x-www-form-urlencoded', 'Authorization':`Token ${TOKEN}` },
        body: new URLSearchParams({ format:'json', data: shipmentData }).toString()
      });
      const data = await r.json();
      const waybill = data.packages?.[0]?.waybill || null;
      return res.status(200).json({ success: !!waybill, waybill, raw: data });
    }

    // ── GENERATE LABEL PDF ──────────────────────────────────────
    if (action === 'label') {
      const { waybill } = req.query;
      if (!waybill) return res.status(400).json({ error: 'waybill required' });
      const r = await fetch(`${BASE}/api/p/packing_slip?wbns=${waybill}&pdf=true`, {
        headers: { 'Authorization': `Token ${TOKEN}` }
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="label-${waybill}.pdf"`);
      const buf = await r.arrayBuffer();
      return res.status(200).send(Buffer.from(buf));
    }

    // ── CANCEL SHIPMENT ─────────────────────────────────────────
    if (action === 'cancel') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
      const { waybill } = req.body;
      if (!waybill) return res.status(400).json({ error: 'waybill required' });
      const r = await fetch(`${BASE}/api/p/edit?waybill=${waybill}&cancellation=true`, {
        headers: { 'Authorization': `Token ${TOKEN}` }
      });
      return res.status(200).json(await r.json());
    }

    return res.status(400).json({ error: `Unknown action "${action}". Use: track, pincode, create, label, cancel` });

  } catch(err) {
    console.error('[Delhivery Proxy]', err);
    return res.status(500).json({ error: err.message });
  }
}

function addBusinessDays(date, n) {
  let d = new Date(date), added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d;
}

function mapStatus(code) {
  const m = {
    'Manifested':'Shipment Created','In Transit':'In Transit',
    'Reached at Destination':'At Destination Hub','Out for Delivery':'Out for Delivery',
    'Delivered':'Delivered','RTO Initiated':'Return Initiated',
    'RTO In Transit':'Returning to Sender','RTO Delivered':'Returned to Sender',
    'Failed Delivery Attempt':'Delivery Attempted','Pickup Scheduled':'Pickup Scheduled',
    'Pickup Generated':'Pickup Requested','Cancelled':'Cancelled',
  };
  return m[code] || code;
}