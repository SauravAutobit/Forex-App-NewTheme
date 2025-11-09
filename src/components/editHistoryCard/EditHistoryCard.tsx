import cardIcon from "../../assets/icons/cardIcon.svg";
import type { CardProps } from "../marketCard/MarketCard";

const EditHistoryCard = ({ code, onClick, border = true }: CardProps) => {
  return (
    <div
      className={`text-primary py-2.5 px-5 ${
        border === true ? "border-b border-primary" : ""
      }`}
      onClick={onClick}
      //   style={{ border: theme === "dark" ? "" : "1px solid #C2C2C2" }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <img src={cardIcon} alt="cardIcon" />
          {/* Left Side: Title and Change */}

          <div>
            <h2 className="my-1 font-secondary">{code.toUpperCase()}</h2>
            <div>Position ID 589658965</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHistoryCard;
