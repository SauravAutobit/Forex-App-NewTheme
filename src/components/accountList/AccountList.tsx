import { useState } from "react";
import RadioButton from "../radioButton/RadioButton";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { switchAccount } from "../../store/slices/authSlice";
import MultiAccountModal from "../multiAccountModal/MultiAccountModal";
import { store } from "../../store/store";
import { reinitializeSockets } from "../../services/socketService";
import { showToasty } from "../../store/slices/notificationSlice";
import { resetAllDataSlices } from "../../utils/dataUtils";

const AccountList = () => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  const { accounts, user } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();

  const toggleDetails = () => {
    setIsDetailsVisible((s) => !s);
  };

  const handleCardClick = () => {
    toggleDetails();
  };

  const handleSwitchAccount = (username: string) => {
    dispatch(switchAccount(username));
    // Clear old data first
    resetAllDataSlices(dispatch);
    // Reinitialize sockets with the new account's token
    reinitializeSockets(store);
    dispatch(
      showToasty({
        type: "success",
        message: "Login Successfully!",
      }),
    );
  };

  // If no user is logged in, or accounts list is empty, handle gracefully (though Sidebar usually requires login)
  if (!user) return null;

  return (
    <>
      <div className="flex flex-col items-center text-primary">
        <div className="w-full cursor-pointer" onClick={handleCardClick}>
          <div className="flex items-center justify-between py-3 px-4">
            <div>
              <div className="font-secondary">Trading Account</div>
              <div className="text-secondary">{user.username}</div>
            </div>

            {!isDetailsVisible ? (
              <div
                className={`${
                  theme === "dark" ? "text-quaternary" : "text-primary"
                } text-xs`}
              >
                Switch Account
              </div>
            ) : (
              <div
                className="w-[109px] h-[27px] rounded-[6px] bg-quaternary text-xs text-tertiary flex items-center justify-center cursor-pointer"
                style={{ color: "#0C0C0C" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddAccountModal(true);
                }}
              >
                Add Another A/C
              </div>
            )}
          </div>
        </div>

        {/* COLLAPSIBLE SECTION*/}
        <div
          className={`
                  w-full grid transition-all duration-300 ease-in-out
                  ${
                    isDetailsVisible
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }
                `}
        >
          <div className="overflow-hidden">
            <div className={`w-full flex flex-col gap-[10px] pb-3`}>
              <div className="flex flex-col gap-5 bg-cardBg rounded-10 py-4 px-4">
                {accounts.map((acc, index) => (
                  <div
                    key={acc.username + index} // Use username as key
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleSwitchAccount(acc.username)}
                  >
                    <div className="flex items-center gap-2.5">
                      <RadioButton
                        isChecked={user.username === acc.username}
                        onClick={() => handleSwitchAccount(acc.username)}
                      />
                      <span className="font-secondary pl-1.5">Account</span>
                      <div
                        className={`w-[62px] h-[19px] flex items-center justify-center rounded-10 text-xs ${
                          "bg-[#AEED09] text-[#2D2D2D]"
                          // You can add logic for "Demo" type if you store it in User object
                        }`}
                      >
                        Real{" "}
                        {/* Defaulting to Real for now as type isn't in User interface yet */}
                      </div>
                    </div>

                    <span className="text-secondary">{acc.username}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddAccountModal && (
        <MultiAccountModal onClose={() => setShowAddAccountModal(false)} />
      )}
    </>
  );
};

export default AccountList;
