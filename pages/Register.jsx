import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">

        <div className="login-brand">
          Find<span>Wise</span>
        </div>

        <div className="login-message">

          <p className="login-small-title">
            COLLEGE LOST & FOUND
          </p>

          <h1>
            Join FindWise.
            <br />
            <span>Find what matters.</span>
          </h1>

          <p>
            Create your account and start reporting,
            searching, and reconnecting lost belongings
            across campus.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <div className="feature-icon">
                🔍
              </div>

              <div>
                <h3>
                  Find items faster
                </h3>

                <p>
                  Search reported lost and found items.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-icon">
                🤖
              </div>

              <div>
                <h3>
                  AI-powered matching
                </h3>

                <p>
                  Get intelligent suggestions for
                  possible matches.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-icon">
                🔒
              </div>

              <div>
                <h3>
                  Campus community
                </h3>

                <p>
                  Connect safely with students and faculty.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      <div className="login-right">

        <div className="login-card">

          <div className="mobile-logo">
            Find<span>Wise</span>
          </div>

          <h2>
            Create account
          </h2>

          <p className="login-subtitle">
            Register to get started with FindWise
          </p>

          <form onSubmit={handleRegister}>

            <div className="form-group">

              <label>
                Full Name
              </label>

              <div className="input-wrapper">

                <span>
                  👤
                </span>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

              </div>

            </div>

            <div className="form-group">

              <label>
                Email
              </label>

              <div className="input-wrapper">

                <span>
                  ✉
                </span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>

            </div>

            <div className="form-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <span>
                  🔒
                </span>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

              </div>

            </div>

            {error && (
              <p style={{ color: "red", marginBottom: "15px" }}>
                {error}
              </p>
            )}

            {message && (
              <p style={{ color: "green", marginBottom: "15px" }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              className="login-btn"
            >
              Create Account
              <span>→</span>
            </button>

          </form>

          <p className="register-text">

            Already have an account?

            <a href="/">
              Login
            </a>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;