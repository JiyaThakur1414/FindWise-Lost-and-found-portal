import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function LostItems() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";

  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/items"
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Unable to load items"
          );
          return;
        }

        // Only show lost items that have NOT been returned
        const lost = data.filter(
          (item) =>
            item.type === "lost" &&
            item.status !== "Returned"
        );

        setLostItems(lost);
      } catch (error) {
        console.log(error);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchLostItems();
  }, []);

  // ===============================
  // SEARCH AND FILTER
  // ===============================

  const filteredItems = lostItems.filter((item) => {
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      item.location.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search);

    const matchesCategory =
      category === "" ||
      item.category === category;

    const matchesLocation =
      location === "" ||
      item.location
        .toLowerCase()
        .includes(location.toLowerCase());

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation
    );
  });

  const handleSearch = (e) => {
    setSearchParams({
      search: e.target.value,
      category,
      location,
    });
  };

  const handleCategory = (e) => {
    setSearchParams({
      search: searchQuery,
      category: e.target.value,
      location,
    });
  };

  const handleLocation = (e) => {
    setSearchParams({
      search: searchQuery,
      category,
      location: e.target.value,
    });
  };

  // ===============================
  // VIEW DETAILS
  // ===============================

  const handleViewDetails = (item) => {
    setSelectedItem(item);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  return (
    <div className="lost-page">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="lost-header">

        <p className="small-title">
          LOST ITEMS
        </p>

        <h1 style={{ color: "black" }}>
          Find what's been lost.
        </h1>

        <p>
          Browse items reported lost by students
          around campus.
        </p>

      </div>


      {/* ========================= */}
      {/* SEARCH AND FILTER */}
      {/* ========================= */}

      <div className="search-filter">

        <input
          type="text"
          placeholder="Search for an item..."
          value={searchQuery}
          onChange={handleSearch}
        />

        <select
          value={category}
          onChange={handleCategory}
        >
          <option value="">
            All Categories
          </option>

          <option value="Electronics">
            Electronics
          </option>

          <option value="Accessories">
            Accessories
          </option>

          <option value="Bags">
            Bags
          </option>

          <option value="Books">
            Books
          </option>

          <option value="Documents">
            Documents
          </option>

          <option value="Clothing">
            Clothing
          </option>

          <option value="Other">
            Other
          </option>
        </select>

        <input
          type="text"
          placeholder="Search by location..."
          value={location}
          onChange={handleLocation}
        />

      </div>


      {/* ========================= */}
      {/* LOST ITEMS */}
      {/* ========================= */}

      <div className="lost-grid">

        {/* LOADING */}

        {loading && (
          <div className="no-results">

            <h2>
              Loading lost items...
            </h2>

            <p>
              Please wait while we load the items.
            </p>

          </div>
        )}


        {/* ERROR */}

        {!loading && error && (
          <div className="no-results">

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

          </div>
        )}


        {/* ITEMS */}

        {!loading &&
          !error &&
          filteredItems.length > 0 &&
          filteredItems.map((item) => (

            <div
              className="lost-card"
              key={item._id}
            >

              {/* IMAGE */}

              <div className="lost-image">

                {item.image ? (

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                ) : (

                  <span>
                    📦
                  </span>

                )}

              </div>


              {/* CONTENT */}

              <div className="lost-content">

                <span className="item-category">
                  {item.category}
                </span>

                <h2>
                  {item.name}
                </h2>

                <p className="item-description">
                  {item.description}
                </p>


                <div className="item-details">

                  <p>
                    📍 {item.location}
                  </p>

                  <p>
                    📅 {item.date}
                  </p>

                  {item.reportedBy && (
                    <p>
                      👤 Reported by{" "}
                      {item.reportedBy.name}
                    </p>
                  )}

                </div>


                <button
                  className="details-btn"
                  type="button"
                  onClick={() =>
                    handleViewDetails(item)
                  }
                >
                  View Details
                </button>

              </div>

            </div>

          ))}


        {/* NO RESULTS */}

        {!loading &&
          !error &&
          filteredItems.length === 0 && (

            <div className="no-results">

              <h2>
                No matching items found.
              </h2>

              <p>
                Try searching for another item
                or changing the filters.
              </p>

            </div>

          )}

      </div>


      {/* ========================= */}
      {/* DETAILS POPUP */}
      {/* ========================= */}

      {selectedItem && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "30px",
              width: "100%",
              maxWidth: "500px",
              position: "relative",
              boxShadow:
                "0 10px 30px rgba(0, 0, 0, 0.2)",
            }}
          >

            {/* CLOSE BUTTON */}

            <button
              type="button"
              onClick={handleCloseDetails}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "28px",
                height: "28px",
                border: "none",
                borderRadius: "50%",
                background: "#f1f1f1",
                color: "#333",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>


            {/* ITEM NAME */}

            <h2
              style={{
                color: "#222",
                marginBottom: "20px",
                paddingRight: "30px",
              }}
            >
              {selectedItem.name}
            </h2>


            <p>
              <strong>
                Category:
              </strong>{" "}
              {selectedItem.category}
            </p>


            <p>
              <strong>
                Location:
              </strong>{" "}
              {selectedItem.location}
            </p>


            <p>
              <strong>
                Date:
              </strong>{" "}
              {selectedItem.date}
            </p>


            <p>
              <strong>
                Description:
              </strong>{" "}
              {selectedItem.description}
            </p>


            {selectedItem.reportedBy && (
              <p>
                <strong>
                  Reported by:
                </strong>{" "}
                {selectedItem.reportedBy.name}
              </p>
            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default LostItems;
