import React, { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const AIDescriptionGenerator = ({
  dishName,
  category,
  spiceLevel,
  price,
  onDescriptionGenerated,
}) => {
  const [loading, setLoading] = useState(false);

  const generateDescription = async () => {
    if (!dishName) {
      toast.error("Please enter dish name first");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post(
        "/v1/food/generate-description",
        {
          name: dishName,
          category,
          spiceLevel,
          price,
        },
      );

      if (data.success && data.data) {
        onDescriptionGenerated({
          description: data.data.description,
          tags: data.data.tags,
          allergens: data.data.allergens,
          serves: data.data.serves,
          bestFor: data.data.bestFor,
        });
        toast.success("AI description generated!");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate description",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={generateDescription}
      disabled={loading || !dishName}
      className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <SparklesIcon className="w-4 h-4" />
      )}
      {loading ? "Generating..." : "Generate with AI"}
    </button>
  );
};

export default AIDescriptionGenerator;
