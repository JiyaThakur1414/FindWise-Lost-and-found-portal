import React, { useState } from 'react';

function FoundItems() {
  const [searchTerm, setSearchTerm] = useState("");

  const foundItems = [
    { id: 1, name: "Silver Watch", category: "Accessories", location: "Main Ground", date: "20 Aug 2026", description: "Silver wrist watch found near the college ground." },
    { id: 2, name: "Black Backpack", category: "Bags", location: "Library", date: "19 Aug 2026", description: "Black backpack with notebooks and a water bottle." },
    { id: 3, name: "Wireless Earbuds", category: "Electronics", location: "Cafeteria", date: "18 Aug 2026", description: "White wireless earbuds found on a cafeteria table." },
    { id: 4, name: "Calculator", category: "Electronics", location: "Block B", date: "17 Aug 2026", description: "Scientific calculator found inside classroom 205." },
    { id: 5, name: "Blue Notebook", category: "Books", location: "Block A", date: "16 Aug 2026", description: "Blue notebook containing mathematics notes." },
    { id: 6, name: "College ID Card", category: "Documents", location: "Parking Area", date: "15 Aug 2026", description: "Student ID card found near the parking area." },
  ];

  // Filter items based on the search input
  const filteredItems = foundItems.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="lost-page">
      <div className="lost-header">
        <p className="small-title">FOUND ITEMS</p>
        <h1 style={{ color: 'black' }}>
  Things people have found.
</h1>

        <p>Browse items found around campus and help return them to their owners.</p>
      </div>
      
      <div className="search-filter">
        <input 
          type="text" 
          placeholder="Search found items..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select>
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Accessories</option>
          <option>Bags</option>
          <option>Books</option>
          <option>Documents</option>
        </select>
        <select>
          <option>All Locations</option>
          <option>Library</option>
          <option>Cafeteria</option>
          <option>Block A</option>
          <option>Block B</option>
          <option>Main Ground</option>
          <option>Parking Area</option>
        </select>
      </div>

      <div className="lost-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div className="lost-card" key={item.id}>
              <div className="lost-image">
                <span>🔎</span>
              </div>
              <div className="lost-content">
                <span className="item-category">{item.category}</span>
                <h2>{item.name}</h2>
                <p className="item-description">{item.description}</p>
                <div className="item-details">
                  <p>📍 {item.location}</p>
                  <p>📅 {item.date}</p>
                </div>
                <button className="details-btn">View Details</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No matching items found.</p>
        )}
      </div>
    </div>
  );
}

export default FoundItems;
