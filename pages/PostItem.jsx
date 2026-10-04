import { useState, useEffect } from "react";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { calculateMatchScore } from "../ai/matchItems";

function PostItem() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialType =
    searchParams.get("type") || "lost";

  const [itemType, setItemType] =
    useState(initialType);

  const [image, setImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [aiSearching, setAiSearching] =
    useState(false);

  const [matches, setMatches] =
    useState([]);

  const [lostItems, setLostItems] =
    useState([]);

  const [linkedItem, setLinkedItem] =
    useState("");

  const [otherLostItem, setOtherLostItem] =
    useState("");

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [date, setDate] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [contact, setContact] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ==========================================
  // FETCH EXISTING LOST ITEMS
  // ==========================================

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response =
          await fetch(
            "http://localhost:5000/api/items"
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.log(
            "Unable to load lost items"
          );
          return;
        }

        const lost =
          data.filter(
            (item) =>
              item.type === "lost" &&
              item.status !== "Returned"
          );

        setLostItems(lost);

      } catch (error) {
        console.log(
          "Unable to load lost items:",
          error
        );
      }
    };

    fetchLostItems();
  }, []);


  // ==========================================
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange = (e) => {
    const file =
      e.target.files[0];

    if (!file) {
      return;
    }

    setImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(
      previewUrl
    );
  };


  // ==========================================
  // AI MATCH FINDER
  // ==========================================

  const findMatches = async () => {
    setAiSearching(true);
    setMatches([]);
    setError("");

    try {
      const storedUser =
        localStorage.getItem("user");

      const user = storedUser
        ? JSON.parse(storedUser)
        : null;

      let imageBase64 = "";

      if (image) {
        imageBase64 =
          await convertImageToBase64(
            image
          );
      }

      if (
        !name ||
        !description ||
        !category ||
        !location
      ) {
        setError(
          "Please fill the item details before finding matches."
        );

        setAiSearching(false);
        return;
      }

      const currentItem = {
        name,
        description,
        category,
        location,
        date,
        type: itemType,
        image: imageBase64,
        reportedBy:
          user?.id || null,
      };

      const response =
        await fetch(
          "http://localhost:5000/api/items"
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "Unable to fetch items"
        );
      }

      const oppositeType =
        itemType === "lost"
          ? "found"
          : "lost";

      const possibleItems =
        data.filter(
          (item) =>
            item.type ===
              oppositeType &&
            item.status !==
              "Returned" &&
            item.status !==
              "Claimed" &&
            item.reportedBy?._id !==
              user?.id
        );

      if (
        possibleItems.length === 0
      ) {
        setMatches([]);

        setError(
          `There are currently no active ${oppositeType} items to compare with.`
        );

        setAiSearching(false);
        return;
      }

      const results = [];

      for (
        const item of possibleItems
      ) {
        try {
          const score =
            await calculateMatchScore(
              itemType === "lost"
                ? currentItem
                : item,
              itemType === "lost"
                ? item
                : currentItem
            );

          results.push({
            id: item._id,

            name: item.name,

            location:
              item.location,

            date: item.date,

            category:
              item.category,

            description:
              item.description,

            image:
              item.image,

            score:
              score.finalScore,

            descriptionScore:
              score.descriptionScore,

            imageScore:
              score.imageScore,

            categoryScore:
              score.categoryScore,

            locationScore:
              score.locationScore,
          });

        } catch (error) {
          console.log(
            "AI matching error for item:",
            item._id,
            error
          );
        }
      }

      results.sort(
        (a, b) =>
          b.score - a.score
      );

      setMatches(
        results.slice(0, 5)
      );

    } catch (error) {
      console.log(
        "AI matching error:",
        error
      );

      setError(
        "Unable to perform AI matching."
      );

    } finally {
      setAiSearching(false);
    }
  };


  // ==========================================
  // SUBMIT ITEM
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const user =
        JSON.parse(
          localStorage.getItem("user")
        );

      let imageBase64 = "";

      if (image) {
        imageBase64 =
          await convertImageToBase64(
            image
          );
      }


      // ==========================================
      // VALIDATE OTHER OPTION
      // ==========================================

      if (
        itemType === "found" &&
        linkedItem === "other" &&
        !otherLostItem.trim()
      ) {
        setError(
          "Please describe the lost item."
        );

        return;
      }


      // ==========================================
      // SEND DATA TO SERVER
      // ==========================================

      const response =
        await fetch(
          "http://localhost:5000/api/items",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              description,
              category,
              location,
              date,
              type: itemType,
              image: imageBase64,

              reportedBy:
                user
                  ? user.id
                  : null,

              contact,

              linkedItem:
                itemType === "found" &&
                linkedItem !== "other"
                  ? linkedItem || null
                  : null,

              otherLostItem:
                itemType === "found" &&
                linkedItem === "other"
                  ? otherLostItem
                  : "",
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        setError(
          data.message ||
            "Unable to post item"
        );

        return;
      }


      // ==========================================
      // SUCCESS
      // ==========================================

      setMessage(
        "Item posted successfully!"
      );


      // RESET FORM

      setName("");
      setCategory("");
      setDate("");
      setLocation("");
      setDescription("");
      setContact("");

      setLinkedItem("");
      setOtherLostItem("");

      setImage(null);
      setImagePreview(null);

      setMatches([]);


      // ==========================================
      // NAVIGATE
      // ==========================================

      setTimeout(() => {
        if (itemType === "lost") {
          navigate("/lost");
        } else {
          navigate("/found");
        }
      }, 1000);

    } catch (error) {
      console.log(error);

      setError(
        "Unable to connect to server"
      );
    }
  };


  // ==========================================
  // CONVERT IMAGE TO BASE64
  // ==========================================

  const convertImageToBase64 = (
    file
  ) => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.readAsDataURL(
          file
        );

        reader.onload = () => {
          resolve(
            reader.result
          );
        };

        reader.onerror = (
          error
        ) => {
          reject(error);
        };
      }
    );
  };


  // ==========================================
  // GET IMAGE SOURCE
  // ==========================================

  const getImageSource = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("data:image/") ||
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    return `data:image/jpeg;base64,${image}`;
  };


  // ==========================================
  // OPEN MATCHED ITEM
  // ==========================================

  const openMatchedItem = (match) => {
    if (!match.id) {
      return;
    }

    if (itemType === "lost") {
      navigate(
        `/found?item=${match.id}`
      );
    } else {
      navigate(
        `/lost?item=${match.id}`
      );
    }
  };


  return (
    <div className="post-page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="post-header">

        <p className="small-title">
          REPORT AN ITEM
        </p>

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

        {/* ==========================================
            LOST / FOUND SELECTION
        ========================================== */}

        <div className="type-selection">

          <button
            type="button"
            className={
              itemType === "lost"
                ? "type-active"
                : ""
            }
            onClick={() => {
              setItemType("lost");
              setLinkedItem("");
              setOtherLostItem("");
            }}
          >
            I Lost Something
          </button>


          <button
            type="button"
            className={
              itemType === "found"
                ? "type-active"
                : ""
            }
            onClick={() => {
              setItemType("found");
            }}
          >
            I Found Something
          </button>

        </div>


        <form onSubmit={handleSubmit}>

          {/* ==========================================
              ITEM NAME
          ========================================== */}

          <div className="form-group">

            <label>
              Item Name
            </label>

            <input
              type="text"
              placeholder="e.g. Black Backpack"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* ==========================================
              CATEGORY + DATE
          ========================================== */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                required
              >

                <option value="">
                  Select category
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

            </div>


            <div className="form-group">

              <label>
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
                required
              />

            </div>

          </div>


          {/* ==========================================
              LOCATION
          ========================================== */}

          <div className="form-group">

            <label>
              Location
            </label>

            <input
              type="text"
              placeholder="Where was it lost/found?"
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* ==========================================
              DESCRIPTION
          ========================================== */}

          <div className="form-group">

            <label>
              Item Description
            </label>

            <textarea
              rows="5"
              placeholder="Describe the item, color, brand, identifying marks, etc."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              required
            ></textarea>

          </div>


          {/* ==========================================
              RELATED LOST ITEM
              ONLY FOR FOUND ITEMS
          ========================================== */}

          {itemType === "found" && (

            <div className="form-group">

              <label>
                Related Lost Item
              </label>

              <select
                value={linkedItem}
                onChange={(e) => {
                  setLinkedItem(
                    e.target.value
                  );

                  if (
                    e.target.value !==
                    "other"
                  ) {
                    setOtherLostItem("");
                  }
                }}
              >

                <option value="">
                  Select a related lost item
                </option>

                {lostItems.map(
                  (item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name} -{" "}
                      {item.location} -{" "}
                      {item.date}
                    </option>
                  )
                )}

                <option value="other">
                  Other - Lost item not listed
                </option>

              </select>


              {linkedItem === "other" && (

                <input
                  type="text"
                  placeholder="Describe the lost item"
                  value={otherLostItem}
                  onChange={(e) =>
                    setOtherLostItem(
                      e.target.value
                    )
                  }
                  style={{
                    marginTop: "10px",
                  }}
                  required
                />

              )}

            </div>

          )}


          {/* ==========================================
              IMAGE
          ========================================== */}

          <div className="form-group">

            <label>
              Item Image
            </label>

            <div className="upload-box">

              {imagePreview ? (

                <div className="image-preview">

                  <img
                    src={imagePreview}
                    alt="Item preview"
                  />

                  <p>
                    {image.name}
                  </p>

                </div>

              ) : (

                <>

                  <div className="upload-icon">
                    📷
                  </div>

                  <p>
                    Upload a clear photo of the item
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                  />

                </>

              )}

            </div>

          </div>


          {/* ==========================================
              AI MATCH FINDER
              ONLY FOR LOST ITEMS
          ========================================== */}

          {itemType === "lost" && (

            <div className="ai-section">

              <div className="ai-title">

                <span>
                  🤖
                </span>

                <div>

                  <h3>
                    AI Match Finder
                  </h3>

                  <p>
                    We'll compare your item
                    with existing found reports
                    using image and
                    description similarity.
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

          )}


          {/* ==========================================
              AI RESULTS
              ONLY FOR LOST ITEMS
          ========================================== */}

          {itemType === "lost" &&
            matches.length > 0 && (

            <div className="ai-results">

              <h3>
                Possible Matches
              </h3>

              <p className="ai-result-text">
                AI found these items that
                may match your report.
              </p>


              {matches.map(
                (match) => (

                  <div
                    className="match-card"
                    key={match.id}
                    onClick={() =>
                      openMatchedItem(
                        match
                      )
                    }
                    style={{
                      cursor:
                        "pointer",
                    }}
                  >

                    <div className="match-image">

                      {match.image ? (

                        <img
                          src={getImageSource(
                            match.image
                          )}
                          alt={match.name}
                          onError={(e) => {
                            console.log(
                              "Unable to display match image"
                            );

                            e.target.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <span>
                          📦
                        </span>

                      )}

                    </div>


                    <div className="match-info">

                      <h4>
                        {match.name}
                      </h4>

                      <p>
                        📍 {match.location}
                      </p>

                      <div className="match-scores">

                        <span>
                          Description:{" "}
                          {
                            match.descriptionScore
                          }%
                        </span>

                        <span>
                          Image:{" "}

                          {match.imageScore ===
                          null
                            ? "N/A"
                            : `${match.imageScore}%`}
                        </span>

                        <span>
                          Category:{" "}
                          {
                            match.categoryScore
                          }%
                        </span>

                        <span>
                          Location:{" "}
                          {
                            match.locationScore
                          }%
                        </span>

                      </div>

                    </div>


                    <div className="match-score">

                      <strong>
                        {match.score}%
                      </strong>

                      <small>
                        Match
                      </small>

                    </div>

                  </div>

                )
              )}

            </div>

          )}


          {/* ==========================================
              CONTACT
          ========================================== */}

          <div className="form-group">

            <label>
              Contact Information
            </label>

            <input
              type="text"
              placeholder="Email or phone number"
              value={contact}
              onChange={(e) =>
                setContact(
                  e.target.value
                )
              }
            />

          </div>


          {/* ==========================================
              ERROR
          ========================================== */}

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


          {/* ==========================================
              SUCCESS MESSAGE
          ========================================== */}

          {message && (

            <p
              style={{
                color: "green",
                marginBottom: "15px",
              }}
            >
              {message}
            </p>

          )}


          {/* ==========================================
              SUBMIT
          ========================================== */}

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
