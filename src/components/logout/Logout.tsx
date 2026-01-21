import logoutCross from "../../assets/icons/logoutCross.svg";
import { useAppSelector } from "../../store/hook";
import Button from "../button/Button";

interface LogoutProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const Logout = ({ onConfirm, onCancel }: LogoutProps) => {
  const theme = useAppSelector((state) => state.theme.mode);

  return (
    <div
      className={`flex flex-col gap-5 w-[319px] rounded-10 p-2.5 ${
        theme === "dark" ? "bg-[#181818]" : "bg-[#E5E5E5]"
      }`}
    >
      <div className="flex justify-end">
        <img
          src={logoutCross}
          alt="logoutCross"
          onClick={onCancel}
          className="cursor-pointer"
        />
      </div>
      <div className="text-primary font-[700] text-[17px] leading-[27px] text-center">
        Are you sure
        <p className="font-primary">you want to end this session?</p>
      </div>
      <div className="w-full flex items-center justify-between mt-3 mb-2.5">
        <Button
          label="Cancel"
          width="144.5px"
          height="41px"
          bgColor={theme === "dark" ? "#181818" : "#e5e5e5"}
          textColor={theme === "dark" ? "#AEED09" : "#2D2D2D"}
          fontWeight={500}
          onClick={onCancel}
        />
        <Button
          label="Log out"
          width="144.5px"
          height="41px"
          bgColor="#AEED09"
          textColor="#2D2D2D"
          fontWeight={500}
          boxShadow="0px 2px 4px 0px #00000040"
          onClick={onConfirm}
        />
      </div>
    </div>
  );
};

export default Logout;
