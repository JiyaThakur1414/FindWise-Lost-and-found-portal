import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      // Save login information
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data.user));

      // Go to Home
      navigate("/home");

    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <div className="login-left">

        <div className="login-brand">
          Find<span>Wise</span>
        </div>

        <div className="login-message">

          <p className="login-small-title">
            COLLEGE LOST & FOUND
          </p>

          <h1>
            Lost something?
            <br />
            <span>Let's find it.</span>
          </h1>

          <p>
            Find, report, and reconnect with your
            belongings across campus — all in one place.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <div className="feature-icon">🔍</div>

              <div>
                <h3>Find items faster</h3>
                <p>
                  Search reported lost and found items.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-icon">🤖</div>

              <div>
                <h3>AI-powered matching</h3>
                <p>
                  Get intelligent suggestions for
                  possible matches.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-icon">🔒</div>

              <div>
                <h3>Campus community</h3>
                <p>
                  Connect safely with students and faculty.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">

        <div className="login-card">

          <div className="mobile-logo">
            Find<span>Wise</span>
          </div>

          <h2>Welcome back</h2>

          <p className="login-subtitle">
            Login to continue to your account
          </p>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="form-group">

              <label>Email</label>

              <div className="input-wrapper">

                <span>✉</span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="form-group">

              <label>Password</label>

              <div className="input-wrapper">

                <span>🔒</span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

              </div>

            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <p
                style={{
                  color: "red",
                  marginBottom: "15px",
                }}
              >
                {error}
              </p>
            )}

            {/* LOGIN OPTIONS */}
            <div className="login-options">

              <label className="remember">

                <input type="checkbox" />

                <span>Remember me</span>

              </label>

              <a href="#">
                Forgot password?
              </a>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-btn"
            >
              Login
              <span>→</span>
            </button>

          </form>

          {/* REGISTER LINK */}
          <p className="register-text">

            Don't have an account?{" "}

            <Link to="/register">
              Create an account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;