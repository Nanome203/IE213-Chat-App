import React, { useContext, useEffect, useState, useRef } from "react";
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
  X,
  SearchIcon,
  XIcon,
} from "lucide-react";
import NoChatSelected from "@/components/NoChatSelected";
import bgLogin from "../assets/img/bg_login.png";
import avaDefault from "../assets/img/avaDefault.png";
import rickroll from "../assets/img/rick-roll.gif";
import logOutGif from "../assets/img/log-out.gif";
import MenuDropdown from "@/components/MenuDropdown";
import MessageInput from "@/components/MessageInput";
import axios from "axios";
import { authContext } from "@/context";
import { Message, SocketMsg } from "@/utils/types";
import { isLastMessage, normalizeDate } from "@/utils/etc";
import { log } from "console";
import { useNavigate } from "react-router";
import CallPage from "./CallPage";

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
  const [ws, setWS] = useState<WebSocket>();
  const [friends, setFriends] = useState<User[]>([]);
  const [invitors, setInvitors] = useState<User[]>([]);
  const [myself, setMyself] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // messages call API
  const [friendIsLoading, setFriendIsLoading] = useState(false);
  const [invitorsIsLoading, setInvitorsIsLoading] = useState(false);
  const [messagesAreLoading, setMessagesAreLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { setIsLoggedIn } = React.useContext(authContext);
  const [showToast, setShowToast] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [isAddFriendFormVisible, setIsAddFriendFormVisible] = useState(false);
  const [wannaBefriendedUserId, setWannaBefriendedUserId] = useState("");
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isCallRejected, setIsCallRejected] = useState(false);
  const [roomId, setRoomId] = useState<string>("");
  const [caller, setCaller] = useState<User | null>(null);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  let pingInterval: NodeJS.Timeout;
  const currentUserId = localStorage.getItem("currentUserId");

  const toggleForm = () => {
    setIsAddFriendFormVisible(!isAddFriendFormVisible);
  };

  const handleFriendClicked = async (user: User) => {
    // Store the selected user so that when we reload the page, the chat with selected user will still be opened
    localStorage.setItem("selectedUser", JSON.stringify(user));
    setSelectedUser(user);

    try {
      fetchMessages(user);
    } catch {
      // retry fetching
      fetchMessages(user);
    }
  };
  const sendFriendRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (wannaBefriendedUserId.trim() === currentUserId?.trim()) {
      alert("You cannot send friend request to yourself");
      return;
    }
    const response = await axios.post(
      `http://localhost:3000/users/${currentUserId}/friends`,
      {
        invitedId: wannaBefriendedUserId,
      }
    );
    if (response.data.status === 201) {
      ws!.send(
        JSON.stringify({
          type: "friendRequest",
          invitor: currentUserId,
          invited: wannaBefriendedUserId.trim(),
        })
      );
      alert("Friend request sent");
    } else {
      alert("Failed to send friend request");
    }
  };

  async function fetchMessages(user: User) {
    setMessagesAreLoading(true);
    let response = await axios.get(
      `http://localhost:3000/users/${currentUserId}/messages/${user.id}`
    );
    if (response.data.data.length === 0) {
      setMessages([]);
    } else {
      setMessages(response.data.data);
    }
    setMessagesAreLoading(false);
  }
  async function fetchInvitors() {
    setInvitorsIsLoading(true);
    const response = await axios.get(
      `http://localhost:3000/users/${currentUserId}/invitors`
    );
    if (response.data.data?.length !== 0) {
      setInvitors(response.data.data);
    } else {
      setInvitors([]);
    }
    setInvitorsIsLoading(false);
  }

  async function fetchFriends() {
    setFriendIsLoading(true);
    const response = await axios.get(
      `http://localhost:3000/users/${currentUserId}/friends`
    );
    if (response.data.data?.length !== 0) {
      setFriends(response.data.data);
    } else {
      setFriends([]);
    }
    setFriendIsLoading(false);
  }

  async function fetchMyself() {
    const response = await axios.get(
      `http://localhost:3000/users/${currentUserId}`
    );
    if (response.data.data?.length !== 0) {
      setMyself(response.data.data[0]);
    } else {
      setMyself(null);
    }
  }

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  //initialize websocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/ws`);
    pingInterval = setInterval(() => {
      ws.send("ping");
    }, 20000);
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "reportID",
          id: currentUserId,
        })
      );
    };

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        if (event.data === "pong") return;
        const msg: SocketMsg = JSON.parse(event.data);
        switch (msg.type) {
          case "isOffline": {
            fetchFriends();
            break;
          }

          case "isOnline": {
            fetchFriends();
            fetchMyself();
            break;
          }

          case "friendRequestNotification": {
            // get invitor's info
            fetchInvitors();
            break;
          }

          case "failedToAccept": {
            alert("Failed to accept friend request, please try again later");
            break;
          }

          case "failedToDecline": {
            alert("Failed to decline friend request, please try again later");
            break;
          }

          case "reloadAllLists": {
            fetchInvitors();
            fetchFriends();
            fetchMyself();
            break;
          }

          case "syncMessage": {
            if (selectedUser) {
              fetchMessages(selectedUser);
            }
            break;
          }

          case "senderIsTyping": {
            setIsTyping(true);
            break;
          }

          case "senderIsNotTyping": {
            setIsTyping(false);
            break;
          }

          case "roomIsReady": {
            axios
              .get(`http://localhost:3000/users/${msg.roomId}`)
              .then((response) => {
                if (response.data.status === 200) {
                  setCaller(response.data.data[0]);
                  setRoomId(msg.roomId!);
                  setShowCallModal(true);
                }
              });

            break;
          }

          case "callRejected": {
            setIsCallRejected(true);
            break;
          }
          default:
            break;
        }
      }
    };
    setWS(ws);
    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, []);
  useEffect(() => {
    fetchFriends();
    fetchMyself();
    fetchInvitors();
    if (selectedUser) {
      fetchMessages(selectedUser);
    }
  }, []);

  const handleCall = async () => {
    setIsCalling(true);
  };
  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:3000/auth/logout", {
        id: currentUserId,
      });
      if (response.data.status === 200) {
        (
          document.getElementById("logout-message") as HTMLDialogElement
        ).showModal();
        setShowToast(true);
        setTimeout(() => {
          localStorage.clear();
          setIsLoggedIn(false);
          clearInterval(pingInterval);
          ws!.close();
        }, 1000);
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return isCalling ? (
    <CallPage
      setIsCalling={setIsCalling}
      isCallRejected={isCallRejected}
      setIsCallRejected={setIsCallRejected}
      setShowCallModal={setShowCallModal}
      ws={ws}
      roomId={roomId}
    />
  ) : (
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

      {/* modal for video call */}
      <dialog className="modal" id="video-call-modal" open={showCallModal}>
        <div className="modal-box bg-zinc-800 shadow-none">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="flex-1 flex gap-4 flex-col items-center justify-center">
              <div className="avatar">
                <div className="w-24 rounded-full">
                  <img src={caller?.avatar || avaDefault} />
                </div>
              </div>
              <p className="text-lg text-white animate-pulse">
                {caller?.name} is calling ...
              </p>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                className="btn btn-error"
                onClick={() => {
                  setShowCallModal(false);
                  ws?.send(
                    JSON.stringify({ type: "callRejected", sender: roomId })
                  );
                  setRoomId("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={() => {
                  setIsCalling(true);
                }}
              >
                Join Call
              </button>
            </div>
          </div>
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
                  {friendIsLoading ? (
                    <>
                      <div className="skeleton bg-[#d4c2fd] h-12 w-12 shrink-0 rounded-full"></div>
                      <div className="skeleton bg-[#d4c2fd] h-4 w-24"></div>
                    </>
                  ) : (
                    <>
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img src={myself?.avatar || avaDefault} />
                        </div>
                      </div>
                      <span className="font-semibold">{myself?.name}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center">
                  <div className="relative">
                    <MenuDropdown
                      triggerIcon={<BellIcon className="w-6 h-6 text-white" />}
                      menuBgColor="bg-white/80"
                      menuTextColor="text-gray-600"
                      customContent={() => (
                        <div className="flex flex-col gap-4 p-2 max-h-[400px] overflow-y-auto">
                          {!invitorsIsLoading ? (
                            invitors?.length > 0 ? (
                              invitors?.map((invitor) => (
                                <div
                                  key={invitor.id}
                                  className="flex flex-col items-center gap-4"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="avatar">
                                      <div className="w-10 rounded-full">
                                        <img src={invitor.avatar} />
                                      </div>
                                    </div>
                                    <p className="text-sm font-medium">
                                      {invitor.name} sent you a friend request
                                    </p>
                                  </div>
                                  <div className="flex gap-4 ml-8">
                                    <button
                                      className="btn btn-sm btn-outline"
                                      onClick={() => {
                                        ws?.send(
                                          JSON.stringify({
                                            type: "declineFriendRequest",
                                            invitor: invitor.id,
                                            invited: currentUserId,
                                          })
                                        );
                                      }}
                                    >
                                      Decline
                                    </button>
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() => {
                                        ws?.send(
                                          JSON.stringify({
                                            type: "acceptFriendRequest",
                                            invitor: invitor.id,
                                            invited: currentUserId,
                                          })
                                        );
                                      }}
                                    >
                                      Accept
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="h-[200px] flex items-center justify-center ">
                                No notifications
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="skeleton bg-[#d4c2fd] h-10 w-10 shrink-0 rounded-full"></div>
                              <div className="skeleton bg-[#d4c2fd] h-8 w-16"></div>
                            </div>
                          )}
                        </div>
                      )}
                    />
                    {invitors.length > 0 && (
                      <div className="absolute p-1 rounded-full bg-red-500 top-2 right-2"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-3 px-2">
                <form
                  className="
  flex items-center bg-[#6c5f9b] text-white rounded-md shadow text-base
  w-10/12 focus-within:w-full transition-all duration-300
  mx-auto max-w-full
"
                >
                  <div className="w-10 flex-shrink-0 grid place-content-center">
                    <SearchIcon className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="text"
                    className="bg-transparent py-2.5 px-2 outline-none placeholder:text-zinc-300 text-sm flex-1 min-w-0"
                    placeholder="Search..."
                  />
                  <button
                    className="w-10 py-2 flex-shrink-0 grid place-content-center cursor-pointer hover:text-gray-300"
                    aria-label="Clear input button"
                    type="reset"
                  >
                    <XIcon className="h-5 w-5" />
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
                {friendIsLoading
                  ? // Hiển thị 10 khối skeleton bg-[#d4c2fd] giả lập
                    Array.from({ length: 10 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 w-full mb-6"
                      >
                        <div className="skeleton bg-[#d4c2fd] h-12 w-12 shrink-0 rounded-full"></div>
                        <div className="flex-1 flex flex-col gap-4">
                          <div className="skeleton bg-[#d4c2fd] h-4 w-1/2"></div>
                          <div className="skeleton bg-[#d4c2fd] h-4 w-full"></div>
                        </div>
                      </div>
                    ))
                  : friends.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleFriendClicked(user)}
                        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#6a5dad] transition"
                      >
                        <div
                          className={`avatar ${
                            user.isOnline ? "avatar-online" : "avatar-offline"
                          }`}
                        >
                          <div className="w-12 rounded-full">
                            <img
                              src={user.avatar || avaDefault}
                              alt={user.name}
                            />
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

            <div className="absolute bottom-[-50px] right-[-50px] z-50">
              <div className="menu-tooltip">
                <input type="checkbox" id="toggle" />
                <label
                  htmlFor="toggle"
                  className="toggle flex items-center justify-center"
                >
                  <PlusIcon className="w-8 h-8 text-black" />
                </label>
                <li
                  style={{ "--i": "0" } as React.CSSProperties}
                  className="circle-box cursor-pointer tooltip tooltip-left"
                  data-tip="Log out"
                  onClick={handleLogout}
                >
                  <a className="anchor">
                    <LogOutIcon className="w-6 h-6" />
                  </a>
                </li>
                <li
                  style={{ "--i": "1" } as React.CSSProperties}
                  className="circle-box cursor-pointer tooltip tooltip-left"
                  data-tip="Add friend"
                  onClick={toggleForm}
                >
                  <a href="#" className="anchor">
                    {isAddFriendFormVisible ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <UserPlus className="w-6 h-6" />
                    )}
                  </a>
                </li>
                <li
                  style={{ "--i": "2" } as React.CSSProperties}
                  className="circle-box cursor-pointer tooltip tooltip-left"
                  data-tip="Profile"
                >
                  <a href="/app/profile" className="anchor">
                    <User className="w-6 h-6" />
                  </a>
                </li>
              </div>
            </div>

            <div
              className={`transition-all duration-500 overflow-hidden ${
                isAddFriendFormVisible
                  ? "h-[150px] opacity-100"
                  : "h-0 opacity-0"
              }`}
              style={{
                backgroundImage: `url(${bgLogin})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="w-[calc(100%-144px)] h-full px-2 pt-4">
                <form
                  className="flex flex-col items-center justify-center gap-2 h-full"
                  onSubmit={sendFriendRequest}
                >
                  <input
                    className="input text-gray-600 border-none focus:outline-none w-full"
                    type="text"
                    id="UserID"
                    required
                    value={wannaBefriendedUserId}
                    onChange={(e) => setWannaBefriendedUserId(e.target.value)}
                    placeholder="ID User"
                  />
                  <div className="flex items-center justify-between gap-2 w-full">
                    <button
                      type="reset"
                      className="btn btn-outline btn-error rounded-lg min-w-[120px]"
                    >
                      cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-accent rounded-lg min-w-[120px]"
                    >
                      add friend
                    </button>
                  </div>
                </form>
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
                        {friendIsLoading ? (
                          <div className="flex items-center gap-4 w-full">
                            <div className="skeleton bg-[#d4c2fd] h-12 w-12 shrink-0 rounded-full"></div>
                            <div className="flex-1 flex flex-col gap-4">
                              <div className="skeleton bg-[#d4c2fd] h-4 w-20"></div>
                              <div className="skeleton bg-[#d4c2fd] h-4 w-24"></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={selectedUser?.avatar || avaDefault}
                              alt={selectedUser?.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-lg font-semibold text-gray-800">
                                {selectedUser?.name}
                              </p>
                              <p
                                className={`text-sm ${
                                  selectedUser?.isOnline
                                    ? "text-green-500"
                                    : "text-gray-500"
                                }`}
                              >
                                ●{" "}
                                {selectedUser?.isOnline
                                  ? "Active now"
                                  : "Offline"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-4">
                        {/* Call Button */}
                        {/* <button
                      className="flex justify-center items-center"
                      type="button"
                    >
                      <Phone className="w-5 h-5 text-gray-700 cursor-pointer" />
                    </button> */}

                        {/* Video Call Button */}
                        <button
                          className="flex justify-center items-center"
                          type="button"
                          onClick={handleCall}
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
                    // backgroundImage: `url(${rickroll})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* chat container */}
                  <div className="overflow-x-hidden overflow-y-auto flex flex-col basis-0 flex-grow-1">
                    {messagesAreLoading
                      ? messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`chat ${
                              message.sender === myself?.id
                                ? "chat-end"
                                : "chat-start"
                            }`}
                            ref={messageEndRef}
                          >
                            <div
                              className={`chat-image avatar ${
                                message.sender === myself?.id ? "mr-4" : "ml-4"
                              }`}
                            >
                              <div className="w-10 rounded-full">
                                <img
                                  alt="avatar"
                                  src={
                                    message.sender === myself?.id
                                      ? myself?.avatar || avaDefault
                                      : selectedUser.avatar || avaDefault
                                  }
                                />
                              </div>
                            </div>

                            <div className="chat-bubble skeleton bg-[#d4c2fd] h-16 w-[200px] flex flex-col items-center justify-center"></div>
                          </div>
                        ))
                      : messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`chat ${
                              message.sender === myself?.id
                                ? "chat-end"
                                : "chat-start"
                            }`}
                            ref={messageEndRef}
                          >
                            <div
                              className={`chat-image avatar ${
                                message.sender === myself?.id ? "mr-4" : "ml-4"
                              }`}
                            >
                              <div className="w-10 rounded-full">
                                <img
                                  alt="avatar"
                                  src={
                                    message.sender === myself?.id
                                      ? myself?.avatar || avaDefault
                                      : selectedUser?.avatar || avaDefault
                                  }
                                />
                              </div>
                            </div>
                            <div className="chat-header mb-1">
                              {message.sender === myself?.id
                                ? myself?.name
                                : selectedUser?.name}
                              <time className="text-xs opacity-50">
                                {normalizeDate(message.createdAt)}
                              </time>
                            </div>
                            <div className="chat-bubble flex flex-col items-center justify-center">
                              {message.image && (
                                <img
                                  src={
                                    typeof message.image === "string"
                                      ? message.image
                                      : avaDefault
                                  }
                                  className="sm:max-w-11/12 rounded-md mb-2"
                                />
                              )}
                              {message.gif && (
                                <img
                                  src={message.gif}
                                  className="sm:max-w-[200px] rounded-md mb-2"
                                />
                              )}
                              {message.text && (
                                <p
                                  dangerouslySetInnerHTML={{
                                    __html: message.text,
                                  }}
                                />
                              )}
                              {message.voice && (
                                <div className="h-full w-full flex items-center justify-center gap-2">
                                  <audio controls src={message.voice} />
                                </div>
                              )}
                            </div>
                            <div className="chat-footer opacity-50">
                              {isSendingMessage
                                ? "Sending"
                                : message.sender === myself?.id &&
                                  isLastMessage(messages, message) &&
                                  !isTyping &&
                                  "Delivered"}
                            </div>
                          </div>
                        ))}
                    {isTyping && (
                      <div className="chat chat-start">
                        <div className="chat-image avatar ml-4">
                          <div className="w-10 rounded-full">
                            <img
                              alt="avatar"
                              src={selectedUser.avatar || avaDefault}
                            />
                          </div>
                        </div>
                        <div className="chat-header mb-1">
                          {selectedUser.name}
                        </div>
                        <div className="chat-bubble flex flex-col items-center justify-center">
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0s]" />
                            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* chat input */}
                  <MessageInput
                    messages={messages}
                    setMessages={setMessages}
                    onTyping={() => {
                      ws?.send(
                        JSON.stringify({
                          type: "senderIsTyping",
                          sender: currentUserId,
                          receiver: selectedUser.id,
                        })
                      );
                    }}
                    onStopTyping={() => {
                      ws?.send(
                        JSON.stringify({
                          type: "senderIsNotTyping",
                          sender: currentUserId,
                          receiver: selectedUser.id,
                        })
                      );
                    }}
                    onStartSending={() => {
                      setIsSendingMessage(true);
                    }}
                    onFinishedSending={() => {
                      setIsSendingMessage(false);
                      ws?.send(
                        JSON.stringify({
                          type: "syncMessage",
                          sender: currentUserId,
                          receiver: selectedUser.id,
                        })
                      );
                    }}
                  />
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
