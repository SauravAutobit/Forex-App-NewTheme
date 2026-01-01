// src/components/toasty/Toasty.tsx
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { hideToasty } from "../../store/slices/notificationSlice"; // <-- Import hideToasty

type ToastyProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUndo?: (payload: any) => void;
};

const Toasty = ({ onUndo }: ToastyProps) => {
  const dispatch = useDispatch();
  const { data } = useSelector((state: RootState) => state.notification);

  if (!data) return null;

  const handleClose = () => {
    dispatch(hideToasty());
  };

  // ✅ UNDO MODE
  if (data.type === "undo") {
    return (
      <div
        className="flex items-center justify-center w-full px-4"
        onClick={(e) => {
          // If clicking the undo button, don't close immediately?
          // Actually requirement says "if user click on undo then it will be add agian".
          // We can let handleUndo manage the close.
          e.stopPropagation();
        }}
      >
        <div className="w-[261px] max-sm:w-[261px] bg-[#AEED09] text-[#2D2D2D] border border-[#AEED09] rounded-[40px] h-[48px] px-6 flex items-center justify-between shadow-lg">
          <span className="font-tertiary text-[14px] font-[400]">
            {data.message || "Instrument removed"}
          </span>
          <button
            className="font-tertiary text-[14px] font-[600] uppercase"
            onClick={(e) => {
              e.stopPropagation();
              if (onUndo && data.undoPayload) {
                onUndo(data.undoPayload);
              }
            }}
          >
            UNDO
          </button>
        </div>
      </div>
    );
  }

  // ✅ TRADE MODE (Default)

  return (
    <div
      className="flex items-center justify-center w-full px-4"
      onClick={handleClose}
    >
      <div className="w-[261px] max-sm:w-full bg-[#AEED09] text-[#2D2D2D] border border-[#AEED09] rounded-[40px] h-[44px] p-2.5 flex items-center justify-between gap-3 shadow-lg">
        <span className="font-tertiary font-bold">{data.instrumentName}</span>
        {/* ${sideColor} */}
        <span className={`font-bold capitalize`}>{data.side}</span>
        <span className="font-secondary">
          {data.quantity} @ {data.price?.toFixed(5)}
        </span>
        <span className="font-secondary font-bold capitalize text-sm">
          {data.status}
        </span>
      </div>
    </div>
  );
};

export default Toasty;
