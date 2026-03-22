"use client";

import { useState } from "react";
import { loginAction } from "../actions";
import styles from "../Home.module.css"; // Reuse minimal styles

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginAction(password);
    if (success) {
      window.location.href = "/admin";
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <h1 className={styles.name}>Backoffice Login</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter Admin Password"
          required
          style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid var(--border-color)" }}
        />
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
        <button type="submit" style={{ padding: "10px", fontSize: "16px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Login
        </button>
      </form>
    </div>
  );
}
