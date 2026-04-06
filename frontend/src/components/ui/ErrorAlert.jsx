import React from "react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/solid";

const ErrorAlert = ({
  message,
  onRetry,
  onClose,
  title = "Error",
  variant = "error",
}) => {
  const variants = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-400",
      button: "bg-red-100 text-red-800 hover:bg-red-200",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-400",
      button: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-400",
      button: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
  };

  const currentVariant = variants[variant] || variants.error;

  return (
    <div
      className={`${currentVariant.bg} ${currentVariant.border} border rounded-lg p-4 shadow-sm`}
    >
      <div className="flex items-start">
        <div className="shrink-0">
          <ExclamationTriangleIcon
            className={`h-5 w-5 ${currentVariant.icon}`}
            aria-hidden="true"
          />
        </div>

        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${currentVariant.text}`}>
            {title}
          </h3>
          <div className={`mt-1 text-sm ${currentVariant.text} opacity-90`}>
            <p>{message || "Something went wrong. Please try again."}</p>
          </div>

          <div className="mt-3 flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${currentVariant.button} transition-colors`}
              >
                Try Again
              </button>
            )}
          </div>
        </div>

        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${currentVariant.button} transition-colors`}
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
