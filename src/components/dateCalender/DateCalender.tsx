import "./DateCalender.css";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../button/Button";
import { useAppSelector } from "../../store/hook";

interface DateCalenderProps {
  activeTab: string;
}

const DateCalender = ({ activeTab }: DateCalenderProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");

  const dateFilters =
    activeTab === "date"
      ? ["Last 1 day", "Last 7 days", "Last 14 days"]
      : ["Last 1 month", "Last 3 months"];

  const theme = useAppSelector((state) => state.theme.mode);

  return (
    // h-[429.83px]
    <div
      className={`w-[325px] rounded-20 p-5 flex flex-col items-center ${
        theme === "dark" ? "bg-[#181818]" : "bg-[#E5E5E5]"
      }`}
    >
      <div
        className={`${
          activeTab === "date" ? "w-full" : "gap-1"
        } flex items-center justify-between mb-[40px]`}
      >
        {dateFilters.map((label) => (
          <span
            key={label}
            className={`flex items-center justify-center rounded-[4px] ${
              activeTab === "date" ? "w-[89.35px]" : "w-[116.2px]"
            } h-[28.96px] font-tertiary text-sm ${
              selectedTab === label ? "bg-[#AEED09] text-[#2D2D2D]" : ""
            }`}
            onClick={() => setSelectedTab(label)}
          >
            {label}
          </span>
        ))}
      </div>
      <DatePicker
        className="calender"
        selected={selectedDate}
        onChange={(date: Date | null) => {
          if (!date) return;
          setSelectedDate(date);
          // setShowCalendar(false);

          const startOfDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0,
            0,
            0,
            0
          );
          const ts = Math.floor(startOfDay.getTime() / 1000);

          console.log("ts", ts);
          // Dispatch the same timestamp to all three history thunks:
          // dispatch(fetchHistoryPositions(ts));
          // dispatch(fetchDeals(ts));
          // dispatch(fetchHistoryOrders(ts));
        }}
        inline
      />
      <div className="w-full flex items-center justify-between mt-3 mb-2.5">
        <Button
          label="Cancel"
          width="130.86px"
          height="42.36px"
          bgColor="#2D2D2D"
          textColor="#FAFAFA"
          border="1px solid #2D2D2D"
          fontSize="16px"
          fontWeight={600}
        />
        <Button 
          label="Apply"
          width="130.86px"
          height="42.36px"
          bgColor="#AEED09"
          textColor="#2D2D2D"
          fontSize="16px"
          fontWeight={600}
        />
      </div>
    </div>
  );
};

export default DateCalender;
