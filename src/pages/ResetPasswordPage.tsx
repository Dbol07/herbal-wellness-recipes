import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ResetPasswordPage.css"; // make sure your CSS file exists

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically read access_token from URL hash
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const access_token = params.get("access_token");
      if (!access_token) {
        setMessage("Invalid or expired token.");
      } 
    }
  }, []);

  const handleReset = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  return (
    <div className="reset-page-wrapper">
      <div className="reset-card">
        <h1>Reset Your Password</h1>
        {message && <p className="message">{message}</p>}
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="reset-input"
        />
        <button onClick={handleReset} className="reset-button">
          Update Password
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
