import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { loginUser, clearError } from "../../store/slices/authSlice";
import eye from "../../assets/icons/eye.svg";
import Checkbox from "../checbox/Checbox";

interface MultiAccountModalProps {
  onClose: () => void;
}

const MultiAccountModal: React.FC<MultiAccountModalProps> = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const authError = useAppSelector((state) => state.auth.error);
  const status = useAppSelector((state) => state.auth.status);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    try {
      const result = await dispatch(loginUser({ username, password }));

      if (loginUser.fulfilled.match(result)) {
        // Success
        onClose();
      } else {
        // Error
        setError((result.payload as string) || "Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    // Clear error when user starts typing
    if (error || authError) {
      setError(null);
      dispatch(clearError());
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (error || authError) {
      setError(null);
      dispatch(clearError());
    }
  };

  const [activeOptions, setActiveOptions] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm p-5 rounded-lg bg-cardBg w-[353px]
          border border-[#3D3D3D] shadow-xl relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <div className="text-[22px] font-[700] text-primary">
              Add Another Account
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-tertiary text-primary">Username</label>
            <input
              type="text"
              placeholder="Enter Username"
              className={`w-full p-3 rounded-lg bg-primaryBg border border-[#3D3D3D] focus:outline-none placeholder-placeholder text-primary ${
                error ? "border-red-500 text-red-500" : ""
              }`}
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-tertiary text-primary">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className={`w-full p-3 pr-10 rounded-lg bg-primaryBg border border-[#3D3D3D] focus:outline-none placeholder-placeholder text-primary ${
                  error ? "border-red-500 text-red-500" : ""
                }`}
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img src={eye} alt="toggle password visibility" />
              </span>
            </div>
          </div>

          <div className="flex justify-end text-sm">
            <a href="#" className="text-quaternary">
              Forgot Password?
            </a>
          </div>
          {error && <div className="text-red-500">{error}</div>}

          <div className="flex items-center gap-2 text-primary">
            <Checkbox
              isChecked={activeOptions}
              onClick={() => setActiveOptions(!activeOptions)}
            />
            Keep me signed in
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className={`w-full p-3 rounded-10 bg-quaternary font-secondary ${
              status === "loading" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            // style={{ color: theme === "dark" ? "#303030" : "#FAFAFA" }}
            style={{ color: "#0C0C0C" }}
          >
            {status === "loading" ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MultiAccountModal;
