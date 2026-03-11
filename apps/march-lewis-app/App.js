import React, { useState, useEffect } from 'react';
import { Header, DashboardPanel, Card, Button, Input, ChatBox, Footer } from '../../shared/components';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BRAND_COLOR = '#3b82f6';

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
    <div style={{ fontFamily: 'sans-serif', background: '#0a0a0a', color: '#f5f5f5', minHeight: '100vh' }}>
      <Header
        logo="March &amp; Lewis"
        color={BRAND_COLOR}
        status={health ? health.status : null}
      />

      <DashboardPanel title="Career Training Programs" style={{ paddingTop: '40px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {courses.map(c => (
            <Card
              key={c.id}
              title={c.title}
              body={`Duration: ${c.duration}`}
              color={BRAND_COLOR}
              style={{ minWidth: '200px' }}
            />
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel title="Apply for a Position" alt>
        <form
          onSubmit={submitApplication}
          style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <Input
            placeholder="Your Full Name"
            value={applyForm.name}
            onChange={e => setApplyForm(f => ({ ...f, name: e.target.value }))}
            required
            color={BRAND_COLOR}
          />
          <Input
            type="email"
            placeholder="Your Email"
            value={applyForm.email}
            onChange={e => setApplyForm(f => ({ ...f, email: e.target.value }))}
            required
            color={BRAND_COLOR}
          />
          <Input
            placeholder="Position You Are Applying For"
            value={applyForm.role}
            onChange={e => setApplyForm(f => ({ ...f, role: e.target.value }))}
            color={BRAND_COLOR}
          />
          <Button type="submit" variant="primary" color={BRAND_COLOR} style={{ width: '100%' }}>
            Submit Application
          </Button>
          {applyStatus && <p style={{ color: '#4ade80', fontSize: '0.9rem', textAlign: 'center' }}>{applyStatus}</p>}
        </form>
      </DashboardPanel>

      <DashboardPanel title="AI Career Coach">
        <ChatBox
          messages={messages}
          inputValue={coachInput}
          onInputChange={setCoachInput}
          onSend={sendMessage}
          placeholder="Ask about your career..."
          color={BRAND_COLOR}
        />
      </DashboardPanel>

      <Footer
        brand="March &amp; Lewis"
        color={BRAND_COLOR}
        links={[{ label: 'QSE Ecosystem', href: '/' }]}
      />
    </div>
  );
}

export default App;
