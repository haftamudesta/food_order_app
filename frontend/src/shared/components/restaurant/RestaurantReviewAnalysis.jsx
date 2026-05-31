import React, { useState, useEffect } from "react";
import axiosInstance from "../../../lib/axios";
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const RestaurantReviewAnalysis = ({ restaurantId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data } = await axiosInstance.get(
          `/v1/restaurant/${restaurantId}/reviews/analysis?page=${currentPage}&limit=${reviewsPerPage}`,
        );
        setAnalysis(data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load review analysis",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [restaurantId, currentPage, reviewsPerPage]);

  if (loading) return <LoadingSpinner size="large" />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!analysis) return null;

  const { stats, aiAnalysis, reviews } = analysis;

  const sentimentColors = {
    positive: "bg-green-100 text-green-800",
    negative: "bg-red-100 text-red-800",
    mixed: "bg-yellow-100 text-yellow-800",
    neutral: "bg-gray-100 text-gray-800",
  };

  const sentimentIcons = {
    positive: "😊",
    negative: "😞",
    mixed: "😐",
    neutral: "😐",
  };

  const totalPages = Math.ceil(reviews.total / reviews.limit);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <ChartBarIcon className="w-5 h-5 text-orange-600" />
          AI Review Insights
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${sentimentColors[aiAnalysis.sentiment]}`}
            >
              <span>{sentimentIcons[aiAnalysis.sentiment]}</span>
              {aiAnalysis.sentiment.toUpperCase()} Sentiment
            </span>
            <div className="flex items-center gap-1">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-lg">{stats.averageRating}</span>
              <span className="text-gray-500">
                ({stats.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Key Takeaways
          </h4>
          <ul className="space-y-2">
            {aiAnalysis.summaryBullets.map((point, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-600 flex items-start gap-2"
              >
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {aiAnalysis.topMentions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Top Mentions</h4>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.topMentions.map((mention, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  #{mention}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDistribution[star] || 0;
            const percentage =
              stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm">{star}</span>
                  <StarIcon className="w-3 h-3 text-yellow-500" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-gray-500">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.data && reviews.data.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {reviews.data.map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-medium text-sm">
                        {review.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {review.user?.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 ml-10">{review.comment}</p>
                <p className="text-xs text-gray-400 ml-10 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantReviewAnalysis;
