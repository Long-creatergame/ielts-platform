import React, { useEffect, useState } from "react";

export default function WritingTask1History() {
  const [data, setData] = useState({ items: [], page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);

  const load = async (page = 1) => {
    setLoading(true);
    const res = await fetch(
      `http://localhost:4000/api/ai/writing/task1/results?page=${page}&limit=10`
    );
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (data.limit || 10)));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
        Writing Task 1 — History
      </h1>

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : data.items.length === 0 ? (
          <p className="text-center text-gray-500">No records found.</p>
        ) : (
          <div className="space-y-5">
            {data.items.map((e) => (
              <div key={e._id} className="bg-white p-5 rounded-2xl shadow border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">
                    {new Date(e.createdAt).toLocaleString()}
                  </span>
                  <span className="text-green-700 font-semibold">
                    Band: {e.score} — {e.taskType}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  <b>Question:</b> {e.question.slice(0, 180)}...
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <b>Essay:</b> {e.essay.slice(0, 160)}...
                </p>
                <pre className="whitespace-pre-wrap text-xs mt-3 text-gray-600">
{e.feedback}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center mt-6">
            <button
              disabled={data.page <= 1}
              onClick={() => load(data.page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm">
              Page {data.page} / {totalPages}
            </span>
            <button
              disabled={data.page >= totalPages}
              onClick={() => load(data.page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <a href="/writing/task1" className="text-green-700 underline">
            ← Back to Task 1
          </a>
        </div>
      </div>
    </div>
  );
}
