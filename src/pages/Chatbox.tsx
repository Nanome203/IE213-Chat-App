import React, { useContext, useEffect, useState } from "react";
import {
  Phone,
  Video,
  Info,
  ArrowDown,
  User,
  UserPlus,
  LogOutIcon,
  BellIcon,
  Ellipsis,
  PlusIcon,
} from "lucide-react";
import NoChatSelected from "@/components/NoChatSelected";
import bgLogin from "../assets/img/bg_login.png";
import rickroll from "../assets/img/rick-roll.gif";
import logOutGif from "../assets/img/log-out.gif";
import MenuDropdown from "@/components/MenuDropdown";
import MessageInput from "@/components/MessageInput";
import axios from "axios";
import { authContext } from "@/context";
import { useLocation } from "react-router";

interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

function Chatbox() {
  const [selectedUser, setSelectedUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("selectedUser")!) || null
  );
  const [friends, setFriends] = useState<User[]>([]);
  const { setIsLoggedIn } = React.useContext(authContext);
  const [showToast, setShowToast] = useState(false);
  // alert(localStorage.getItem("currentUserId"))
  useEffect(() => {
    async function fetchFriends() {
      const response = await axios.get(
        `http://localhost:3000/users/${localStorage.getItem("currentUserId")}/friends`
      );
      if (response.data.data.length !== 0) {
        setFriends(response.data.data);
      }
    }
    fetchFriends();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:3000/auth/logout", {
        id: localStorage.getItem("currentUserId"),
      });
      if (response.data.status === 200) {
        (
          document.getElementById("logout-message") as HTMLDialogElement
        ).showModal();
        setShowToast(true);
        setTimeout(() => {
          localStorage.clear();
          setIsLoggedIn(false);
        }, 1000);
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <>
      <dialog className="modal" id="logout-message">
        {showToast && (
          <div
            className="toast toast-top toast-end z-1000 animate-slide-in"
            id="login-success"
          >
            <div
              role="alert"
              className="alert alert-success text-neutral-100 text-base font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Logout successful!</span>
            </div>
          </div>
        )}
        <div className="modal-box bg-transparent shadow-none">
          <img src={logOutGif} alt="Log Out" className="mt-4 max-w-full" />
        </div>
      </dialog>
      <div
        className="h-screen w-screen"
        style={{
          backgroundImage: `url(${bgLogin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="grid grid-cols-12 h-full w-full p-10">
          <aside className="col-span-3 min-h-0 max-w-full min-w-0 flex flex-col basis-0 relative overflow-hidden bg-[#584d82] text-white p-4 rounded-tl-xl rounded-bl-xl">
            <div className="p-4 border-b border-[#6a5dad]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img src="https://img.daisyui.com/images/profile/demo/yellingwoman@192.webp" />
                    </div>
                  </div>
                  <span className="font-semibold">
                    {localStorage.getItem("name")}
                  </span>
                </div>

                <div className="flex items-center">
                  <MenuDropdown
                    triggerIcon={<BellIcon className="w-6 h-6 text-white" />}
                    menuBgColor="bg-white/80"
                    menuTextColor="text-gray-600"
                    customContent={() => (
                      <div className="flex flex-col gap-4 p-2 max-h-[400px] overflow-y-auto">
                        {friends.map((friend) => (
                          <div
                            key={friend.id}
                            className="flex flex-col items-center gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="avatar">
                                <div className="w-10 rounded-full">
                                  <img src={friend.avatar} />
                                </div>
                              </div>
                              <p className="text-sm font-medium">
                                {friend.name} sent you a friend request
                              </p>
                            </div>
                            <div className="flex gap-4 ml-8">
                              <button className="btn btn-sm btn-success">
                                Accept
                              </button>
                              <button className="btn btn-sm btn-outline">
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  />

                  {/* <MenuDropdown
                    position="bottom-right"
                    iconColor="fill-white"
                    menuBgColor="bg-white/80"
                    menuTextColor="text-gray-600"
                    itemHoverColor="hover:bg-[#6a5dad] hover:text-white"
                    items={[
                      {
                        label: "Profile",
                        icon: <User className="w-5 h-5 mr-2" />,
                        onClick: () => console.log("Profile"),
                      },
                      {
                        label: "Add Friend",
                        icon: <UserPlus className="w-5 h-5 mr-2" />,
                        onClick: () => console.log("Add Friend"),
                      },
                      {
                        label: "Logout",
                        icon: <LogOutIcon className="w-5 h-5 mr-2" />,
                        onClick: handleLogout,
                      },
                    ]}
                  /> */}
                </div>
              </div>

              <div className="mb-3 relative flex items-center justify-center">
                <form className="flex items-center justify-center bg-[#6c5f9b] text-white rounded-md shadow text-base w-10/12 focus-within:w-full transition-all">
                  <div
                    aria-disabled="true"
                    className="w-10 grid place-content-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="text"
                    className="bg-transparent py-2.5 outline-none placeholder:text-zinc-400 flex-1"
                    placeholder="Search..."
                  />
                  <button
                    className="w-10 grid place-content-center"
                    aria-label="Clear input button"
                    type="reset"
                  >
                    <svg
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 24 24"
                      height="20"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                  Messages
                </p>
                <MenuDropdown
                  triggerIcon={<Ellipsis className="w-5 h-5 text-white" />}
                  menuBgColor="bg-white/80"
                  menuTextColor="text-gray-600"
                  customContent={() => (
                    <ul className="flex flex-col gap-2 rounded-box z-1 w-full">
                      <li className="cursor-pointer hover:bg-[#6a5dad] hover:text-white p-2 rounded-md">
                        <a>Online</a>
                      </li>
                      <li className="cursor-pointer hover:bg-[#6a5dad] hover:text-white p-2 rounded-md">
                        <a>hehe</a>
                      </li>
                    </ul>
                  )}
                />
              </div>
            </div>

            {/* DANH SÁCH NGƯỜI DÙNG CUỘN ĐƯỢC */}
            <div className="min-h-0 max-w-full flex flex-col flex-grow-1 pt-2">
              <ul className="space-y-2 overflow-x-hidden overflow-y-auto flex flex-col basis-0 flex-grow-1">
                {friends.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => {
                      localStorage.setItem(
                        "selectedUser",
                        JSON.stringify(user)
                      );
                      setSelectedUser(user);
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#6a5dad] transition"
                  >
                    <div
                      className={`avatar ${user.isOnline ? "avatar-online" : "avatar-offline"
                        }`}
                    >
                      <div className="w-10 rounded-full">
                        <img src={user.avatar} alt={user.name} />
                      </div>
                    </div>
                    {/* Thông tin người dùng */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-gray-300 truncate">
                        No messages yet
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="absolute bottom-[-50px] right-[-50px]">
              <div className="menu-tooltip">
                <input type="checkbox" id="toggle" />
                <label htmlFor="toggle" className="toggle flex items-center justify-center">
                  <PlusIcon className="w-8 h-8 text-black" />
                </label>
                <li style={{ '--i': '0' } as React.CSSProperties} className="circle-box" onClick={handleLogout}>
                  <a className="anchor"><LogOutIcon className="w-6 h-6" /></a>
                </li>
                <li style={{ '--i': '1' } as React.CSSProperties} className="circle-box">
                  <a href="#" className="anchor"><UserPlus className="w-6 h-6" /></a>
                </li>
                <li style={{ '--i': '2' } as React.CSSProperties} className="circle-box">
                  <a href="/app/profile" className="anchor"><User className="w-6 h-6" /></a>
                </li>
              </div>
            </div>
          </aside>
          <main className="col-span-9 min-h-0 max-w-full min-w-0 flex flex-col basis-0 relative overflow-hidden bg-transparent rounded-tr-xl rounded-br-xl">
            {selectedUser ? (
              <>
                {/* header */}
                <div className="bg-[#d4c2fd] p-4">
                  <div className="flex items-center justify-between min-h-11 w-full">
                    <div className="flex items-center justify-between min-h-11 w-full">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            {selectedUser.name}
                          </p>
                          <p
                            className={`text-sm ${selectedUser.isOnline
                              ? "text-green-500"
                              : "text-gray-500"
                              }`}
                          >
                            ● {selectedUser.isOnline ? "Active now" : "Offline"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {/* Call Button */}
                        <button
                          className="flex justify-center items-center"
                          type="button"
                        >
                          <Phone className="w-5 h-5 text-gray-700 cursor-pointer" />
                        </button>

                        {/* Video Call Button */}
                        <button
                          className="flex justify-center items-center"
                          type="button"
                        >
                          <Video className="w-6 h-6 text-gray-700 cursor-pointer" />
                        </button>
                        <button
                          className="flex justify-center items-center"
                          type="button"
                        >
                          <Info className="w-6 h-6 text-gray-700 cursor-pointer" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-[#f0e5ff]  min-h-0 max-w-full flex flex-col flex-grow-1"
                  style={{
                    backgroundImage: `url(${rickroll})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* chat container */}
                  <div className="overflow-x-hidden overflow-y-auto flex flex-col basis-0 flex-grow-1"></div>

                  {/* chat input */}
                  <MessageInput onSend={() => console.log("Send clicked")} />
                </div>
              </>
            ) : (
              <NoChatSelected />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default Chatbox;
