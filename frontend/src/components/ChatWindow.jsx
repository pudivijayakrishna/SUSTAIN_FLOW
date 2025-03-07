import React, { useState, useEffect } from 'react';

const ChatWindow = ({ userToken }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const ws = React.useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000?token=${userToken}`);
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, `${data.user}: ${data.message}`]);
    };

    return () => ws.current.close();
  }, [userToken]);

  const sendMessage = () => {
    if (newMessage && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message here..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatWindow;
