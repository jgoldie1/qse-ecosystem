import React, { useRef, useEffect } from 'react';
import Button from './Button';
import Input from './Input';

/**
 * ChatBox - AI coach chat panel with a scrollable message list and input bar.
 *
 * Props:
 *   messages      - array of { type: 'user' | 'coach', text: string }
 *   inputValue    - controlled input value
 *   onInputChange - (value: string) => void
 *   onSend        - () => void  called when Send is clicked or Enter pressed
 *   placeholder   - input placeholder text (default: 'Ask your coach...')
 *   color         - accent color for user messages and Send button (default: '#a855f7')
 *   style         - additional inline styles for the outer wrapper
 */
function ChatBox({
  messages = [],
  inputValue = '',
  onInputChange,
  onSend,
  placeholder = 'Ask your coach...',
  color = '#a855f7',
  style = {},
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSend && onSend();
  };

  return (
    <div
      style={{
        maxWidth: '500px',
        background: '#1e1e1e',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        overflow: 'hidden',
        marginTop: '16px',
        ...style,
      }}
    >
      <div
        style={{
          height: '200px',
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {messages.map((m, i) => (
          <div
            key={m.id != null ? m.id : i}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              maxWidth: '80%',
              fontSize: '0.9rem',
              alignSelf: m.type === 'user' ? 'flex-end' : 'flex-start',
              background: m.type === 'user' ? color : '#2a2a2a',
              color: '#f5f5f5',
            }}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', borderTop: '1px solid #2a2a2a' }}>
        <Input
          value={inputValue}
          onChange={(e) => onInputChange && onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          color={color}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            padding: '12px',
            flex: 1,
          }}
        />
        <Button
          variant="primary"
          color={color}
          onClick={onSend}
          style={{ borderRadius: 0, padding: '12px 20px' }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default ChatBox;
