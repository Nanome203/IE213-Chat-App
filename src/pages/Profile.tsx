import React, { useEffect, useState } from "react";
import { ArrowLeftIcon, CameraIcon, Edit } from "lucide-react";
import bgLogin from "../assets/img/bg_login.png";
import avaDefault from "../assets/img/avaDefault.png";
import axios from "axios";
import { useNavigate } from "react-router";

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
}

interface FormData {
  name: string;
  password: string;
  phone: string;
  avatar: File | string;
}

function Profile() {
  const navigate = useNavigate();
  const [myself, setMyself] = useState<User | null>(null);
  const [previewImage, setPreviewImage] = React.useState<
    string | ArrayBuffer | null
  >(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    password: "",
    phone: "",
    avatar: "",
  });
  const [isEditing, setIsEditing] = useState({
    name: false,
    password: false,
    phone: false,
  });

  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const phoneInputRef = React.useRef<HTMLInputElement>(null);
  const copyBtnRef = React.useRef<HTMLButtonElement>(null);
  const uploadImgRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  async function fetchMyself() {
    const response = await axios.get(
      `http://localhost:3000/users/${localStorage.getItem("currentUserId")}`
    );
    if (response.data.data.length !== 0) {
      setMyself(response.data.data[0]);
      setFormData({
        ...formData,
        name: response.data.data[0].name,
        password: "", // không lấy password
        phone: response.data.data[0].phone,
      });
    }
  }

  const handleCopyId = async () => {
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      await navigator.clipboard.writeText(currentUserId);
      // alert("ID copied to clipboard!");
      if (copyBtnRef.current) {
        copyBtnRef.current.innerText = "✓";
      }
      setTimeout(() => {
        if (copyBtnRef.current) {
          copyBtnRef.current.innerText = "Copy ID";
        }
      }, 1000);
    } else {
      alert("No user ID found.");
    }
  };

  useEffect(() => {
    fetchMyself();
  }, []);

  const handleSelectedImg = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Here you can handle the file data, e.g., send it to a server or display it
        setPreviewImage(reader.result);
        setFormData({ ...formData, avatar: file });
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
    }
    // Reset the input value to allow re-uploading the same file
    event.target.value = "";
  };

  const handleSaveAll = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("password", formData.password);
    data.append("phone", formData.phone);
    data.append("avatar", formData.avatar);
    try {
      const response = await axios.patch(
        `http://localhost:3000/users/${myself?.id}`,
        data
      );
      setIsEditing({ name: false, password: false, phone: false });
      if (response.data.status === 200) {
        alert("Profile data updated!!");
        fetchMyself();
      } else {
        alert("Failed to update profile data");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile data. Please update later");
    }
  };

  const handleCancel = () => {
    if (!myself) return;

    setFormData({
      ...formData,
      name: myself.name,
      password: "",
      phone: myself.phone,
    });

    setIsEditing({
      name: false,
      password: false,
      phone: false,
    });
  };

  return (
    <>
      {/* Change Username Modal */}
      <dialog className="modal" id="ChangeUsernameModal">
        <form
          method="dialog"
          className="modal-box flex flex-col items-center justify-center gap-6 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${bgLogin})`,
          }}
        >
          <h2 className="text-center text-3xl text-black">Change Username</h2>
          <fieldset className="fieldset w-full ">
            <legend className="fieldset-legend text-base">New Username</legend>
            <input
              type="text"
              id="name"
              className="input w-full"
              placeholder="Type here"
            />
          </fieldset>
          <button className="btn btn-info">Accept</button>
        </form>
      </dialog>
      <dialog className="modal" id="ChangePasswordModal">
        <form
          method="dialog"
          className="modal-box flex flex-col items-center justify-center gap-6 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${bgLogin})`,
          }}
        >
          <h2 className="text-center text-3xl text-black">Change Password</h2>
          <fieldset className="fieldset w-full ">
            <legend className="fieldset-legend text-base">New Password</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
            />
          </fieldset>
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend text-base">
              Confirm New Password
            </legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
            />
          </fieldset>
          <button className="btn btn-info">Accept</button>
        </form>
      </dialog>
      {/* Change PhoneNumber Modal */}
      <dialog className="modal" id="ChangePhoneNumberModal">
        <form
          method="dialog"
          className="modal-box flex flex-col items-center justify-center gap-6 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url(${bgLogin})`,
          }}
        >
          <h2 className="text-center text-3xl text-black">
            Change Phone Number
          </h2>
          <fieldset className="fieldset w-full ">
            <legend className="fieldset-legend text-base">
              New Phone Number
            </legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
            />
          </fieldset>
          <button className="btn btn-info">Accept</button>
        </form>
      </dialog>
      <div
        className="h-screen w-screen bg-center bg-no-repeat bg-cover flex items-center justify-center"
        style={{
          backgroundImage: `url(${bgLogin})`,
        }}
      >
        <div className="bg-white/50 backdrop-blur-md rounded-xl p-12 max-w-10/12 min-w-8/12">
          <div className="flex justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold mb-2">User Profile</h1>
              <p className="text-gray-600 mb-4">Manage your profile!</p>
            </div>
            <div
              className="flex mb-10 gap-2 items-center justify-between cursor-pointer text-gray-500 text-base hover:text-gray-800 transition-colors"
              onClick={() => navigate("/app/home")}
            >
              <ArrowLeftIcon className="" />
              <p className="">Back</p>
            </div>
          </div>
          <div className="mt-6 flex gap-8">
            <div className="flex flex-col items-center justify-center gap-2 border-2 border-gray-300 py-6 px-10 rounded-xl">
              <div className="avatar">
                <div className="w-36 rounded-full">
                  <img
                    src={
                      previewImage && typeof previewImage === "string"
                        ? previewImage
                        : myself?.avatar || avaDefault
                    }
                  />
                </div>
                <div className="absolute bottom-0 right-0">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={uploadImgRef}
                    onChange={handleSelectedImg}
                  />
                  <button
                    className="btn btn-circle bg-gray-300 hover:bg-gray-400"
                    onClick={() => uploadImgRef.current?.click()}
                  >
                    <CameraIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h2 className="text-xl font-semibold">Avatar</h2>
            </div>

            <div className="flex-1 flex flex-col gap-4 border-2 border-gray-300 p-6 rounded-xl">
              <h3 className="text-2xl font-semibold">General Information</h3>
              <div className="flex gap-4">
                <div className="relative border border-gray-300 p-8 rounded-xl flex-1 flex items-center justify-between">
                  <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">
                    Username
                  </p>
                  <input
                    type="text"
                    id="name"
                    value={formData?.name}
                    onChange={handleInputChange}
                    disabled={!isEditing.name}
                    ref={nameInputRef}
                    className="input w-full bg-transparent text-2xl font-semibold text-gray-600 disabled:border-none disabled:bg-transparent focus:outline-none border-none focus:shadow-none"
                  />
                  <button
                    onClick={() => {
                      setIsEditing((prev) => ({ ...prev, name: true }));
                      setTimeout(() => nameInputRef.current?.focus(), 0);
                    }}
                    className="btn btn-sm border-none bg-transparent hover:bg-transparent hover:border-none text-gray-500 hover:text-gray-800 transition-colors"
                    title="Chỉnh sửa tên"
                  >
                    <Edit className="w-6 h-6" />
                  </button>
                </div>
                <div className="relative border border-gray-300 p-8 rounded-xl flex-1">
                  <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">
                    ID
                  </p>
                  <p className="font-semibold text-2xl text-gray-600">
                    {myself?.id}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  className="btn btn-xl btn-accent rounded-lg min-w-[120px]"
                  ref={copyBtnRef}
                  onClick={handleCopyId}
                >
                  Copy ID
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4  border-2 border-gray-300 p-6 rounded-xl">
            <h3 className="text-2xl font-semibold">Security</h3>
            <div className="flex gap-4">
              <div className="relative border border-gray-300 p-8 rounded-xl flex-1">
                <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">
                  Email
                </p>
                <p className="font-semibold text-2xl text-gray-600">
                  {myself?.email}
                </p>
              </div>
              <div className="relative border border-gray-300 p-8 rounded-xl flex-1 flex items-center justify-between">
                <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">
                  Password
                </p>
                <input
                  type="password"
                  id="password"
                  value={isEditing.password ? "" : "********"}
                  onChange={handleInputChange}
                  disabled={!isEditing.password}
                  ref={passwordInputRef}
                  className="input w-full bg-transparent text-2xl font-semibold text-gray-600 disabled:border-none disabled:bg-transparent focus:outline-none border-none focus:shadow-none"
                />
                <button
                  onClick={() => {
                    setIsEditing((prev) => ({ ...prev, password: true }));
                    setTimeout(() => passwordInputRef.current?.focus(), 0);
                  }}
                  className="btn btn-sm border-none bg-transparent hover:bg-transparent hover:border-none text-gray-500 hover:text-gray-800 transition-colors"
                  title="Chỉnh sửa tên"
                >
                  <Edit className="w-6 h-6" />
                </button>
              </div>
              <div className="relative border border-gray-300 p-8 rounded-xl flex-1 flex items-center justify-between">
                <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">
                  Phone Number
                </p>
                <input
                  type="text"
                  id="phone"
                  value={formData?.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing.phone}
                  ref={phoneInputRef}
                  className="input w-full bg-transparent text-2xl font-semibold text-gray-600 disabled:border-none disabled:bg-transparent focus:outline-none border-none focus:shadow-none"
                />
                <button
                  onClick={() => {
                    setIsEditing((prev) => ({ ...prev, phone: true }));
                    setTimeout(() => phoneInputRef.current?.focus(), 0);
                  }}
                  className="btn btn-sm border-none bg-transparent hover:bg-transparent hover:border-none text-gray-500 hover:text-gray-800 transition-colors"
                  title="Chỉnh sửa tên"
                >
                  <Edit className="w-6 h-6" />
                </button>
              </div>
            </div>
            {/* <div className="flex gap-4">
                            <button className="btn btn-xl btn-outline btn-accent rounded-lg" onClick={() => (document.getElementById("ChangePasswordModal") as HTMLDialogElement).showModal()}>Change Password</button>
                            <button className="btn btn-xl btn-outline btn-accent rounded-lg" onClick={() => (document.getElementById("ChangePhoneNumberModal") as HTMLDialogElement).showModal()}>{myself?.phone ? 'Change Phone Number' : "Add Phone Number"}</button>
                        </div> */}
            <div className="flex gap-4 justify-end">
              <button
                className="btn btn-xl btn-outline btn-error rounded-lg min-w-[120px]"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="btn btn-xl btn-accent rounded-lg min-w-[120px]"
                onClick={handleSaveAll}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
