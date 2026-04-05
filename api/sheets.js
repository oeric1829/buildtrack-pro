const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCSIoX7q_vgyaT4CD0eP4M3nYNjukh7BoMu4TIMvsDj_HpQNtJyaAyABdeHhrdHg8k/exec";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const action = req.query.action || (req.body && req.body.action) || 'getEntries';
    const body = req.method === 'POST' ? req.body : (req.query.payload ? JSON.parse(req.query.payload) : { action });

    // Build URL with all params as query string for GET requests to Apps Script
    const params = new URLSearchParams();
    params.set('action', body.action || action);
    if (body.id) params.set('id', String(body.id));
    if (body.entries) params.set('entries', JSON.stringify(body.entries));

    const url = SCRIPT_URL + '?' + params.toString();
    const response = await fetch(url);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({ raw: text });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
