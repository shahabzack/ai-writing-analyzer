"use client";

import { useState } from "react";

export default function Home() {

  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const analyzeText = async () => {
    setFeedbackSaved(false);
    setError("");

    try {

      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: text,
          }),
        }
      );

      const data = await response.json();

      setResult(data);

    } catch (error) {

      console.error(error);

      setError("Failed to analyze text.");

    } finally {

      setLoading(false);

    }
  };

  const saveFeedback = async (label: string) => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/save_feedback",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: text,
            label: label,
            perplexity: result.perplexity,
            burstiness: result.burstiness,
          }),
        }
      );

      const data = await response.json();
      setFeedbackSaved(true);

      console.log(data);

    } catch (error) {

      console.error(error);

    }
  };

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-4">
        AI Writing Analyzer
      </h1>

      <textarea
        className="border p-4 w-full h-40"
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={analyzeText}
        className="bg-black text-white px-4 py-2 mt-4"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && (
        <p className="text-red-500 mt-4">
          {error}
        </p>
      )}

      {result && (

        <div className="mt-6 border p-4">

          <p>
            Perplexity: {result.perplexity}
          </p>

          <p>
            Burstiness: {result.burstiness}
          </p>

          <p>
            Analysis: {result.analysis}
          </p>

          <p>
            Confidence: {result.confidence}
          </p>

        </div>
      )}

      {result && !feedbackSaved && (

        <div className="mt-4 flex gap-4">

          <button
            onClick={() => saveFeedback("Human")}
            className="bg-green-500 text-white px-4 py-2"
          >
            Mark Human
          </button>

          <button
            onClick={() => saveFeedback("AI")}
            className="bg-red-500 text-white px-4 py-2"
          >
            Mark AI
          </button>

        </div>
      )}

      {feedbackSaved && (
  <p className="text-green-600 mt-4">
    Thank you for your  feedback!
  </p>
)}

    </div>
  );
}