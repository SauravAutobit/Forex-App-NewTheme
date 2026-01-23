import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// import logo from "../../assets/icons/logo.svg";
// import logoLight from "../../assets/icons/logoLight.svg";
// import lightAiStar from "../../assets/icons/lightAiStar.svg";
import Theme from "../theme/Theme";
// import { useAppSelector } from "../../store/hook";
import Button from "../button/Button";
import AccountList from "../accountList/AccountList";
import { useAppSelector } from "../../store/hook";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import logoutIcon from "../../assets/icons/logout.svg";
import logoutLight from "../../assets/icons/logoutLight.svg";
import lightAiStar from "../../assets/icons/lightAiStar.svg";
import aiStar from "../../assets/icons/aiStar.svg";
import { useState } from "react";
import Logout from "../logout/Logout";
import { logoutCurrentAccount } from "../../store/slices/authSlice";
import { store } from "../../store/store";
import { reinitializeSockets } from "../../services/socketService";
import { resetAllDataSlices } from "../../utils/dataUtils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const theme = useAppSelector((state) => state.theme.mode);
  const { user } = useAppSelector((state) => state.auth);

  const [showLogout, setShowLogout] = useState(false);

  const handleLogoutConfirm = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await dispatch(logoutCurrentAccount()).unwrap()) as any;
    setShowLogout(false);
    onClose();

    if (result) {
      // Clear old data first
      resetAllDataSlices(dispatch);
      // A new user is active, re-initialize sockets
      reinitializeSockets(store);
      // Navigate to home to ensure fresh state, or stay depending on UX preference
      navigate("/app/home");
    } else {
      // No active user, redirect to login
      navigate("/");
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
      )}

      {/* Logout Overlay */}
      {showLogout && (
        <div className="fixed inset-0 z-[2100] bg-black/60 flex items-center justify-center">
          <Logout
            onConfirm={handleLogoutConfirm}
            onCancel={() => setShowLogout(false)}
          />
        </div>
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
            <div className="rounded-full w-[40px] h-[40px] bg-quaternary flex items-center justify-center font-tertiary text-[#0c0c0c] text-lg">
              {user?.username ? user.username.charAt(0).toUpperCase() : "G"}
            </div>
            <div
              className="w-[20px] h-[20px] bg-[#12B76A] rounded-[50px]"
              style={{
                border: "3.5px solid #FFFFFF",
                position: "relative",
                top: "13px",
                right: "24px",
              }}
            ></div>
            <div className="font-secondary text-primary">
              {user?.username || "Guest User"}
            </div>
          </div>

          <AccountList />

          <div className="flex items-center justify-between pb-2.5">
            <Button
              label="Trade"
              border={theme === "dark" ? "1px solid #AEED09" : ""}
              bgColor="inherit"
              textColor={theme === "dark" ? "#AEED09" : "#2D2D2D"}
              boxShadow={theme === "dark" ? "" : "0px 2px 4px 0px #00000040"}
            />

            <Button label="Deposit" textColor="#2D2D2D" />
          </div>

          <div>
            <Theme />
          </div>
          <button
            onClick={() => {
              onClose();
              navigate("/ai");
            }}
            className="w-full text-left py-2.5 px-4 rounded flex items-center gap-3 text-primary"
          >
            <img src={theme === "dark" ? aiStar : lightAiStar} alt="aiStar" />
            Fintrabit AI
          </button>
          <button
            onClick={() => setShowLogout(true)}
            className="w-full text-left py-2.5 px-4 rounded flex items-center gap-3 text-primary"
          >
            <img
              src={theme === "dark" ? logoutIcon : logoutLight}
              alt="logout"
            />
            Logout
          </button>
        </div>

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
