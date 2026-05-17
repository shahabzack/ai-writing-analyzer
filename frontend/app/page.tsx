"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, AlertTriangle, Info, ThumbsUp, ThumbsDown } from "lucide-react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Handle text input with 1000 word limit
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const wordsArray = val.trim().split(/\s+/).filter((w) => w.length > 0);

    if (wordsArray.length <= 1000) {
      setText(val);
    } else {
      // Truncate to 1000 words
      setText(wordsArray.slice(0, 1000).join(" "));
    }
  };

  const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;

  const analyzeText = async () => {
    if (wordCount === 0) {
      setError("Please enter some text to analyze.");
      return;
    }

    setFeedbackSaved(false);
    setError("");
    setResult(null);

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setError("Failed to analyze text. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const saveFeedback = async (label: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/save_feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          label: label,
          perplexity: result.perplexity,
          burstiness: result.burstiness,
          avg_sentence_length: result.avg_sentence_length,
          vocabulary_diversity: result.vocabulary_diversity,
        }),
      });

      if (response.ok) {

  const data = await response.json();

  console.log(data);

  setFeedbackSaved(true);

} else {

  const errorData = await response.json();

  console.error(errorData);

  setError("Failed to save feedback.");

}
    } catch (error) {
      console.error(error);
    }
  };

  const isAI = result?.prediction?.toLowerCase().includes("ai");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex flex-col items-center justify-center p-4 sm:p-6 text-gray-800 dark:text-gray-200">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/20 dark:border-gray-700/50"
      >
        <div className="p-6 sm:p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4 tracking-tight">
              AI Writing Analyzer
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Detect AI-generated content instantly with advanced stylometric analysis
            </p>
          </div>

          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
              <textarea
                className="w-full h-56 p-6 bg-transparent border-none outline-none focus:ring-0 resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 text-lg leading-relaxed rounded-2xl"
                placeholder="Paste your text here (max 1000 words)..."
                value={text}
                onChange={handleTextChange}
              />
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 dark:border-gray-800/50">
                <div className="flex-1">
                  <AnimatePresence>
                    {wordCount > 0 && wordCount < 50 && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium"
                      >
                        <Info className="w-4 h-4" />
                        <span>Tip: Use 50+ words for better accuracy.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${wordCount > 950 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {wordCount} / 1000 words
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <motion.button
              whileHover={!(loading || wordCount === 0) ? { scale: 1.02 } : {}}
              whileTap={!(loading || wordCount === 0) ? { scale: 0.98 } : {}}
              onClick={analyzeText}
              disabled={loading || wordCount === 0}
              className={`relative overflow-hidden group w-full md:w-auto px-12 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading || wordCount === 0
                  ? 'bg-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                }`}
            >
              {!(loading || wordCount === 0) && (
                <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -ml-4"></div>
              )}
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Text"
                )}
              </span>
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 mt-4 font-medium flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50 p-6 sm:p-8 md:p-12"
            >
              <div className="text-center mb-10">
                <div className="inline-flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                  {isAI ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                      <AlertTriangle className="w-14 h-14 text-rose-500" />
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                      <CheckCircle className="w-14 h-14 text-emerald-500" />
                    </motion.div>
                  )}
                  <h2 className={`text-4xl sm:text-5xl font-black tracking-tight ${isAI ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {result.prediction}
                  </h2>
                </div>
                <p className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-300">
                  Confidence Score: <span className="font-bold">{result.confidence}%</span>
                </p>
              </div>

              {/* Smaller score display below */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 max-w-3xl mx-auto">
                {[
                  { label: "Perplexity", value: result.perplexity },
                  { label: "Burstiness", value: result.burstiness },
                  { label: "Avg Sentence", value: result.avg_sentence_length },
                  { label: "Vocab Diversity", value: result.vocabulary_diversity }
                ].map((stat, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow"
                  >
                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1.5">{stat.label}</span>
                    <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200">
                      {typeof stat.value === 'number' ? stat.value.toFixed(2) : stat.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {!feedbackSaved ? (
                <div className="flex flex-col items-center bg-white/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 max-w-2xl mx-auto">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-500" /> Is our prediction correct? Help us improve.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => saveFeedback("Human")}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-emerald-500/30 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-500 transition-all shadow-sm"
                    >
                      <ThumbsUp className="w-4 h-4" /> Actually Human
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => saveFeedback("AI")}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-rose-500/30 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:border-rose-500 transition-all shadow-sm"
                    >
                      <ThumbsDown className="w-4 h-4" /> Actually AI
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 max-w-2xl mx-auto"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <CheckCircle className="w-10 h-10 mb-3" />
                  </motion.div>
                  <p className="font-bold text-lg">Thank you for your feedback!</p>
                  <p className="text-sm opacity-80 mt-1">Your contribution helps improve our model.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}