// ============================================================
//  Vercel Serverless Function — /api/ai-suggest.js
//  Olaoluwa Age Group Blog · AI Content Assistant
//
//  Deploy this file inside an /api folder at your Vercel project root.
//  Add your NVIDIA key in Vercel → Project → Settings → Environment Variables:
//    Name:  NVIDIA_API_KEY
//    Value: nvapi-xxxxxxxxxx   (your NVIDIA NIM API key)
// ============================================================

export default async function handler(req, res) {

  // ── Only allow POST ──────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, tone, generateType } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  // ── Map tone to human description ───────────────────────
  const toneMap = {
    formal:       'formal and professional',
    friendly:     'warm, friendly and conversational',
    celebratory:  'celebratory, energetic and community-proud',
  };
  const toneDesc = toneMap[tone] || 'warm and friendly';

  // ── Build the prompt based on what to generate ──────────
  let prompt = '';

  if (generateType === 'all') {
    prompt = `You are an experienced community journalist writing for the Olaoluwa Age Group — a respected Yoruba civic/age-grade community organisation based in Iwaro-Oka, Akoko, Ondo State, Nigeria. 
The organisation runs events like Medical Outreach, Spelling Bee, Street Games, and cultural celebrations. Write in ${toneDesc} Nigerian English.

Topic / Event to cover: ${topic}

Respond ONLY with a valid JSON object — no markdown, no backticks, no preamble:
{
  "title": "A compelling, specific news headline (max 12 words)",
  "excerpt": "A 2-3 sentence engaging summary for the blog listing page (max 65 words)",
  "content": "A full, well-structured 350-500 word news article using HTML tags: <h2> for sub-sections, <p> for paragraphs, <ul><li> for lists where appropriate. Include an opening hook, event details, community impact, and a closing remark."
}`;

  } else if (generateType === 'titles') {
    prompt = `You are a community journalist writing for the Olaoluwa Age Group — a Yoruba civic organisation in Iwaro-Oka, Akoko, Ondo State, Nigeria.

Topic: ${topic}
Tone: ${toneDesc}

Generate 3 different compelling headline options. Respond ONLY with valid JSON:
{
  "titles": ["Headline Option 1", "Headline Option 2", "Headline Option 3"]
}`;

  } else if (generateType === 'excerpt') {
    prompt = `You are a community journalist writing for the Olaoluwa Age Group — a Yoruba civic organisation in Iwaro-Oka, Akoko, Ondo State, Nigeria.

Topic: ${topic}
Tone: ${toneDesc}

Write an engaging 2-3 sentence blog listing excerpt (max 65 words). Respond ONLY with valid JSON:
{
  "excerpt": "Your excerpt here."
}`;

  } else if (generateType === 'content') {
    prompt = `You are a community journalist writing for the Olaoluwa Age Group — a Yoruba civic organisation in Iwaro-Oka, Akoko, Ondo State, Nigeria.

Topic: ${topic}
Tone: ${toneDesc}

Write a full 350-500 word news article using HTML formatting:
- <h2> for sub-headings
- <p> for paragraphs  
- <ul><li> for lists where appropriate
Include: opening hook, event details, community impact, closing statement.
Respond ONLY with valid JSON:
{
  "content": "<p>Your full HTML article here...</p>"
}`;
  }

  // ── Call NVIDIA NIM API (Manus model via NVIDIA) ─────────
  try {
    const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.NVIDIA_API_KEY,  // ← hidden server-side
      },
      body: JSON.stringify({
        model:      'nvidia/llama-3.1-nemotron-ultra-253b-v1',
        max_tokens: 1500,
        temperature: 0.7,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!nvidiaRes.ok) {
      const errText = await nvidiaRes.text();
      console.error('NVIDIA API Error:', errText);
      return res.status(502).json({ error: 'AI service error. Try again.' });
    }

    const nvidiaData = await nvidiaRes.json();
    const rawText    = nvidiaData.choices?.[0]?.message?.content || '';

    // Strip any accidental markdown fences and parse JSON
    const cleaned = rawText.replace(/```json|```/gi, '').trim();
    const parsed  = JSON.parse(cleaned);

    return res.status(200).json({ success: true, result: parsed });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      error: err.message.includes('JSON')
        ? 'AI returned unexpected format. Try again.'
        : 'Server error. Try again.',
    });
  }
}
