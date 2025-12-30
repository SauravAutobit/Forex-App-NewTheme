import { useAppSelector } from "../../store/hook";

interface DateChangerProps {
  text: string;
  date: string;
  dualDate?: boolean;
  secondaryText?: string;
  secondaryDate?: string;
  height?: string;
  onOpen?: () => void;
  width?: string;
}

const DateChanger = ({
  text,
  date,
  dualDate = false,
  secondaryText,
  secondaryDate,
  height = "41px",
  onOpen,
  width,
}: DateChangerProps) => {
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div
      className={
        "bg-cardBg py-2.5 px-5 rounded-10 flex flex-col items-center justify-between cursor-pointer"
      }
      style={{ height }}
      onClick={onOpen}
    >
      <div className="w-full flex items-center justify-between">
        <p className="text-sm text-secondary">{text}</p>
        <p
          className={`font-secondary ${
            theme === "dark" ? "text-quaternary" : "text-primary"
          }`}
          style={{ width }}
        >
          {date}
        </p>
      </div>
      {dualDate && (
        <div className="w-full flex items-center justify-between mt-1">
          <p className="text-sm text-secondary">{secondaryText}</p>
          <p
            className={`font-secondary ${
              theme === "dark" ? "text-quaternary" : "text-primary"
            }`}
            style={{ width }}
          >
            {secondaryDate}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateChanger;
