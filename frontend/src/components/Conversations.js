import React, { useState, useEffect } from 'react';
import portNow from './App'

const Conversations = ({ userId, token, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;
      const response = await fetch(`${portNow}/api/users/${userId}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setConversations(data);
    };

    fetchConversations();
  }, [userId, token]);

  return (
    <div>
      <h3>Conversations</h3>
      {conversations.map((conv, index) => (
        <div key={index} onClick={() => onSelectConversation(conv)}>
          <p>Conversation with: {conv.participants.map(p => p.name).join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default Conversations;
