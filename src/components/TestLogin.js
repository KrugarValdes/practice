import React from "react";
import { useNavigate } from "react-router-dom";

const TestLogin = () => {
  const navigate = useNavigate();

  const handleTestLogin = async () => {
    const response = await fetch("http://localhost:5000/test-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", password: "password" }),
    });
    if (response.ok) {
      navigate("/dashboard");
    } else {
      alert("Test login failed");
    }
  };

  return <button onClick={handleTestLogin}>Test Login</button>;
};

export default TestLogin;
