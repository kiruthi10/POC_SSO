import React, { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_PARENT_API}/api/userinfo`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Session expired");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        window.location.href = `${process.env.REACT_APP_PARENT_API}/login`;
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏦 Parent App (Azure AD SSO)</h1>

      {user ? (
        <>
          <p>
            Welcome, <strong>{user.name || user.email}</strong>
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <iframe
              title="Child App 1"
              src={process.env.REACT_APP_CHILD_1}
              width="400"
              height="300"
            />
            <iframe
              title="Child App 2"
              src={process.env.REACT_APP_CHILD_2}
              width="400"
              height="300"
            />
            <iframe
              title="Child App 3"
              src={process.env.REACT_APP_CHILD_3}
              width="400"
              height="300"
            />
          </div>
        </>
      ) : (
        <p>Loading SSO session...</p>
      )}
    </div>
  );
}

export default App;
