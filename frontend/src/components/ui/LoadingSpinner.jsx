import React from "react";

const LoadingSpinner = ({
  size = "medium",
  color = "orange",
  fullScreen = false,
}) => {
  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    orange: "border-orange-600",
    white: "border-white",
    gray: "border-gray-600",
    blue: "border-blue-600",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} border-4 border-t-transparent rounded-full animate-spin`}
      />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
