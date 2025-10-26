import React, { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const devToken = urlParams.get("devToken");

    fetch(`${process.env.REACT_APP_API_URL}/api/userinfo?devToken=valid&_=${Date.now()}`, {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Checking SSO...</p>;

  return (
    <div>
      <h1>Child App</h1>
      {user ? <p>User: {user.name}</p> : <p>Please login via parent SSO</p>}
    </div>
  );
}

export default App;
