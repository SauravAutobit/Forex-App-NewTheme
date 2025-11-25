import { useAppSelector } from "../../store/hook";

interface DateChangerProps {
  text: string;
  date: string;
  dualDate?: boolean;
  secondaryText?: string;
  secondaryDate?: string;
  height?: string;
}

const DateChanger = ({
  text,
  date,
  dualDate = false,
  secondaryText,
  secondaryDate,
  height = "41px",
}: DateChangerProps) => {
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div
      className={
        "bg-cardBg  my-2.5 py-2.5 px-5 rounded-10 flex flex-col items-center justify-between"
      }
      style={{ height }}
    >
      <div className="w-full flex items-center justify-between">
        <p className="text-sm text-secondary">{text}</p>
        <p
          className={`font-secondary ${
            theme === "dark" ? "text-quaternary" : "text-primary"
          }`}
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
          >
            {secondaryDate}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateChanger;
