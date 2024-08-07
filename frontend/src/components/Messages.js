import React, { useState, useEffect } from 'react';
import portNow from './App'

const Messages = ({ conversation, token }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`${portNow}/api/conversations/${conversation.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMessages(data);
    };

    fetchMessages();
  }, [conversation, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const response = await fetch(`${portNow}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: newMessage,
        receiverId: conversation.participants.find(p => p.id !== conversation.userId).id,
        conversationId: conversation.id,
      }),
    });
    const data = await response.json();
    setMessages([...messages, data]);
    setNewMessage('');
  };

  return (
    <div>
      <h3>Messages</h3>
      <div>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.sender.name}:</strong> {msg.content}</p>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Messages;
