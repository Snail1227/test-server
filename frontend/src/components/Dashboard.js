import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import Conversations from './Conversations';
import Messages from './Messages';
import UserSearch from './UserSearch';
import portNow from './App'

const Dashboard = ({ token }) => {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${portNow}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUser(data);
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSelectUser = async (selectedUser) => {
    const response = await fetch(`${portNow}/api/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        participants: [user.id, selectedUser.id],
      }),
    });
    const newConversation = await response.json();
    setSelectedConversation(newConversation);
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>Dashboard</h3>
        </div>
        <ul className="sidebar-menu">
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#profile">Profile</a></li>
          <li><a href="#settings">Settings</a></li>
          <li><a href="#notifications">Notifications</a></li>
          <li><a href="#monitor">Monitor</a></li>
        </ul>
      </nav>
      <div className="content">
        <header className="header">
          {user && <span className="user-info">👤 {user.name}</span>}
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </header>
        <main>
          <div className="conversations-container">
            <Conversations userId={user ? user.id : null} token={token} onSelectConversation={handleSelectConversation} />
          </div>
          <div className="messages-container">
            {selectedConversation && (
              <Messages conversation={selectedConversation} token={token} />
            )}
          </div>
          <div className="user-search-container">
            <UserSearch token={token} onSelectUser={handleSelectUser} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
