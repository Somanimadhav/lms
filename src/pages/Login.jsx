import { useState } from "react";
import axios from "../axiosInstance";
import { useNavigate, Link } from "react-router-dom"; // 🟢 added Link
import { useAuth } from "../context/AuthContext";
import "../style/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { username, password });
      login(res.data.user);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("role", res.data.user.role);
      navigate(res.data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="login-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="login-input"
          />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>

       
        <div className="login-register-link">
          Don't have an account?{" "}
          <Link to="/register" className="register-link">
            Register here!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
