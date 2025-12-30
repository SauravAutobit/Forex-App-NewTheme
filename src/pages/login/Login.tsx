import React, { useState, useEffect } from "react";
import logo from "../../assets/icons/logo.svg";
import eye from "../../assets/icons/eye.svg";
import { useNavigate } from "react-router-dom";
import Checkbox from "../../components/checbox/Checbox";
// import logoLight from "../../assets/icons/logoLight.svg";
// import google from "../../assets/icons/google.svg";
// import apple from "../../assets/icons/apple.svg";
// import facebook from "../../assets/icons/facebook.svg";
import NeonGlowBackground from "../../components/neonGlowBackground/NeonGlowBackground";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { loginUser } from "../../store/slices/authSlice";
import { store } from "../../store/store";
import { reinitializeSockets } from "../../services/socketService";
// import appleLight from "../../assets/icons/appleLight.svg";

const Login = () => {
  const [username, setUsername] = useState(""); // Default for testing
  const [password, setPassword] = useState(""); // Default for testing
  const [showPassword, setShowPassword] = useState(false);

  const theme = useAppSelector((state) => state.theme.mode);
  const { status, error, user } = useAppSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // If already logged in, redirect to app
    if (user && status === "succeeded") {
      // Reinitialize sockets with new token
      reinitializeSockets(store);
      navigate("/app");
    }
  }, [user, status, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      dispatch(loginUser({ username, password }));
    }
  };

  const [activeOptions, setActiveOptions] = useState(false);
  return (
    <NeonGlowBackground>
      <div className="pt-[85px] flex items-start justify-center min-h-screen text-white relative z-20">
        <div className="w-full max-w-sm p-4">
          <div className="flex justify-center mb-[50px]">
            <img
              // src={theme === "dark" ? logo : logoLight}
              src={logo}
              alt="Intrabit Logo"
              className="h-10"
            />
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <div className="text-[22px] font-[700] text-primary">
                Welcome back
              </div>
              <p className="text-secondary">
                Enter your credentials to access your account
              </p>
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
                onChange={(e) => setUsername(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
    </NeonGlowBackground>
  );
};

export default Login;
