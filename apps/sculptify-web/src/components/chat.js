/* Sculptify – AI Coach Chat Component */

const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function appendMessage(type, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function sendCoachMessage() {
  const input = document.getElementById('coach-input');
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  appendMessage('user', message);

  try {
    const data = await fetchJSON(`${API_BASE}/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context: 'sculptify' })
    });
    appendMessage('coach', data.reply);
  } catch {
    appendMessage('coach', 'Sorry, I am unable to respond right now. Try again shortly.');
  }
}

/**
 * Bind send button and Enter key, then display the welcome message.
 */
export function initChat() {
  const sendBtn = document.getElementById('coach-send');
  const input = document.getElementById('coach-input');
  if (!sendBtn || !input) return;

  sendBtn.addEventListener('click', sendCoachMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendCoachMessage();
  });

  appendMessage('coach', 'Welcome to Sculptify! Ask me anything about your wellness journey.');
}
