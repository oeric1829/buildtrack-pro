export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzj_dafanlGhupCz3ULkku431jqkDmqZa6RLt5lOpxh46FPfKARrlw942YZluz3jWv4/exec";

  try {
    let url = SCRIPT_URL;
    if (req.method === 'POST') {
      const body = req.body;
      const params = new URLSearchParams();
      params.append('action', body.action);
      params.append('payload', JSON.stringify(body));
      url = SCRIPT_URL + '?' + params.toString();
    } else {
      url = SCRIPT_URL + '?action=' + (req.query.action || 'getEntries');
    }
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
