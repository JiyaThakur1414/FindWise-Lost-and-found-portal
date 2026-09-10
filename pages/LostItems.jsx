import { useSearchParams } from "react-router-dom";

function LostItems() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";

  const lostItems = [
    {
      id: 1,
      name: "Black Wallet",
      category: "Accessories",
      location: "University Library",
      date: "18 Aug 2026",
      description: "Black leather wallet with a few cards inside.",
    },
    {
      id: 2,
      name: "Blue Water Bottle",
      category: "Other",
      location: "Block B",
      date: "17 Aug 2026",
      description: "Blue Milton water bottle with a small sticker.",
    },
    {
      id: 3,
      name: "AirPods Case",
      category: "Electronics",
      location: "Cafeteria",
      date: "16 Aug 2026",
      description: "White AirPods charging case.",
    },
    {
      id: 4,
      name: "Student ID Card",
      category: "Documents",
      location: "Block A",
      date: "15 Aug 2026",
      description: "University student ID card found missing.",
    },
    {
      id: 5,
      name: "Black Notebook",
      category: "Books",
      location: "Classroom 204",
      date: "14 Aug 2026",
      description: "Black notebook containing class notes.",
    },
    {
      id: 6,
      name: "USB Drive",
      category: "Electronics",
      location: "Computer Lab",
      date: "13 Aug 2026",
      description: "Small black 32GB USB flash drive.",
    },
  ];

  // Filter items
  const filteredItems = lostItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      category === "" || item.category === category;

    const matchesLocation =
      location === "" || item.location === location;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Search handler
  const handleSearch = (e) => {
    setSearchParams({
      search: e.target.value,
      category: category,
      location: location,
    });
  };

  // Category handler
  const handleCategory = (e) => {
    setSearchParams({
      search: searchQuery,
      category: e.target.value,
      location: location,
    });
  };

  // Location handler
  const handleLocation = (e) => {
    setSearchParams({
      search: searchQuery,
      category: category,
      location: e.target.value,
    });
  };

  return (
    <div className="lost-page">

      {/* Header */}
      <div className="lost-header">
        <p className="small-title">LOST ITEMS</p>

        <h1 style={{ color: 'black'}}>
  Find what's been lost.
</h1>


        <p>
          Browse items reported lost by students around campus.
        </p>
      </div>

      {/* Search and Filters */}
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
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Accessories">Accessories</option>
          <option value="Books">Books</option>
          <option value="Documents">Documents</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={location}
          onChange={handleLocation}
        >
          <option value="">All Locations</option>
          <option value="University Library">
            University Library
          </option>
          <option value="Cafeteria">
            Cafeteria
          </option>
          <option value="Block A">
            Block A
          </option>
          <option value="Block B">
            Block B
          </option>
          <option value="Classroom 204">
            Classroom 204
          </option>
          <option value="Computer Lab">
            Computer Lab
          </option>
        </select>

      </div>

      {/* Results */}
      <div className="lost-grid">

        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div className="lost-card" key={item.id}>

              <div className="lost-image">
                <span>📦</span>
              </div>

              <div className="lost-content">

                <span className="item-category">
                  {item.category}
                </span>

                <h2>{item.name}</h2>

                <p className="item-description">
                  {item.description}
                </p>

                <div className="item-details">
                  <p>📍 {item.location}</p>
                  <p>📅 {item.date}</p>
                </div>

                <button className="details-btn">
                  View Details
                </button>

              </div>

            </div>
          ))
        ) : (
          <div className="no-results">
            <h2>No items found</h2>

            <p>
              Try searching for another item or changing the filters.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

export default LostItems;