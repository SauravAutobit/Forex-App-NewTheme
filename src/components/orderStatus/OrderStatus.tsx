import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { XCircle, Loader } from "lucide-react";
import type { RootState } from "../../store/store";
import { resetOrderStatus } from "../../store/slices/orderStatusSlice";

import success from "../../assets/sounds/success.mp3";
import failure from "../../assets/sounds/failure.mp3";
import successOrder from "../../assets/icons/successOrder.svg";

const successSound = new Audio(success);
const failureSound = new Audio(failure);

const OrderStatus: React.FC = () => {
  const dispatch = useDispatch();
  const { status, message } = useSelector(
    (state: RootState) => state.orderStatus
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (status === "succeeded" || status === "failed") {
      // Play sound
      if (status === "succeeded") {
        successSound.play();
      } else {
        failureSound.play();
      }

      // Auto-dismiss after 2 seconds
      timer = setTimeout(() => {
        dispatch(resetOrderStatus());
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [status, dispatch]);

  if (status === "idle") {
    return null;
  }

  // Allow clicking anywhere to dismiss immediately
  const handleDismiss = () => {
    if (status !== "loading") {
      dispatch(resetOrderStatus());
    }
  };

  return (
    <div
      // Full-screen, opaque overlay
      className="fixed inset-0 flex flex-col items-center justify-center bg-primaryBg z-[60] text-white transition-opacity duration-300"
      onClick={handleDismiss}
    >
      {/* Inner container for icon and text */}
      <div className="flex flex-col items-center space-y-4 pointer-events-none">
        {/* Status-based icon */}
        {status === "loading" && (
          <Loader className="h-24 w-24 animate-spin text-primary" />
        )}
        {status === "succeeded" && (
          <img src={successOrder} alt="successOrder" />
        )}
        {status === "failed" && <XCircle className="h-24 w-24 text-red-500" />}

        {/* Status text */}
        <div className="text-center mt-6">
          <p className="text-3xl font-bold text-primary">
            {status === "succeeded" && "Done"}
            {status === "failed" && "Failed"}
            {status === "loading" && "Placing Order..."}
          </p>
          {message && (
            <p className="text-xl text-primary mt-2 font-medium">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
