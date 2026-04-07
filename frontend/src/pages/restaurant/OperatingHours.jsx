import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

const OperatingHours = ({ hours }) => {
  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const getTodayStatus = () => {
    const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const todayHours = hours?.[today.key];

    if (!todayHours) return null;
    if (todayHours.isClosed) return { status: "closed", label: "Closed Today" };

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const isOpenNow =
      currentTime >= todayHours.open && currentTime <= todayHours.close;

    return {
      status: isOpenNow ? "open" : "closed",
      label: isOpenNow ? "Open Now" : "Closed Now",
      hours: `${todayHours.open} - ${todayHours.close}`,
    };
  };

  const todayStatus = getTodayStatus();

  return (
    <div className="space-y-3">
      {todayStatus && (
        <div
          className={`p-3 rounded-lg ${
            todayStatus.status === "open" ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon
                className={`w-5 h-5 ${
                  todayStatus.status === "open"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
              <span
                className={`font-semibold ${
                  todayStatus.status === "open"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {todayStatus.label}
              </span>
            </div>
            {todayStatus.hours && (
              <span className="text-sm text-gray-600">{todayStatus.hours}</span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {days.map((day) => {
          const dayHours = hours?.[day.key];
          if (!dayHours) return null;

          return (
            <div key={day.key} className="flex justify-between text-sm">
              <span className="text-gray-600">{day.label}</span>
              {dayHours.isClosed ? (
                <span className="text-gray-400">Closed</span>
              ) : (
                <span className="text-gray-700">
                  {dayHours.open} - {dayHours.close}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OperatingHours;
