const BUCKET_LABELS = {
  'preventer':      'The Preventer',
  'active-reducer': 'The Active Reducer',
  'skin-retracter': 'The Skin Retracter',
  'manager':        'The Manager',
  'evaluator':      'The Evaluator',
};

const Q1_LABELS = {
  a: 'Currently losing weight, wants to prevent loose skin',
  b: 'Has apron belly + still losing weight',
  c: 'Finished losing weight, skin hasn\'t caught up',
  d: 'Weight stable, significant loose skin',
  e: 'Evaluating surgery',
};

const Q2_LABELS = {
  a: 'Significant weight loss (50+ lbs)',
  b: 'One pregnancy',
  c: 'Multiple pregnancies',
  d: 'GLP-1 medication (Ozempic/Wegovy)',
  e: 'Combination of pregnancy + weight changes',
  f: 'Not sure',
};

const Q3_LABELS = {
  a: 'Slight softness — not visible through clothes',
  b: 'Hangs clearly — visible through fitted clothing',
  c: 'Hangs significantly — affects clothing choices daily',
  d: 'Significant + causes physical problems (chafing/hygiene)',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, bucket, q1, q2, q3, q4, q5, q6, q7, origin, timeline, age_range, tried } = req.body;

  if (!email || !bucket) {
    return res.status(400).json({ error: 'Missing email or bucket' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const resendKey   = process.env.RESEND_API_KEY;

  // Save to Supabase
  let totalResponses = null;
  if (supabaseUrl && supabaseKey) {
    try {
      const [insertRes, countRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/quiz_responses`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            name: name || null, email, bucket,
            q1: q1||null, q2: q2||null, q3: q3||null, q4: q4||null,
            q5: q5||null, q6: q6||null, q7: q7||null,
            modifier_origin:   origin    || null,
            modifier_timeline: timeline  || null,
            modifier_age:      age_range || null,
            modifier_tried:    tried     || null,
          }),
        }),
        fetch(`${supabaseUrl}/rest/v1/quiz_responses?select=id`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'count=exact',
            'Range': '0-0',
          },
        }),
      ]);

      if (!insertRes.ok) {
        console.error('Supabase insert error:', await insertRes.text());
      }

      const countHeader = countRes.headers.get('content-range');
      if (countHeader) {
        const match = countHeader.match(/\/(\d+)/);
        if (match) totalResponses = parseInt(match[1], 10) + 1;
      }
    } catch (err) {
      console.error('Supabase error:', err);
    }
  }

  // Send notification via Resend
  if (resendKey) {
    try {
      const bucketLabel = BUCKET_LABELS[bucket] || bucket;
      const countLine   = totalResponses ? `<p style="color:#7A9E7E;font-weight:600;">📊 Total responses so far: <strong>${totalResponses}</strong></p>` : '';

      const milestones = [10, 25, 50, 100, 250, 500];
      const isMilestone = milestones.includes(totalResponses);
      const subject = isMilestone
        ? `🎉 ${totalResponses} quiz responses — Apron Belly Guide`
        : `New quiz response: ${bucketLabel} — Apron Belly Guide`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Apron Belly Guide <onboarding@resend.dev>',
          to: ['ilevex.com.br@gmail.com'],
          subject,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#2D2A26;">
              <h2 style="margin:0 0 4px;font-size:18px;">New quiz response</h2>
              <p style="margin:0 0 20px;color:#6B6560;font-size:14px;">Apron Belly Guide</p>

              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:8px 0;color:#A09890;width:120px;">Name</td>
                    <td style="padding:8px 0;font-weight:500;">${name || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#A09890;">Email</td>
                    <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#7A9E7E;">${email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#A09890;">Bucket</td>
                    <td style="padding:8px 0;font-weight:700;color:#4F7A52;">${bucketLabel}</td></tr>
                <tr><td style="padding:8px 0;color:#A09890;vertical-align:top;">Situation (Q1)</td>
                    <td style="padding:8px 0;">${Q1_LABELS[q1] || q1 || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#A09890;vertical-align:top;">Origin (Q2)</td>
                    <td style="padding:8px 0;">${Q2_LABELS[q2] || q2 || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#A09890;vertical-align:top;">Severity (Q3)</td>
                    <td style="padding:8px 0;">${Q3_LABELS[q3] || q3 || '—'}</td></tr>
              </table>

              <hr style="border:none;border-top:1px solid #EBE7E0;margin:20px 0;" />
              ${countLine}
              <p style="font-size:12px;color:#C4BDB6;margin:0;">
                <a href="https://itvsucpjlqtglixltpmo.supabase.co" style="color:#C4BDB6;">View in Supabase →</a>
              </p>
            </div>
          `,
        }),
      });
    } catch (err) {
      console.error('Resend error:', err);
    }
  }

  return res.status(200).json({ ok: true });
}
