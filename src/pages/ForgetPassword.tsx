import logo from "../assets/img/loginChatApp.png";
import bgLogin from "../assets/img/bg_login.png";
import { useContext, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { authContext } from "@/context";

function ForgetPassword() {
  const { isLoggedIn } = useContext(authContext);
  const [email, setEmail] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
  };

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/forget-password",
        { email }
      );
      if (response.data.status === 201) {
        alert("Check your email for the reset link.");
      } else if (response.data.status === 409) {
        alert("Email already exists. Please use a different email.");
      } else {
        alert("ForgetPassword failed. Please try again.");
      }
    } catch (error) {
      alert("ForgetPassword failed. Please check your credentials.");
    }
  };

  return isLoggedIn ? (
    <></>
  ) : (
    <div
      className="relative flex justify-center items-center h-screen w-screen"
      style={{
        backgroundImage: `url(${bgLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative px-4 py-10 bg-white/50 bg-blur-md p-5 mx-8 md:mx-0 shadow rounded-3xl sm:p-10 h-fit animate-in slide-in-from-top">
        <div className="flex flex-col justify-center items-center">
          <img src={logo} alt="" className="h-48 w-48" />
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
        </div>
        <div className="max-w-md mx-auto">
          <div className="mt-5">
            <input
              className="bg-white border border-neutral-600 focus-visible:outline-blue-700 rounded-lg px-3 py-2 mt-1 mb-5 text-sm text-neutral-800 w-96"
              type="email"
              placeholder="Email"
              onChange={handleInputChange}
            />
          </div>
          <div className="mt-5">
            <button
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
              type="submit"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
            <Link
              className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline"
              to="/app/login"
            >
              or log in
            </Link>
            <span className="w-1/5 border-b dark:border-gray-400 md:w-1/4"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
