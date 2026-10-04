import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.log("Could not read user data");
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const fetchNotifications = async () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      const userId =
        loggedInUser._id || loggedInUser.id;

      if (!userId) {
        console.log("User ID not found");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/notifications/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.log("Unable to fetch notifications");
        return;
      }

      const data = await response.json();

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.log(
        "Error fetching notifications:",
        error
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.log("Unable to mark notification as read");
        return;
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.log(
        "Error marking notification as read:",
        error
      );
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setShowNotifications(false);

    switch (notification.type) {
      case "claim":
      case "approved":
      case "rejected":
      case "returned":
        navigate("/claims");
        break;

      case "match":
        navigate("/found");
        break;

      default:
        navigate("/notifications");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");

    setShowProfile(false);

    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="professional-navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/home">
          Find<span>Wise</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="navbar-links">
        <Link
          to="/home"
          className={
            isActive("/home")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Home
        </Link>

        <Link
          to="/lost"
          className={
            isActive("/lost")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Lost Items
        </Link>

        <Link
          to="/found"
          className={
            isActive("/found")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Found Items
        </Link>

        <Link
          to="/post"
          className={
            isActive("/post")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Post Item
        </Link>

        <Link
          to="/claims"
          className={
            isActive("/claims")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Claims
        </Link>
      </div>

      {/* Right Side */}
      <div className="navbar-actions">

        {/* Notifications */}
        <div
          className="notification-wrapper"
          ref={notificationRef}
        >
          <button
            className="notification-button"
            onClick={() => {
              setShowNotifications(
                !showNotifications
              );
              setShowProfile(false);
            }}
            aria-label="Notifications"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>

                {unreadCount > 0 && (
                  <span>
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <div className="empty-bell">
                      ♢
                    </div>

                    <p>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications
                    .slice(0, 5)
                    .map((notification) => (
                      <div
                        key={notification._id}
                        className={
                          notification.isRead
                            ? "notification-item"
                            : "notification-item unread"
                        }
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >
                        <div className="notification-dot">
                          {!notification.isRead && (
                            <span></span>
                          )}
                        </div>

                        <div className="notification-content">
                          <p>
                            {notification.message}
                          </p>

                          <small>
                            {notification.createdAt
                              ? new Date(
                                  notification.createdAt
                                ).toLocaleDateString()
                              : ""}
                          </small>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  className="view-all-notifications"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/notifications");
                  }}
                >
                  View all notifications
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div
          className="profile-wrapper"
          ref={profileRef}
        >
          <button
            className="profile-button"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            aria-label="Profile"
          >
            <span className="profile-icon">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </span>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-top">
                <div className="profile-large-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                    />

                    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                  </svg>
                </div>

                <div className="profile-details">
                  <h4>
                    {user?.name || "User"}
                  </h4>

                  <p>
                    {user?.email ||
                      "No email available"}
                  </p>
                </div>
              </div>

              <div className="profile-divider"></div>

              <button
                className="logout-option"
                onClick={handleLogout}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                </svg>

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;