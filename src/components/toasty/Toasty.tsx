// src/components/toasty/Toasty.tsx
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { hideToasty } from "../../store/slices/notificationSlice";
import { useEffect } from "react";

type ToastyProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUndo?: (payload: any) => void;
};

const Toasty = ({ onUndo }: ToastyProps) => {
  const dispatch = useDispatch();
  const { data, isVisible } = useSelector(
    (state: RootState) => state.notification,
  );

  // ✅ Auto-hide logic
  useEffect(() => {
    if (isVisible && data) {
      const timer = setTimeout(() => {
        dispatch(hideToasty());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, data, dispatch]);

  if (!data) return null;

  const handleClose = () => {
    dispatch(hideToasty());
  };

  // ✅ SUCCESS/ERROR/GENERAL MODE
  if (
    data.type === "success" ||
    data.type === "error" ||
    data.type === "warning"
  ) {
    return (
      <div
        className="flex items-center justify-center w-full px-4"
        onClick={handleClose}
      >
        <div
          className={`w-[261px] max-sm:w-[261px] ${data.type === "error" ? "bg-loss" : "bg-[#AEED09]"} text-[#2D2D2D] border border-none rounded-[40px] h-[48px] px-6 flex items-center justify-center shadow-lg`}
        >
          <span className="font-tertiary text-[14px] font-[500] text-center">
            {data.message || (data.type === "success" ? "Success" : "Error")}
          </span>
        </div>
      </div>
    );
  }

  // ✅ UNDO MODE
  if (data.type === "undo") {
    return (
      <div
        className="flex items-center justify-center w-full px-4"
        onClick={(e) => {
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
