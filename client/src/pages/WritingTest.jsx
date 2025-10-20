import { api } from "../services/api";
import { useState } from "react";

function WritingTest() {
  const [essay, setEssay] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!essay.trim()) {
      setError("Please write an essay before submitting.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post("/ai/essay", { essay });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error scoring essay. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEssay("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">IELTS Writing Test</h1>
          <p className="text-gray-600">Practice your Writing Task 2 skills with AI-powered feedback</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Writing Prompt */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Writing Task 2</h3>
            <p className="text-blue-700">
              <strong>Topic:</strong> Some people believe that technology has made our lives easier, 
              while others think it has made life more complicated. Discuss both views and give your opinion.
            </p>
            <p className="text-sm text-blue-600 mt-2">
              <strong>Instructions:</strong> Write at least 250 words. You should spend about 40 minutes on this task.
            </p>
          </div>

          {/* Essay Textarea */}
          <div className="mb-6">
            <label htmlFor="essay" className="block text-sm font-medium text-gray-700 mb-2">
              Your Essay
            </label>
            <textarea
              id="essay"
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Write your essay here..."
              className="w-full h-64 border border-gray-300 rounded-md p-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                Word count: {essay.trim() ? essay.trim().split(/\s+/).length : 0}
              </span>
              <span className="text-sm text-gray-500">
                Minimum: 250 words
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleSubmit}
              disabled={loading || !essay.trim()}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI is Scoring...
                </span>
              ) : (
                "Submit for AI Scoring"
              )}
            </button>
            
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* History Link */}
          <div className="text-center">
            <a
              href="/writing/history"
              className="inline-flex items-center text-green-600 hover:text-green-700 underline font-medium transition-colors"
            >
              📚 View My Writing History →
            </a>
          </div>

          {/* Results Display */}
          {result && (
            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-semibold text-green-700 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  AI Feedback & Score
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Band Score */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-800 mb-2">Band Score</h4>
                  <div className="text-3xl font-bold text-green-600">
                    {result.score || "7.0"}
                  </div>
                  <p className="text-sm text-green-700 mt-1">IELTS Writing Band Score</p>
                </div>

                {/* Feedback */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Detailed Feedback</h4>
                  <div className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                    {result.feedback || "No detailed feedback available."}
                  </div>
                </div>
              </div>

              {/* Improvement Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">💡 Tips for Improvement</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Aim for 250+ words in your essay</li>
                  <li>• Use a variety of sentence structures and vocabulary</li>
                  <li>• Make sure to address all parts of the question</li>
                  <li>• Use linking words to connect your ideas</li>
                  <li>• Check grammar and spelling carefully</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WritingTest;
