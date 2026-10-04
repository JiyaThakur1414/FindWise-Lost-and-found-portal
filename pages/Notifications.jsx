import { useEffect, useState } from "react";
import {
  useNavigate,
} from "react-router-dom";


function Notifications() {

  const navigate = useNavigate();


  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================
  // GET NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {

    const user =
      JSON.parse(
        localStorage.getItem("user")
      );


    if (!user || !user.id) {

      setError(
        "Please login to view notifications."
      );

      setLoading(false);

      return;
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/notifications/${user.id}`
      );

      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message ||
          "Unable to load notifications."
        );

        return;
      }


      setNotifications(data);

    } catch (error) {

      console.log(error);

      setError(
        "Unable to connect to server."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD
  // ==========================================

  useEffect(() => {

    fetchNotifications();

  }, []);


  // ==========================================
  // MARK AS READ
  // ==========================================

  const markAsRead = async (
    notificationId
  ) => {

    try {

      await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );


      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification._id ===
              notificationId
                ? {
                    ...notification,
                    isRead: true,
                  }
                : notification
          )
      );

    } catch (error) {

      console.log(
        "Mark as read error:",
        error
      );

    }

  };


  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const markAllAsRead = async () => {

    const user =
      JSON.parse(
        localStorage.getItem("user")
      );


    if (!user || !user.id) {
      return;
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/notifications/${user.id}/read-all`,
        {
          method: "PUT",
        }
      );


      if (response.ok) {

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );

      }

    } catch (error) {

      console.log(
        "Mark all as read error:",
        error
      );

    }

  };


  // ==========================================
  // NOTIFICATION CLICK
  // ==========================================

  const handleNotificationClick = async (
    notification
  ) => {

    // Mark as read

    if (!notification.isRead) {

      await markAsRead(
        notification._id
      );

    }


    // ========================================
    // RELATED ITEM
    // ========================================

    let relatedItemId = null;

    if (notification.relatedItem) {

      if (
        typeof notification.relatedItem ===
        "string"
      ) {

        relatedItemId =
          notification.relatedItem;

      } else {

        relatedItemId =
          notification.relatedItem._id;

      }

    }


    // ========================================
    // RELATED CLAIM
    // ========================================

    let relatedClaimId = null;

    if (notification.relatedClaim) {

      if (
        typeof notification.relatedClaim ===
        "string"
      ) {

        relatedClaimId =
          notification.relatedClaim;

      } else {

        relatedClaimId =
          notification.relatedClaim._id;

      }

    }


    // ========================================
    // NAVIGATION
    // ========================================

    switch (notification.type) {

      // --------------------------------------
      // MATCH
      // --------------------------------------

      case "match":

        navigate("/found", {
          state: {
            openItemId:
              relatedItemId,
          },
        });

        break;


      // --------------------------------------
      // CLAIM
      // --------------------------------------

      case "claim":

        navigate("/claims", {
          state: {
            openClaimId:
              relatedClaimId,
          },
        });

        break;


      // --------------------------------------
      // APPROVED
      // --------------------------------------

      case "approved":

        navigate("/claims", {
          state: {
            openClaimId:
              relatedClaimId,
          },
        });

        break;


      // --------------------------------------
      // REJECTED
      // --------------------------------------

      case "rejected":

        navigate("/claims", {
          state: {
            openClaimId:
              relatedClaimId,
          },
        });

        break;


      // --------------------------------------
      // RETURNED
      // --------------------------------------

      case "returned":

        navigate("/claims", {
          state: {
            openClaimId:
              relatedClaimId,
            openItemId:
              relatedItemId,
          },
        });

        break;


      default:
        break;

    }

  };


  // ==========================================
  // ICON
  // ==========================================

  const getNotificationIcon = (
    type
  ) => {

    switch (type) {

      case "claim":
        return "👤";

      case "approved":
        return "✓";

      case "rejected":
        return "×";

      case "returned":
        return "↩";

      case "match":
        return "🔎";

      default:
        return "🔔";

    }

  };


  // ==========================================
  // LABEL
  // ==========================================

  const getNotificationLabel = (
    type
  ) => {

    switch (type) {

      case "claim":
        return "New Claim";

      case "approved":
        return "Claim Approved";

      case "rejected":
        return "Claim Update";

      case "returned":
        return "Item Returned";

      case "match":
        return "Potential Match";

      default:
        return "Notification";

    }

  };


  // ==========================================
  // TIME
  // ==========================================

  const formatTime = (date) => {

    if (!date) return "";


    const notificationDate =
      new Date(date);

    const now = new Date();


    const difference =
      now - notificationDate;


    const minutes =
      Math.floor(
        difference / 60000
      );


    if (minutes < 1) {
      return "Just now";
    }


    if (minutes < 60) {
      return `${minutes} min ago`;
    }


    const hours =
      Math.floor(
        minutes / 60
      );


    if (hours < 24) {
      return `${hours} hr ago`;
    }


    const days =
      Math.floor(
        hours / 24
      );


    if (days < 7) {
      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;
    }


    return notificationDate.toLocaleDateString();

  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >

        <h2>
          Loading notifications...
        </h2>

        <p>
          Please wait while we load
          your notifications.
        </p>

      </div>
    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >

        <h2>
          Something went wrong
        </h2>

        <p>
          {error}
        </p>

      </div>
    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "50px 20px",
      }}
    >

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px",
        }}
      >

        <div>

          <p
            className="small-title"
          >
            NOTIFICATIONS
          </p>

          <h1
            style={{
              color: "black",
              marginBottom: "8px",
            }}
          >
            Your notifications
          </h1>

          <p>
            Stay updated about matches,
            claims, and returned items.
          </p>

        </div>


        {/* MARK ALL */}

        {notifications.some(
          (notification) =>
            !notification.isRead
        ) && (

          <button
            type="button"
            onClick={markAllAsRead}
            style={{
              padding:
                "10px 16px",
              border: "none",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              background:
                "#222",
              color:
                "white",
            }}
          >
            Mark all as read
          </button>

        )}

      </div>


      {/* ================================= */}
      {/* SUMMARY */}
      {/* ================================= */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "25px",
        }}
      >

        <div
          style={{
            padding: "15px 20px",
            background: "#f5f5f5",
            borderRadius: "10px",
          }}
        >

          <strong>
            {notifications.length}
          </strong>

          <span
            style={{
              marginLeft: "6px",
            }}
          >
            Total
          </span>

        </div>


        <div
          style={{
            padding: "15px 20px",
            background: "#f5f5f5",
            borderRadius: "10px",
          }}
        >

          <strong>
            {
              notifications.filter(
                (notification) =>
                  !notification.isRead
              ).length
            }
          </strong>

          <span
            style={{
              marginLeft: "6px",
            }}
          >
            Unread
          </span>

        </div>

      </div>


      {/* ================================= */}
      {/* EMPTY */}
      {/* ================================= */}

      {notifications.length === 0 ? (

        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#f8f8f8",
            borderRadius: "12px",
          }}
        >

          <div
            style={{
              fontSize: "40px",
              marginBottom: "15px",
            }}
          >
            🔔
          </div>

          <h2>
            No notifications yet
          </h2>

          <p>
            You will see updates here when
            someone claims an item or when
            a potential match is found.
          </p>

        </div>

      ) : (

        <div>

          {notifications.map(
            (notification) => (

              <div
                key={
                  notification._id
                }
                onClick={() =>
                  handleNotificationClick(
                    notification
                  )
                }
                style={{
                  display: "flex",
                  gap: "15px",
                  padding: "20px",
                  marginBottom: "12px",
                  background:
                    notification.isRead
                      ? "white"
                      : "#f7f9fc",
                  border:
                    "1px solid #e5e5e5",
                  borderRadius:
                    "12px",
                  cursor:
                    "pointer",
                  boxShadow:
                    notification.isRead
                      ? "none"
                      : "0 3px 10px rgba(0,0,0,0.05)",
                }}
              >

                {/* ICON */}

                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius:
                      "50%",
                    background:
                      "#f1f1f1",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontSize:
                      "20px",
                    flexShrink: 0,
                  }}
                >
                  {getNotificationIcon(
                    notification.type
                  )}
                </div>


                {/* CONTENT */}

                <div
                  style={{
                    flex: 1,
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "10px",
                    }}
                  >

                    <strong
                      style={{
                        color: "#222",
                      }}
                    >
                      {getNotificationLabel(
                        notification.type
                      )}
                    </strong>


                    {!notification.isRead && (
                      <span
                        style={{
                          fontSize:
                            "11px",
                          background:
                            "#222",
                          color:
                            "white",
                          padding:
                            "4px 8px",
                          borderRadius:
                            "20px",
                        }}
                      >
                        NEW
                      </span>
                    )}

                  </div>


                  <p
                    style={{
                      margin:
                        "8px 0",
                      color:
                        "#444",
                    }}
                  >
                    {
                      notification.message
                    }
                  </p>


                  <span
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#888",
                    }}
                  >
                    {formatTime(
                      notification.createdAt
                    )}
                  </span>

                </div>


                {/* ARROW */}

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    color:
                      "#888",
                    fontSize:
                      "20px",
                  }}
                >
                  →
                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );
}


export default Notifications;