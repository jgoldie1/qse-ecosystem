const fs = require('fs');
const path = require('path');
const localCoach = require('./ai-coach');

const knowledgePath = path.join(__dirname, '..', 'data', 'sculptify-knowledge.json');

function readKnowledge() {
  try { return JSON.parse(fs.readFileSync(knowledgePath, 'utf8')); }
  catch { return {}; }
}

function systemPrompt() {
  const k = readKnowledge();
  return [
    'You are HoloGPT, the SculptifyLTD concierge. You are always presented to users as "HoloGPT — Powered by Stubbs AI".',
    'Stubbs AI is the permanent platform/brand. Never expose or emphasize the underlying model provider unless an admin explicitly asks.',
    'Use the business knowledge below as the source of truth. Do not invent prices, credentials, schedules, medical claims, or policies.',
    'For urgent or diagnostic medical questions, direct the user to an appropriate licensed professional or emergency services.',
    'Help with services, booking, certification, staffing, products, FAQs and business policies.',
    JSON.stringify(k)
  ].join('\n');
}

async function gemini(message) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY missing');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key), {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt() }] },
      contents: [{ role: 'user', parts: [{ text: message }] }]
    })
  });
  if (!res.ok) throw new Error('Gemini ' + res.status);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
}

async function openai(message) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY missing');
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
  const res = await fetch('https://api.openai.com/v1/responses', {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer ' + key},
    body:JSON.stringify({model, instructions:systemPrompt(), input:message})
  });
  if (!res.ok) throw new Error('OpenAI ' + res.status);
  const data = await res.json();
  return data.output_text || data.output?.flatMap(x => x.content || []).map(x => x.text || '').join('') || '';
}

async function anthropic(message) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY missing');
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({model,max_tokens:700,system:systemPrompt(),messages:[{role:'user',content:message}]})
  });
  if (!res.ok) throw new Error('Anthropic ' + res.status);
  const data = await res.json();
  return data.content?.map(x => x.text || '').join('') || '';
}

const providers = { gemini, openai, anthropic };

async function respond({ userId, message, context }) {
  const order = (process.env.STUBBS_AI_PROVIDER_ORDER || 'gemini,openai,anthropic,local')
    .split(',').map(x => x.trim().toLowerCase()).filter(Boolean);

  for (const provider of order) {
    try {
      if (provider === 'local') {
        const result = localCoach.respond({userId, message, context});
        return {...result, assistant:'HoloGPT', poweredBy:'Stubbs AI', provider:'local'};
      }
      if (!providers[provider]) continue;
      const reply = await providers[provider](message);
      if (reply) return {
        userId:userId || 'anonymous',
        context:context || 'sculptify-hologpt',
        message,
        reply,
        assistant:'HoloGPT',
        poweredBy:'Stubbs AI',
        provider,
        timestamp:new Date().toISOString()
      };
    } catch (error) {
      console.warn('[Stubbs AI] provider failed:', provider, error.message);
    }
  }
  return {...localCoach.respond({userId,message,context}), assistant:'HoloGPT', poweredBy:'Stubbs AI', provider:'local'};
}

module.exports = { respond };
