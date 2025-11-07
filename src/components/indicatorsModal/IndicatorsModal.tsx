import React from "react";

interface IndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const IndicatorsModal: React.FC<IndicatorsModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  // Use the `modal-open` class conditionally to show/hide the modal
  const modalClass = isOpen ? "modal modal-open" : "modal";

  return (
    <div className={modalClass}>
      <div className="modal-box text-primary">
        <h3 className="font-bold text-lg">Chart Settings & Indicators</h3>
        <p className="py-2">Toggle indicators and chart display types.</p>
        <div className="divider" />
        <div
          className="max-h-64 overflow-y-auto pr-4"
          style={{ scrollbarWidth: "none" }}
        >
          {children}
        </div>
        <div className="modal-action">
          <button onClick={onClose} className="btn bg-profit">
            Done
          </button>
        </div>
      </div>
      {/* Optional: Add a backdrop that closes the modal on click */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default IndicatorsModal;
