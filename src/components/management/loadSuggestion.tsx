import { useState } from "react";

export default function AISuggestionFeedback({
  onLoadSuggestion,
  onFeedback,
  isLoading,
}: {
  onLoadSuggestion: () => void;
  onFeedback: (helpful: boolean) => void;
  isLoading?: boolean;
}) {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const handleFeedback = (helpful: boolean) => {
    setFeedbackGiven(helpful);
    onFeedback(helpful);
  };

  return (
    <div className="w-full mt-6 p-4 border rounded-lg shadow-sm bg-white space-y-4">
      {/* Load Suggestion Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={onLoadSuggestion}
        className={`w-full py-2 font-medium rounded-md transition
          ${isLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#FFA400] text-white hover:bg-[#e69500] cursor-pointer"}`}
      >
        {isLoading ? "Loading Suggestion..." : "Load AI Suggestion"}
      </button>

      {/* Feedback Section */}
      <div className="flex flex-col items-center space-y-3">
        <span className="text-sm font-medium text-gray-700">
          Was this AI suggestion helpful in resolving the incident?
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleFeedback(true)}
            disabled={feedbackGiven !== null}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${
                feedbackGiven === true
                  ? "bg-green-600 text-white"
                  : "bg-[#2A2A72] text-white hover:bg-[#1f1f5c]"
              }
              ${feedbackGiven !== null ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleFeedback(false)}
            disabled={feedbackGiven !== null}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${
                feedbackGiven === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }
              ${feedbackGiven !== null ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
