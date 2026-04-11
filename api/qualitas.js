// api/qualitas.js — Vercel Serverless Function
// Proxy seguro hacia el WS de Quálitas Colombia QA
// Sekiury Insure — v1.0

const https = require('https');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const QUALITAS_ENDPOINT =
    'https://serviciosqa.qualitascolombia.com.co/Emision_QA/api/Emision';

  const payload = {
    wsapiUsuario: 'wsapiEmisiones',
    wsapiPassword: 'ap13m1$ione$=',
    NoNegocio: '00003',
    Agente: '21492',
    ...req.body,
  };

  try {
    const response = await fetch(QUALITAS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(response.status).json({ ok: response.ok, status: response.status, data });
  } catch (error) {
    console.error('[Quálitas Proxy Error]', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
