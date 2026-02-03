import EditOrderList from "../../components/editOrderList/EditOrderList";

import type { Instrument } from "../../store/slices/instrumentsSlice";

interface InfoProps {
  instrument: Instrument | null;
}

const Info = ({ instrument }: InfoProps) => {
  const staticData = instrument?.static_data || {};

  // Utility to format keys (e.g., "lot_size" or "lot size" -> "Lot Size")
  const formatLabel = (key: string) => {
    return key
      .split(/_|\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const balanceItems = Object.entries(staticData)
    // Filter out description/info if you want to show it separately
    .filter(([key]) => key !== "info")
    .map(([key, value]) => {
      let displayValue = String(value);

      // Special formatting for known monetary or percentage types if needed,
      // but keeping it generic as requested.
      if (key.toLowerCase().includes("price") && !isNaN(Number(value))) {
        displayValue = `$${Number(value).toFixed(2)}`;
      } else if (
        key.toLowerCase().includes("percentage") &&
        !displayValue.includes("%")
      ) {
        displayValue = `${displayValue}%`;
      }

      return {
        label: formatLabel(key),
        value: displayValue,
      };
    });

  return (
    <div className="mt-5 overflow-auto">
      <div className="flex flex-col justify-between h-full">
        <div className="px-5 flex flex-col gap-5">
          <div className="text-[26px] font-secondary text-primary">
            {instrument?.name || "Unknown Instrument"}
          </div>
          <p className="text-secondary text-sm">
            {String(
              staticData["info"] ||
                staticData["description"] ||
                "No description available for this instrument.",
            )}
          </p>
          <div className="mb-2.5">
            <EditOrderList balanceItems={balanceItems} fontWeight={600} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
