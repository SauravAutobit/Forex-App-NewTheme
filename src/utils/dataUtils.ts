import type { AppDispatch } from "../store/store";
import { resetAccount } from "../store/slices/accountSlice";
import { resetPositions } from "../store/slices/positionsSlice";
import { resetOpenOrders } from "../store/slices/openOrdersSlice";
import { resetHistoryPositions } from "../store/slices/historyPositionsSlice";
import { resetHistoryOrders } from "../store/slices/historyOrdersSlice";
import { resetDeals } from "../store/slices/dealsSlice";

export const resetAllDataSlices = (dispatch: AppDispatch) => {
  dispatch(resetAccount());
  dispatch(resetPositions());
  dispatch(resetOpenOrders());
  dispatch(resetHistoryPositions());
  dispatch(resetHistoryOrders());
  dispatch(resetDeals());
};
