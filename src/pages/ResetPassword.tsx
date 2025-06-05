import logo from "../assets/img/loginChatApp.png";
import bgLogin from "../assets/img/bg_login.png";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { authContext } from "@/context";

function ResetPassword() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoggedIn } = useContext(authContext);
  const [pass, setPass] = useState({
    pass: "",
    confirmPass: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPass((prev) => ({
      ...prev,
      [id]: value.trim(),
    }));
  };

  const handleReset = async () => {
    if (pass.pass !== pass.confirmPass) {
      alert("Passwords do not match. Please try again.");
      return;
    }
    if (pass.pass.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    if (!pass.pass || !pass.confirmPass) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:3000/auth/reset-password/${id}`,
        {
          password: pass.pass,
        }
      );
      if (response.data.status === 201) {
        alert("Password reset successfully. You can now log in.");
        navigate("/app/login");
      } else if (response.data.status === 400) {
        alert("Password reset failed. Please check your input.");
      } else if (response.data.status === 409) {
        alert("Email already exists. Please use a different email.");
      } else {
        alert("ResetPassword failed. Please try again.");
      }
    } catch (error) {
      alert("ResetPassword failed. Please check your credentials.");
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
          <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
        </div>
        <div className="max-w-md mx-auto">
          <div className="mt-5">
            <input
              className="bg-white border border-neutral-600 focus-visible:outline-blue-700 rounded-lg px-3 py-2 mt-1 mb-5 text-sm text-neutral-800 w-96"
              type="password"
              id="pass"
              placeholder="New Password"
              onChange={handleInputChange}
            />
          </div>
          <div className="mt-5">
            <input
              className="bg-white border border-neutral-600 focus-visible:outline-blue-700 rounded-lg px-3 py-2 mt-1 mb-5 text-sm text-neutral-800 w-96"
              type="password"
              id="confirmPass"
              placeholder="Confirm new password"
              onChange={handleInputChange}
            />
          </div>
          <div className="mt-5">
            <button
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
              type="submit"
              onClick={handleReset}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
