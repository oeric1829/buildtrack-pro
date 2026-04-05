export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCSIoX7q_vgyaT4CD0eP4M3nYNjukh7BoMu4TIMvsDj_HpQNtJyaAyABdeHhrdHg8k/exec";

  try {
    let url = SCRIPT_URL;
    let options = { method: 'GET' };

    if (req.method === 'POST') {
      const body = req.body;
      const params = new URLSearchParams();
      params.append('action', body.action);
      params.append('payload', JSON.stringify(body));
      url = SCRIPT_URL + '?' + params.toString();
    } else {
      const action = req.query.action || 'getEntries';
      url = SCRIPT_URL + '?action=' + action;
    }

    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
