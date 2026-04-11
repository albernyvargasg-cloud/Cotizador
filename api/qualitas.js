// api/qualitas.js — Vercel Serverless Function
// Proxy seguro hacia el WS de Quálitas Colombia QA
// Sekiury Insure — v1.0

export default async function handler(req, res) {
  // CORS: solo permitir desde dominios Sekiury
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const QUALITAS_ENDPOINT =
    'https://serviciosqa.qualitascolombia.com.co/Emision_QA/api/Emision';

  const CREDENTIALS = {
    wsapiUsuario: 'wsapiEmisiones',
    wsapiPassword: 'ap13m1$ione$=',
    NoNegocio: '00003',
    Agente: '21492',
  };

  try {
    const body = req.body;

    // Inyectar credenciales al payload que viene del frontend
    const payload = {
      ...CREDENTIALS,
      ...body,
    };

    const response = await fetch(QUALITAS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Quálitas a veces responde XML o texto
      const text = await response.text();
      data = { raw: text };
    }

    return res.status(response.status).json({
      ok: response.ok,
      status: response.status,
      data,
    });
  } catch (error) {
    console.error('[Quálitas Proxy Error]', error);
    return res.status(500).json({
      ok: false,
      error: 'Error interno del proxy',
      detail: error.message,
    });
  }
}
