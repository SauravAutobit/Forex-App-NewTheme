import logoutCross from "../../assets/icons/logoutCross.svg";
import Button from "../button/Button";

const Logout = () => {
  return (
    <div className="flex flex-col gap-5 bg-[#181818] w-[319px]  rounded-10 p-2.5">
      <div className="flex justify-end">
        <img src={logoutCross} alt="logoutCross" />
      </div>
      <div className="font-[700] text-[17px] leading-[27px] text-center">
        Are you sure
        <p className="font-primary text-primary">
          you want to end this sessions?
        </p>
      </div>
      <div className="w-full flex items-center justify-between mt-3 mb-2.5">
        <Button
          label="Cancel"
          width="144.5px"
          height="41px"
          bgColor="#181818"
          textColor="#AEED09"
          fontWeight={500}
        />
        <Button
          label="Log out"
          width="144.5px"
          height="41px"
          bgColor="#AEED09"
          textColor="#2D2D2D"
          fontWeight={500}
        />
      </div>
    </div>
  );
};

export default Logout;
