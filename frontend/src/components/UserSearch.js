import React, { useState } from 'react';
import portNow from './App'

const UserSearch = ({ token, onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const response = await fetch(`${portNow}/api/users?query=${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setResults(data);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users"
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        {results.map(user => (
          <div key={user.id} onClick={() => onSelectUser(user)}>
            {user.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
