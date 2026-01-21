// NEW
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../button/Button";
import "./DateCalender.css";
import "./DateCalenderModal.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import leftArrow from "../../assets/icons/leftArrow.svg";
import leftArrowBlack from "../../assets/icons/leftArrowBlack.svg";


interface DateCalenderProps {
  activeTab: string;
  isOpen: boolean;
  onClose: () => void;
  initialStartDate: Date;
  initialEndDate: Date | null;
  onApply: (start: Date, end: Date | null, weekIndex?: number) => void;
  showMonthYearPicker?: boolean;
}

export const getWeeksInMonth = (date: Date) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const weeks = [];
  let currentStart = new Date(startOfMonth);

  while (currentStart <= endOfMonth) {
    const dayOfWeek = currentStart.getDay();
    // In JS getDay(): 0:Sun, 1:Mon, ..., 6:Sat.
    // We want Monday-started weeks: Mon-Sun.
    // If it's Monday(1), diff to Sunday is 6.
    // If it's Sunday(0), diff to Sunday is 0.
    const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    let currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + diffToSunday);

    if (currentEnd > endOfMonth) {
      currentEnd = new Date(endOfMonth);
    }

    weeks.push({
      start: new Date(currentStart),
      end: new Date(currentEnd),
    });

    currentStart = new Date(currentEnd);
    currentStart.setDate(currentEnd.getDate() + 1);
  }
  return weeks;
};

const DateCalender: React.FC<DateCalenderProps> = ({
  isOpen,
  onClose,
  initialStartDate,
  initialEndDate, // Added initialEndDate here
  onApply,
  showMonthYearPicker = false,
  activeTab,
}) => {
  const [tempStartDate, setTempStartDate] = useState<Date>(initialStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [tempWeekIndex, setTempWeekIndex] = useState<number | undefined>(
    undefined,
  );
  const [navDate, setNavDate] = useState<Date>(new Date(initialStartDate));

  const theme = useSelector((state: RootState) => state.theme.mode);

  // Reset local state when modal opens or initial date changes
  useEffect(() => {
    if (isOpen) {
      setTempStartDate(initialStartDate);
      setTempEndDate(initialEndDate);
      setNavDate(new Date(initialStartDate));
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  if (!isOpen) return null;

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setTempStartDate(date);
    if (activeTab === "monthly") {
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      setTempEndDate(end);
    } else {
      setTempEndDate(null);
    }
  };  

  const handleApplyClick = () => {
    onApply(tempStartDate, tempEndDate, tempWeekIndex);
    onClose();
  };
  return (
    <div className="date-modal-overlay" onClick={onClose}>
      <div className="date-modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            // width: "375px",
            // backgroundColor: "var(--tabs-searchbar-bg-color)",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "430px", // Fixed height to handle 6-week months stably
            justifyContent: "space-between", // Keeps Apply/Cancel at bottom
          }}
          className={`${theme === "dark" ? "bg-[#181818]" : "bg-[#E5E5E5]"}`}
        >
          <div
            className="calendar-content-area"
            style={{
              width: "100%",
              // flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {activeTab === "weekly" ? (
              <div className="weekly-picker-container">
                <div className="weekly-picker-header">
                  <button
                    className="nav-btn"
                    onClick={() =>
                      setNavDate(
                        (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
                      )
                    }
                  >
                    <img src={leftArrowBlack} alt="prev" />
                  </button>
                  <div className="nav-title">
                    {navDate.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <button
                    className="nav-btn"
                    onClick={() =>
                      setNavDate(
                        (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
                      )
                    }
                  >
                    <img
                      src={leftArrowBlack}
                      alt="next"
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </button>
                </div>
                <div className="weeks-grid">
                  {getWeeksInMonth(navDate).map((w, idx) => {
                    const isSelected =
                      tempStartDate.getTime() === w.start.getTime() &&
                      tempEndDate?.getTime() === w.end.getTime();
                    return (
                      <button
                        key={idx}
                        className={`week-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setTempStartDate(w.start);
                          setTempEndDate(w.end);
                          setTempWeekIndex(idx + 1);
                        }}
                      >
                        Week {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <DatePicker
                className="calender"
                selected={tempStartDate}
                onChange={(d) => handleDateChange(d as Date | null)}
                inline
                showMonthYearPicker={showMonthYearPicker}
                dateFormat={showMonthYearPicker ? "MM/yyyy" : "dd/MM/yyyy"}
                calendarStartDay={1} // Monday start
                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div
                    className="weekly-picker-header"
                    style={{ padding: "0 10px", marginBottom: "20px" }}
                  >
                    <button
                      className="nav-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        decreaseMonth();
                      }}
                      disabled={prevMonthButtonDisabled}
                    >
                      <img src={leftArrowBlack} alt="prev" />
                    </button>
                    <div className="nav-title">
                      {date.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <button
                      className="nav-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        increaseMonth();
                      }}
                      disabled={nextMonthButtonDisabled}
                    >
                      <img
                        src={leftArrowBlack}
                        alt="next"
                        style={{ transform: "rotate(180deg)" }}
                      />
                    </button>
                  </div>
                )}
              />
            )}
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              justifyContent: "center",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
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
              // bgColor={theme === "dark" ? "#E42D4E" : "#043a73"}
              // textColor={theme === "dark" ? "#2D2D2D" : "#FAFAFA"}
              onClick={handleApplyClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateCalender;
