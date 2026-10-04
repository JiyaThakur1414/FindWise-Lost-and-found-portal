import { useState } from "react";
import {
  getImageEmbedding,
  imageCosineSimilarity,
} from "./ai/imageMatcher";

function AIImageTest() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testImages = async () => {
    if (!image1 || !image2) {
      setResult("Please select both images.");
      return;
    }

    setLoading(true);
    setResult("CLIP model is loading...");

    try {
      const embedding1 = await getImageEmbedding(image1);
      const embedding2 = await getImageEmbedding(image2);

      const similarity = imageCosineSimilarity(
        embedding1,
        embedding2
      );

      setResult(
        `Image Similarity: ${(similarity * 100).toFixed(2)}%`
      );
    } catch (error) {
      console.error(error);
      setResult("CLIP model failed to load.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>FindWise AI - Image Test</h2>

      <div>
        <p>Select Image 1</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage1(e.target.files[0])}
        />
      </div>

      <br />

      <div>
        <p>Select Image 2</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage2(e.target.files[0])}
        />
      </div>

      <br />

      <button onClick={testImages} disabled={loading}>
        {loading ? "Testing Images..." : "Test Image Matching"}
      </button>

      <p>{result}</p>
    </div>
  );
}

export default AIImageTest;