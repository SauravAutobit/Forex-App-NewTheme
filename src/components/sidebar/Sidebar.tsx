import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// import logo from "../../assets/icons/logo.svg";
// import logoLight from "../../assets/icons/logoLight.svg";
// import lightAiStar from "../../assets/icons/lightAiStar.svg";
import profileSidebar from "../../assets/icons/profileSidebar.svg";
// import Theme from "../theme/Theme";
// import { useAppSelector } from "../../store/hook";
import avatar from "../../assets/icons/avatar.jpg";
import Button from "../button/Button";
import AccountList from "../accountList/AccountList";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  //   const theme = useAppSelector((state) => state.theme.mode);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.25 }}
        className="fixed top-0 left-0 h-full w-[20rem] z-[60] bg-primaryBg shadow-lg px-2.5 pt-[57px] pb-2.5 flex flex-col justify-between"
        style={{ zIndex: 2000 }}
      >
        <div>
          <div className="py-3 px-4 flex items-center gap-3">
            <img
              src={avatar}
              alt="avatar"
              className="rounded-[200px] w-[40px] h-[40px]"
            />
            <div
              className="w-[20px] h-[20px] bg-[#12B76A] rounded-[50px]"
              style={{
                border: "3.5px solid #FFFFFF",
                position: "relative",
                top: "13px",
                right: "24px",
              }}
            ></div>
            <div className="font-secondary">Olivia Rhye</div>
          </div>

          <AccountList />

          <div className="flex items-center justify-between pb-2.5">
            <Button
              label="Trade"
              border="1px solid #AEED09"
              bgColor="inherit"
              textColor="#AEED09"
            />

            <Button label="Deposit" />
          </div>

          <div>
            {Array.from({ length: 8 }).map((_, index) => {
              return (
                <button
                  key={index}
                  onClick={() => {
                    onClose();
                    navigate("/ai");
                  }}
                  className="w-full text-left py-2.5 px-4 rounded hover:bg-gray-800 flex items-center gap-3 text-primary"
                >
                  {/* <img src={theme === "dark" ? aiStar : lightAiStar} alt="aiStar" /> */}
                  <img src={profileSidebar} alt="profileSidebar" />
                  View profile
                </button>
              );
            })}
          </div>
        </div>

        <div>{/* <Theme /> */}</div>
        {/* <div
          className="flex flex-col items-center justify-between"
          // style={{ padding: "12px 16px 13px 16px" }}
        >
          <p className="text-[8px]">Powered by</p>
          <img src={logo} alt="logo" />
        </div> */}
      </motion.aside>
    </>
  );
}
