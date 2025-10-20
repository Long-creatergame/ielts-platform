import React, { useEffect, useState } from "react";

const WritingHistory = () => {
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEssays = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/ai/essay/results");
        const data = await res.json();
        setEssays(data);
      } catch (error) {
        console.error("Failed to load essay history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEssays();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading history...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-8">
        🧠 IELTS Writing History
      </h1>

      {essays.length === 0 ? (
        <p className="text-center text-gray-500">
          No essays found. Try submitting one first!
        </p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {essays.map((e) => (
            <div
              key={e._id}
              className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">
                  🕒 {new Date(e.createdAt).toLocaleString()}
                </span>
                <span className="text-green-600 font-semibold">
                  Band Score: {e.score ?? "?"}
                </span>
              </div>

              <p className="text-gray-800 whitespace-pre-line mb-3">
                <strong>Essay:</strong> {e.essay.slice(0, 150)}...
              </p>

              <p className="text-sm text-gray-600 whitespace-pre-line">
                <strong>Feedback:</strong> {e.feedback}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WritingHistory;
