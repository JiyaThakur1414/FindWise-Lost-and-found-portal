import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Temporary frontend login
    localStorage.setItem("isLoggedIn", "true");

    navigate("/home");
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
            Welcome back
          </h2>

          <p className="login-subtitle">
            Login to continue to your account
          </p>


          <form onSubmit={handleLogin}>

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
                  placeholder="Enter your password"
                  required
                />

              </div>

            </div>


            <div className="login-options">

              <label className="remember">

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

              <a href="#">
                Forgot password?
              </a>

            </div>


            <button
              type="submit"
              className="login-btn"
            >
              Login
              <span>→</span>
            </button>

          </form>


          <p className="register-text">

            Don't have an account?

            <a href="/register">
              Create an account
            </a>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;