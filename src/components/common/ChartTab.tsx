interface ChartTabProps {
  selectedYear: 2023 | 2024 | 2025 | 2026;
  onYearChange: (year: 2023 | 2024 | 2025 | 2026) => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ selectedYear, onYearChange }) => {
  const getButtonClass = (year: number) =>
    selectedYear === year
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => onYearChange(2023)}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          2023
        )}`}
      >
        2023
      </button>

      <button
        onClick={() => onYearChange(2024)}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          2024
        )}`}
      >
        2024
      </button>

      <button
        onClick={() => onYearChange(2025)}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          2025
        )}`}
      >
        2025
      </button>

      <button
        onClick={() => onYearChange(2026)}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          2026
        )}`}
      >
        2026
      </button>
    </div>
  );
};

export default ChartTab;
