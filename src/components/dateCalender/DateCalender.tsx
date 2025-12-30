// NEW
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../button/Button";
import "./DateCalender.css";
import "./DateCalenderModal.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface DateCalenderProps {
  activeTab: string;
  isOpen: boolean;
  onClose: () => void;
  initialStartDate: Date;
  initialEndDate: Date | null;
  onApply: (start: Date, end: Date | null) => void;
  showMonthYearPicker?: boolean;
}

const DateCalender: React.FC<DateCalenderProps> = ({
  activeTab,
  isOpen,
  onClose,
  initialStartDate,
  onApply,
  showMonthYearPicker = false,
}) => {
  const [tempStartDate, setTempStartDate] = useState<Date>(initialStartDate);
  const [selectedTab, setSelectedTab] = useState("");

  const theme = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    if (isOpen) {
      setTempStartDate(initialStartDate);
    }
  }, [isOpen, initialStartDate]);

  if (!isOpen) return null;

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setTempStartDate(date);
  };

  const handleApplyClick = () => {
    onApply(tempStartDate, null);
    onClose();
  };

  return (
    <div className="date-modal-overlay" onClick={onClose}>
      <div className="date-modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          className={`w-[325px] rounded-20 p-5 flex flex-col items-center ${
            theme === "dark" ? "bg-[#181818]" : "bg-[#E5E5E5]"
          }`}
        >
          <DatePicker
            className="calender"
            selected={tempStartDate}
            onChange={(d) => handleDateChange(d as Date | null)}
            inline
            showMonthYearPicker={showMonthYearPicker}
            dateFormat={showMonthYearPicker ? "MM/yyyy" : "dd/MM/yyyy"}
          />

          <div className="w-full flex items-center justify-between mt-3 mb-2.5">
            <Button
              label="Cancel"
              width="130.86px"
              height="42.36px"
              bgColor={theme === "dark" ? "#2D2D2D" : "#DBDBDB"}
              textColor={theme === "dark" ? "#FAFAFA" : "#1E1E1E"}
              border={theme === "dark" ? "1px solid #2D2D2D" : "none"}
              fontSize="16px"
              fontWeight={600}
              onClick={onClose}
            />
            <Button
              label="Apply"
              width="130.86px"
              height="42.36px"
              bgColor="#AEED09"
              textColor="#2D2D2D"
              fontSize="16px"
              fontWeight={600}
              onClick={handleApplyClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateCalender;
