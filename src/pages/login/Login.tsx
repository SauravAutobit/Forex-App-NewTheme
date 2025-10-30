import React, { useState } from "react";
import logo from "../../assets/icons/logo.svg";
import eye from "../../assets/icons/eye.svg";
import { useNavigate } from "react-router-dom";
// import logoLight from "../../assets/icons/logoLight.svg";

const Login = () => {
  const [email, setEmail] = useState("asdasd@gmail.com");
  const [password, setPassword] = useState("asdasd");

  const navigate = useNavigate();
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Add login logic here
    console.log("LOGIN");
    navigate("/app");
  };
  return (
    <div className="pt-[85px] flex items-start justify-center min-h-screen bg-primaryBg text-white">
      <div className="w-full max-w-sm p-4 space-y-6">
        <div className="flex justify-center mb-[50px]">
          <img
            // src={theme === "dark" ? logo : logoLight}
            src={logo}
            alt="Intrabit Logo"
            className="h-10"
          />
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-secondary text-secondary">
              Username
            </label>
            <input
              type="text" // Assuming API takes 'username' (which is the 'email' state here)
              placeholder="Enter Username"
              className={`w-full p-3 rounded-lg bg-primaryBg border border-tertiary focus:outline-none placeholder-placeholder text-primary`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-secondary text-secondary">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter password"
                className="w-full p-3 pr-10 rounded-lg bg-primaryBg border border-tertiary focus:outline-none placeholder-placeholder text-primary"
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
            <a href="#" className="hover:underline text-quaternary">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full p-3 rounded-10 bg-quaternary font-secondary hover:bg-gray-300 focus:outline-none"
            // style={{ color: theme === "dark" ? "#303030" : "#FAFAFA" }}
            style={{ color: "#303030" }}
          >
            Login
          </button>
        </form>

        <div className="text-center text-sm mt-4">
          <span className="text-secondary">Don't have an Account? </span>
          <a href="#" className="font-tertiary hover:underline text-quaternary">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
