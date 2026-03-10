import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [health, setHealth] = useState(null);
  const [courses, setCourses] = useState([]);
  const [coachInput, setCoachInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'coach', text: 'Welcome to March & Lewis! Ask me anything about your career journey.' }
  ]);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', role: '' });
  const [applyStatus, setApplyStatus] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(() => {});

    fetch(`${API_BASE}/training/courses`)
      .then(r => r.json())
      .then(data => setCourses(data.filter(c => c.app === 'marchLewis' || c.app === 'general')))
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
        body: JSON.stringify({ message: userMsg, context: 'marchLewis' })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'coach', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { type: 'coach', text: 'Unable to respond right now. Please try again.' }]);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Job Application: ${applyForm.role || 'Open Position'}`,
          description: `Application from ${applyForm.name}`,
          app: 'marchLewis'
        })
      });
      setApplyStatus('Application submitted! We will be in touch within 2 business days.');
      setApplyForm({ name: '', email: '', role: '' });
    } catch {
      setApplyStatus('Could not submit. Please try again.');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#0a0a0a', color: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <header style={{ borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '32px' }}>
        <h1 style={{ color: '#3b82f6' }}>March &amp; Lewis</h1>
        <p style={{ color: '#888' }}>Career Staffing &amp; Workforce Platform</p>
        {health && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>● {health.status}</span>}
      </header>

      <section style={{ marginBottom: '40px' }}>
        <h2>Career Training Programs</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
          {courses.map(c => (
            <div key={c.id} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '20px', minWidth: '200px' }}>
              <h3 style={{ marginBottom: '8px' }}>{c.title}</h3>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>Duration: {c.duration}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Apply for a Position</h2>
        <form onSubmit={submitApplication} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <input
            placeholder="Your Full Name"
            value={applyForm.name}
            onChange={e => setApplyForm(f => ({ ...f, name: e.target.value }))}
            required
            style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '10px', color: '#f5f5f5' }}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={applyForm.email}
            onChange={e => setApplyForm(f => ({ ...f, email: e.target.value }))}
            required
            style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '10px', color: '#f5f5f5' }}
          />
          <input
            placeholder="Position You Are Applying For"
            value={applyForm.role}
            onChange={e => setApplyForm(f => ({ ...f, role: e.target.value }))}
            style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '10px', color: '#f5f5f5' }}
          />
          <button type="submit" style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Submit Application
          </button>
          {applyStatus && <p style={{ color: '#4ade80', fontSize: '0.9rem' }}>{applyStatus}</p>}
        </form>
      </section>

      <section>
        <h2>AI Career Coach</h2>
        <div style={{ maxWidth: '500px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', marginTop: '16px' }}>
          <div style={{ height: '200px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                borderRadius: '6px',
                maxWidth: '80%',
                alignSelf: m.type === 'user' ? 'flex-end' : 'flex-start',
                background: m.type === 'user' ? '#3b82f6' : '#2a2a2a'
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
              placeholder="Ask about your career..."
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#f5f5f5', outline: 'none' }}
            />
            <button
              onClick={sendMessage}
              style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '12px 20px', cursor: 'pointer' }}
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
