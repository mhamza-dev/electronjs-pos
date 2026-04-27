// components/ui/Card.tsx
import React from "react";

interface CardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  description?: string;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  value,
  icon,
  trend,
  description,
  className = "",
  onClick,
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                  p-5 transition-shadow hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {/* Header with icon */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        {icon && (
          <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-100/10 text-primary-600 dark:text-primary-400">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-1">
        {value !== undefined && (
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
        )}
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
};

export default Card;
