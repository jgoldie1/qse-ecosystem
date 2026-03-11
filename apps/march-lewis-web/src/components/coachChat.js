/**
 * coachChat – AI career coach chat component
 */

function appendMessage(type, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

export function initCoachChat(apiBase) {
  const sendBtn = document.getElementById('coach-send');
  const input = document.getElementById('coach-input');
  if (!sendBtn || !input) return;

  async function send() {
    const message = input.value.trim();
    if (!message) return;
    input.value = '';
    appendMessage('user', message);

    try {
      const res = await fetch(`${apiBase}/ai/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: 'marchLewis' })
      });
      const data = await res.json();
      appendMessage('coach', data.reply);
    } catch {
      appendMessage('coach', 'Sorry, I am unable to respond right now. Try again shortly.');
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  appendMessage('coach', 'Welcome to March & Lewis! Ask me anything about your career journey.');
}
