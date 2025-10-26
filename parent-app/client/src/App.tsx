import React, { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const isDev = process.env.NODE_ENV !== "production";

  // Check parent SSO session
  useEffect(() => {
    fetch(`${process.env.REACT_APP_PARENT_API}/api/userinfo`, {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Session expired");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => {
        window.location.href = `${process.env.REACT_APP_PARENT_API}/login`;
      });
  }, []);

  const launchChild = (childUrl?: string) => {
    if (!childUrl) return;

    // Append devToken in dev mode
    const url = isDev ? `${childUrl}?devToken=valid` : childUrl;
    setActiveChild(url);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏦 Parent App (Azure AD SSO)</h1>

      {user ? (
        <>
          <p>Welcome, <strong>{user.name}</strong></p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button onClick={() => launchChild(process.env.REACT_APP_CHILD_1)}>Launch Child 1</button>
            <button onClick={() => launchChild(process.env.REACT_APP_CHILD_2)}>Launch Child 2</button>
            <button onClick={() => launchChild(process.env.REACT_APP_CHILD_3)}>Launch Child 3</button>
          </div>

          {activeChild && (
            <iframe
              title="Child App"
              src={activeChild}
              width="800"
              height="600"
              style={{ border: "1px solid #ccc" }}
            />
          )}
        </>
      ) : (
        <p>Loading SSO session...</p>
      )}
    </div>
  );
}

export default App;
