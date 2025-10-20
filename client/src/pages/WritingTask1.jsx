import React, { useState } from "react";

export default function WritingTask1() {
  const [taskType, setTaskType] = useState("academic");
  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://localhost:4000/api/ai/writing/task1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType, question, essay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Submit failed");
      setResult(data.result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
        IELTS Writing Task 1
      </h1>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow border">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Task type</label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="academic">Academic (Report)</option>
            <option value="general">General Training (Letter)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Question / Prompt</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="border rounded-lg px-3 py-2 w-full"
            placeholder={
              taskType === "academic"
                ? "E.g., The charts show the percentage of..."
                : "E.g., Write a letter to your landlord to complain about..."
            }
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Your response</label>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            rows={10}
            className="border rounded-lg px-3 py-2 w-full"
            placeholder="Write your Task 1 response here..."
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-2">Error: {error}</p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onSubmit}
            disabled={loading || !question || !essay}
            className="bg-green-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Scoring..." : "Submit for AI Scoring"}
          </button>

          <a
            href="/writing/task1/history"
            className="px-4 py-2 rounded-lg border text-green-700"
          >
            View History →
          </a>
        </div>

        {result && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4 border">
            <div className="flex justify-between">
              <h3 className="font-semibold">Result</h3>
              <span className="text-green-700 font-semibold">
                Band Score: {result.score}
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-sm mt-2 text-gray-800">
{result.feedback}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(result.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
