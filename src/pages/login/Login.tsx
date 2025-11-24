import React, { useState } from "react";
import logo from "../../assets/icons/logo.svg";
import eye from "../../assets/icons/eye.svg";
import { useNavigate } from "react-router-dom";
import Checkbox from "../../components/checbox/Checbox";
// import logoLight from "../../assets/icons/logoLight.svg";
import google from "../../assets/icons/google.svg";
import apple from "../../assets/icons/apple.svg";
import facebook from "../../assets/icons/facebook.svg";
import NeonGlowBackground from "../../components/neonGlowBackground/NeonGlowBackground";
import { useAppSelector } from "../../store/hook";
import appleLight from "../../assets/icons/appleLight.svg";

const Login = () => {
  const [email, setEmail] = useState("asdasd@gmail.com");
  const [password, setPassword] = useState("asdasd");

  const theme = useAppSelector((state) => state.theme.mode);

  const navigate = useNavigate();
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Add login logic here
    console.log("LOGIN");
    navigate("/app");
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
                type="text" // Assuming API takes 'username' (which is the 'email' state here)
                placeholder="Enter Username"
                className={`w-full p-3 rounded-lg bg-primaryBg border border-[#3D3D3D] focus:outline-none placeholder-placeholder text-primary`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-tertiary text-primary">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full p-3 pr-10 rounded-lg bg-primaryBg border border-[#3D3D3D] focus:outline-none placeholder-placeholder text-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                  <img src={eye} alt="eye" />
                </span>
              </div>
            </div>

            <div className="flex justify-end text-sm">
              <a href="#" className="hover:underline text-primary">
                Forgot Password?
              </a>
            </div>

            <div className="flex items-center gap-2 text-primary">
              <Checkbox
                isChecked={activeOptions}
                onClick={() => setActiveOptions(!activeOptions)}
              />
              Keep me signed in
            </div>

            <button
              type="submit"
              className="w-full p-3 rounded-10 bg-quaternary font-secondary hover:bg-gray-300 focus:outline-none"
              // style={{ color: theme === "dark" ? "#303030" : "#FAFAFA" }}
              style={{ color: "#0C0C0C" }}
            >
              Login
            </button>
          </form>

          <div className="flex flex-col items-center mt-[48px]">
            <div className="flex items-center gap-3">
              <div
                className={`h-px w-10 my-2 ${
                  theme === "dark" ? "bg-gray-600" : "bg-[#4B5768]"
                }`}
              ></div>
              <span className="text-secondary font-secondary text-sm">
                or sign up with
              </span>
              <div
                className={`h-px w-10 my-2  ${
                  theme === "dark" ? "bg-gray-600" : "bg-[#4B5768]"
                }`}
              ></div>
            </div>
            <div className="flex items-center gap-1 mt-3.5">
              <div
                className={`flex items-center justify-center gap-1.5 w-[117.67px] h-[34px] rounded-[4px] text-primary ${
                  theme === "dark"
                    ? "border border-[#FAFAFA]"
                    : "border border-[#2D2D2D]"
                }`}
              >
                <img src={google} alt="google" />
                Google
              </div>

              <div
                className={`flex items-center justify-center gap-1.5 w-[117.67px] h-[34px] rounded-[4px] text-primary ${
                  theme === "dark"
                    ? "border border-[#FAFAFA]"
                    : "border border-[#2D2D2D]"
                }`}
              >
                <img src={theme === "dark" ? apple : appleLight} alt="apple" />
                Apple
              </div>

              <div
                className={`flex items-center justify-center gap-1.5 w-[117.67px] h-[34px] rounded-[4px] text-primary ${
                  theme === "dark"
                    ? "border border-[#FAFAFA]"
                    : "border border-[#2D2D2D]"
                }`}
              >
                <img src={facebook} alt="facebook" />
                Facebook
              </div>
            </div>
          </div>

          <div className="text-center mt-8 text-primary">
            <span>Don't have an Account? </span>
            <a
              href="#"
              className={`font-[700] hover:underline ${
                theme === "dark" ? "text-quaternary" : "text-primary"
              }`}
            >
              Sign up here
            </a>
          </div>
        </div>
      </div>
    </NeonGlowBackground>
  );
};

export default Login;
