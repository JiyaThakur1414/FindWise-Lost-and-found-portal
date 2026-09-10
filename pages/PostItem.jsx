import { useState } from "react";
import { useSearchParams } from "react-router-dom";
function PostItem() {
 const [searchParams] = useSearchParams();
 const initialType = searchParams.get("type") || "lost";
 const [itemType, setItemType] = useState(initialType);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [matches, setMatches] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const findMatches = () => {
    setAiSearching(true);
    setMatches([]);

    // Temporary AI simulation
    // Later this will call CLIP + SBERT through the backend.
    setTimeout(() => {
      setAiSearching(false);

      setMatches([
        {
          id: 1,
          name: "Black Backpack",
          location: "University Library",
          score: 91,
          descriptionScore: 94,
          imageScore: 88,
        },
        {
          id: 2,
          name: "Black Laptop Bag",
          location: "Block B",
          score: 83,
          descriptionScore: 86,
          imageScore: 80,
        },
      ]);
    }, 1500);
  };

  return (
    <div className="post-page">

      <div className="post-header">

  <p className="small-title">REPORT AN ITEM</p>

  <h1>
    {itemType === "lost"
      ? "Report a Lost Item"
      : "Report a Found Item"}
  </h1>

  <p>
    {itemType === "lost"
      ? "Tell us what you lost so we can help you find it."
      : "Tell us what you found so we can help return it to its owner."}
  </p>

</div>

      <div className="post-card">

        {/* Lost / Found selection */}
        <div className="type-selection">

          <button
            type="button"
            className={itemType === "lost" ? "type-active" : ""}
            onClick={() => setItemType("lost")}
          >
            I Lost Something
          </button>

          <button
            type="button"
            className={itemType === "found" ? "type-active" : ""}
            onClick={() => setItemType("found")}
          >
            I Found Something
          </button>

        </div>

        <form>

          {/* Item Name */}
          <div className="form-group">
            <label>Item Name</label>

            <input
              type="text"
              placeholder="e.g. Black Backpack"
            />
          </div>

          {/* Category + Date */}
          <div className="form-row">

            <div className="form-group">
              <label>Category</label>

              <select>
                <option>Select category</option>
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Bags</option>
                <option>Books</option>
                <option>Documents</option>
                <option>Clothing</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>

              <input type="date" />
            </div>

          </div>

          {/* Location */}
          <div className="form-group">

            <label>Location</label>

            <input
              type="text"
              placeholder="Where was it lost/found?"
            />

          </div>

          {/* Description */}
          <div className="form-group">

            <label>Item Description</label>

            <textarea
              rows="5"
              placeholder="Describe the item, color, brand, identifying marks, etc."
            ></textarea>

          </div>

          {/* Image Upload */}
          <div className="form-group">

            <label>Item Image</label>

            <div className="upload-box">

              {imagePreview ? (
                <div className="image-preview">

                  <img
                    src={imagePreview}
                    alt="Item preview"
                  />

                  <p>{image.name}</p>

                </div>
              ) : (
                <>
                  <div className="upload-icon">📷</div>

                  <p>
                    Upload a clear photo of the item
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </>
              )}

            </div>

          </div>

          {/* AI MATCH SECTION */}
          <div className="ai-section">

            <div className="ai-title">
              <span>🤖</span>

              <div>
                <h3>AI Match Finder</h3>

                <p>
                  We'll compare your item with existing reports
                  using image and description similarity.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="ai-match-btn"
              onClick={findMatches}
            >
              {aiSearching
                ? "🔍 Finding Matches..."
                : "🤖 Find Possible Matches"}
            </button>

          </div>

          {/* AI RESULTS */}
          {matches.length > 0 && (

            <div className="ai-results">

              <h3>Possible Matches</h3>

              <p className="ai-result-text">
                AI found these items that may match your report.
              </p>

              {matches.map((match) => (

                <div className="match-card" key={match.id}>

                  <div className="match-image">
                    📦
                  </div>

                  <div className="match-info">

                    <h4>{match.name}</h4>

                    <p>📍 {match.location}</p>

                    <div className="match-scores">

                      <span>
                        Description: {match.descriptionScore}%
                      </span>

                      <span>
                        Image: {match.imageScore}%
                      </span>

                    </div>

                  </div>

                  <div className="match-score">
                    <strong>{match.score}%</strong>
                    <small>Match</small>
                  </div>

                </div>

              ))}

            </div>

          )}

          {/* Contact */}
          <div className="form-group">

            <label>Contact Information</label>

            <input
              type="text"
              placeholder="Email or phone number"
            />

          </div>

          <button
            type="submit"
            className="submit-item-btn"
          >
            {itemType === "lost"
              ? "Post Lost Item"
              : "Post Found Item"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default PostItem;