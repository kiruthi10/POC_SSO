import React, { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/userinfo`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Checking SSO...</p>;

  return (
    <div>
      <h1>Child App 1</h1>
      {user ? <p>User: {user.name}</p> : <p>Please login via parent SSO</p>}
    </div>
  );
}

export default App;

