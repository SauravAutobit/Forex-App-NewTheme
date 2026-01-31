import OrderButtons from "../orderButtons/OrderButtons";

interface NewOrderButtonsProps {
  metrics: {
    usedMargin: number;
    freeMargin: number;
  };
  instrumentId: string | null;
  selectedOrderType: "market" | "limit" | "stop";
  contractSize: number | null;
  selectedLot: number;
  orderPrice: number | null;
  stoploss: number;
  target: number;
  mode: "newOrder" | "closePosition" | "modifyPosition";
  originalSide?: "buy" | "sell";
  positionIdToClose?: string;
}

const NewOrderButtons = ({
  metrics,
  instrumentId,
  selectedOrderType,
  contractSize,
  selectedLot,
  orderPrice,
  stoploss,
  target,
  mode,
  originalSide,
  positionIdToClose,
}: NewOrderButtonsProps) => {
  return (
    <div className="w-full px-5">
      <div className="flex items-center justify-between text-secondary text-sm">
        Required margin/Free margin
        <span>
          {metrics.usedMargin.toFixed(2)} /
          <span
            className={metrics.freeMargin < 0 ? "text-loss" : "text-profit"}
          >
            {metrics.freeMargin.toFixed(2)}
          </span>
        </span>
      </div>
      <OrderButtons
        instrumentId={instrumentId || null}
        selectedOrderType={selectedOrderType}
        contractSize={contractSize}
        selectedLot={selectedLot}
        orderPrice={orderPrice}
        stoploss={stoploss}
        target={target}
        mode={mode}
        originalSide={originalSide}
        positionIdToClose={positionIdToClose}
      />
    </div>
  );
};

export default NewOrderButtons;
