import React from "react";

interface CustomRadioProps {
  checked: boolean;
  size?: "sm" | "md"; // sm = 12px (w-3), md = 16px (w-4)
  className?: string; // Allow custom classes like 'text-nude'
}

export const CustomRadio: React.FC<CustomRadioProps> = ({
  checked,
  size = "md",
  className = "text-nude",
}) => {
  const sizeClass = size === "sm" ? "w-3 h-3" : "w-4 h-4"; // Adjusted sizes as requested (sm for schedule)

  if (checked) {
    // FILLED DOT SVG
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} transition-all duration-200`}
      >
        <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
        <circle cx="8" cy="8" r="4" fill="currentColor" />
      </svg>
    );
  }

  // EMPTY DOT SVG
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClass} ${className} opacity-50 hover:opacity-100 transition-all duration-200`}
    >
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
    </svg>
  );
};
