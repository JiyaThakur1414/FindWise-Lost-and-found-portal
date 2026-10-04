import { useState } from "react";
import { calculateMatchScore } from "./ai/matchItems";

function AIFullTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testMatching = async () => {
    setLoading(true);
    setResult(null);

    try {
      const lostItem = {
        name: "Black Wallet",
        description:
          "Black leather wallet with a small brown logo",
        category: "Wallet",
        location: "University Library",
        image: null,
      };

      const foundItem = {
        name: "Black Leather Wallet",
        description:
          "Found a black wallet near the university library",
        category: "Wallet",
        location: "University Library",
        image: null,
      };

      const score = await calculateMatchScore(
        lostItem,
        foundItem
      );

      setResult(score);
    } catch (error) {
      console.error(error);
      setResult({
        error: "AI matching failed. Check the console.",
      });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>FindWise AI - Full Matching Test</h2>

      <p>
        Lost Item: Black Wallet
      </p>

      <p>
        Found Item: Black Leather Wallet
      </p>

      <button
        onClick={testMatching}
        disabled={loading}
      >
        {loading
          ? "AI is matching..."
          : "Test Full AI Matching"}
      </button>

      {result && !result.error && (
        <div style={{ marginTop: "30px" }}>
          <h3>AI Matching Result</h3>

          <p>
            Image Match: {result.imageScore}%
          </p>

          <p>
            Description Match:{" "}
            {result.descriptionScore}%
          </p>

          <p>
            Category Match: {result.categoryScore}%
          </p>

          <p>
            Location Match: {result.locationScore}%
          </p>

          <h2>
            Final Match: {result.finalScore}%
          </h2>
        </div>
      )}

      {result?.error && (
        <p>{result.error}</p>
      )}
    </div>
  );
}

export default AIFullTest;