import React, { useState, useEffect } from 'react';
import { Header, DashboardPanel, Card, ChatBox, Footer } from '../../shared/components';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BRAND_COLOR = '#a855f7';

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
    <div style={{ fontFamily: 'sans-serif', background: '#0a0a0a', color: '#f5f5f5', minHeight: '100vh' }}>
      <Header
        logo="Sculptify"
        color={BRAND_COLOR}
        status={health ? health.status : null}
      />

      <DashboardPanel title="Training Programs" style={{ paddingTop: '40px' }}>
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

      <DashboardPanel title="AI Wellness Coach">
        <ChatBox
          messages={messages}
          inputValue={coachInput}
          onInputChange={setCoachInput}
          onSend={sendMessage}
          placeholder="Ask your coach..."
          color={BRAND_COLOR}
        />
      </DashboardPanel>

      <Footer
        brand="Sculptify"
        color={BRAND_COLOR}
        links={[{ label: 'QSE Ecosystem', href: '/' }]}
      />
    </div>
  );
}

export default App;
