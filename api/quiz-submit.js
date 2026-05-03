export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, bucket, q1, q2, q3, q4, q5, q6, q7, origin, timeline, age_range, tried } = req.body;

  if (!email || !bucket) {
    return res.status(400).json({ error: 'Missing email or bucket' });
  }

  const url  = process.env.SUPABASE_URL;
  const key  = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: 'Supabase env vars not configured' });
  }

  try {
    const r = await fetch(`${url}/rest/v1/quiz_responses`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        name: name || null,
        email,
        bucket,
        q1: q1 || null, q2: q2 || null, q3: q3 || null, q4: q4 || null,
        q5: q5 || null, q6: q6 || null, q7: q7 || null,
        modifier_origin:   origin    || null,
        modifier_timeline: timeline  || null,
        modifier_age:      age_range || null,
        modifier_tried:    tried     || null,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Supabase error:', r.status, detail);
      return res.status(500).json({ error: 'Supabase insert failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('quiz-submit error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
