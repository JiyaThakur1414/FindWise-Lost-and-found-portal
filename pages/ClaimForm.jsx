import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ClaimForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const item = location.state?.item;

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!item) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Item not found</h2>
        <button
          type="button"
          onClick={() => navigate("/found")}
        >
          Back to Found Items
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
      setError("Please login before claiming an item.");
      return;
    }

    if (message.trim() === "") {
      setError("Please explain why you believe this item belongs to you.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/claims",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item: item._id,
            claimedBy: user.id,
            message: message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to submit claim");
        setLoading(false);
        return;
      }

      setSuccess(
        "Your claim has been submitted successfully. An admin will review it."
      );

      setMessage("");

      setTimeout(() => {
        navigate("/found");
      }, 2000);
    } catch (error) {
      console.log(error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "550px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ color: "#222", marginBottom: "10px" }}>
          Claim This Item
        </h1>

        <p style={{ marginBottom: "25px" }}>
          Please provide some information to help verify that this item
          belongs to you.
        </p>

        <div
          style={{
            background: "#f5f5f5",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ color: "#222", marginBottom: "8px" }}>
            {item.name}
          </h2>

          <p>
            <strong>Category:</strong> {item.category}
          </p>

          <p>
            <strong>Found at:</strong> {item.location}
          </p>

          <p>
            <strong>Date:</strong> {item.date}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#222",
            }}
          >
            Why do you believe this is your item?
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe any details that can help prove ownership..."
            rows="6"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              resize: "vertical",
              fontSize: "15px",
              boxSizing: "border-box",
              marginBottom: "15px",
            }}
          />

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

          {success && (
            <p
              style={{
                color: "green",
                marginBottom: "15px",
              }}
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="details-btn"
          >
            {loading ? "Submitting..." : "Submit Claim"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/found")}
            style={{
              marginLeft: "10px",
              padding: "10px 18px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default ClaimForm;