import { useState } from "react";
import {
  getTextEmbedding,
  cosineSimilarity,
} from "./ai/matcher";

function AITest() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testAI = async () => {
    setLoading(true);
    setResult("AI model is loading...");

    try {
      const text1 =
        "Black leather wallet with a small brown logo";

      const text2 =
        "Found a black wallet near the university library";

      const embedding1 = await getTextEmbedding(text1);
      const embedding2 = await getTextEmbedding(text2);

      const similarity = cosineSimilarity(
        embedding1,
        embedding2
      );

      setResult(
        `Description Similarity: ${(similarity * 100).toFixed(2)}%`
      );
    } catch (error) {
      console.error(error);
      setResult("AI model failed to load.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>FindWise AI Test</h2>

      <button onClick={testAI} disabled={loading}>
        {loading ? "Testing AI..." : "Test AI Matching"}
      </button>

      <p>{result}</p>
    </div>
  );
}

export default AITest;