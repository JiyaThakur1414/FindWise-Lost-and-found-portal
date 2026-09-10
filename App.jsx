import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import LostItems from "./pages/LostItems";
import FoundItems from "./pages/FoundItems";
import PostItem from "./pages/PostItem";

function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (search.trim() === "") {
      navigate("/lost");
    } else {
      navigate(`/lost?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div>

      <section className="hero">

        <div className="hero-content">

          <p className="small-title">
            COLLEGE LOST & FOUND
          </p>

          <h1>
            Lost something?
            <br />
            <span>Let's find it.</span>
          </h1>

          <p className="hero-text">
            FindWise helps students report lost items,
            discover found belongings, and reconnect
            people with what matters to them.
          </p>

          <div className="hero-buttons">

            <a
              href="/post?type=lost"
              className="primary-btn"
            >
              I Lost Something
            </a>

            <a
              href="/post?type=found"
              className="secondary-btn"
            >
              I Found Something
            </a>

          </div>

        </div>


        <div className="hero-card">

          <div className="search-icon">
            ⌕
          </div>

          <h3>
            Looking for something?
          </h3>

          <p>
            Search through recently reported items.
          </p>

          <div className="search-box">

            <input
              type="text"
              placeholder="Search for an item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <button onClick={handleSearch}>
              Search
            </button>

          </div>

        </div>

      </section>


      <section className="how-section">

        <p className="small-title">
          HOW IT WORKS
        </p>

        <h2>
          Finding lost things made simple.
        </h2>

        <div className="steps">

          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>
              Report
            </h3>

            <p>
              Lost or found something? Create a quick
              post with the important details.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>
              Search
            </h3>

            <p>
              Browse reported items and use filters
              to find what you're looking for.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>
              Reconnect
            </h3>

            <p>
              Contact the person and safely return
              the lost item to its owner.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN IS THE FIRST PAGE */}

        <Route
          path="/"
          element={<Login />}
        />


        {/* HOME PAGE */}

        <Route
          path="/home"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />


        {/* LOST ITEMS */}

        <Route
          path="/lost"
          element={
            <>
              <Navbar />
              <LostItems />
            </>
          }
        />


        {/* FOUND ITEMS */}

        <Route
          path="/found"
          element={
            <>
              <Navbar />
              <FoundItems />
            </>
          }
        />


        {/* POST ITEM */}

        <Route
          path="/post"
          element={
            <>
              <Navbar />
              <PostItem />
            </>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;