import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [health, setHealth] = useState(null);
  const [courses, setCourses] = useState([]);
  const [coachInput, setCoachInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'coach', text: 'Welcome to Sculptify! Ask me anything about your wellness journey.' }
  ]);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(() => {});

    fetch(`${API_BASE}/training/courses`)
      .then(r => r.json())
      .then(data => setCourses(data.filter(c => c.app === 'sculptify' || c.app === 'general')))
      .catch(() => {});
  }, []);

  const sendMessage = async () => {
    if (!coachInput.trim()) return;
    const userMsg = coachInput.trim();
    setCoachInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);

    try {
      const res = await fetch(`${API_BASE}/ai/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: 'sculptify' })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'coach', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { type: 'coach', text: 'Unable to respond right now. Please try again.' }]);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#0a0a0a', color: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <header style={{ borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '32px' }}>
        <h1 style={{ color: '#a855f7' }}>Sculptify</h1>
        <p style={{ color: '#888' }}>Beauty, Wellness &amp; Training Platform</p>
        {health && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>● {health.status}</span>}
      </header>

      <section style={{ marginBottom: '40px' }}>
        <h2>Training Programs</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
          {courses.map(c => (
            <div key={c.id} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '20px', minWidth: '200px' }}>
              <h3 style={{ marginBottom: '8px' }}>{c.title}</h3>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>Duration: {c.duration}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>AI Wellness Coach</h2>
        <div style={{ maxWidth: '500px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', marginTop: '16px' }}>
          <div style={{ height: '200px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                borderRadius: '6px',
                maxWidth: '80%',
                alignSelf: m.type === 'user' ? 'flex-end' : 'flex-start',
                background: m.type === 'user' ? '#a855f7' : '#2a2a2a'
              }}>
                {m.text}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #333' }}>
            <input
              value={coachInput}
              onChange={e => setCoachInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask your coach..."
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#f5f5f5', outline: 'none' }}
            />
            <button
              onClick={sendMessage}
              style={{ background: '#a855f7', border: 'none', color: '#fff', padding: '12px 20px', cursor: 'pointer' }}
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
