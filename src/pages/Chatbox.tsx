import React, { useState } from 'react'
import { Phone, Video, Info } from 'lucide-react';

// data mẫu, sau này sẽ call api
const users = [
    { id: 1, name: 'Jane Doe', avatar: 'https://i.pravatar.cc/40?img=1', active: true },
    { id: 2, name: 'John Smith', avatar: 'https://i.pravatar.cc/40?img=2', active: false },
    { id: 3, name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=3', active: true },
];
interface User {
    id: number;
    name: string;
    avatar: string;
    active: boolean;
}

function Chatbox() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);


    return (
        <div className='grid grid-cols-12 h-screen w-screen'>
            <aside className='col-span-3 min-h-0 max-w-full min-w-0 flex flex-col basis-0 relative overflow-hidden bg-[#584d82] text-white p-4'>
                <div className="p-4 border-b border-[#6a5dad]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <img src="https://i.pravatar.cc/40?img=99" className="w-9 h-9 rounded-full" />
                            <span className="font-semibold">My name</span>
                        </div>
                    </div>

                    <div className="mb-3 relative flex items-center justify-center">
                        <div
                            className="flex items-center justify-center bg-[#6c5f9b] text-white rounded-md shadow text-base w-10/12 focus-within:w-full transition-all"
                        >
                            <div aria-disabled="true" className="w-10 grid place-content-center">
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
                        </div>


                    </div>

                    <div className="mb-3 flex gap-2 text-sm">
                        <button className="bg-[#6a5dad] px-2 py-1 rounded hover:bg-[#7b6fc3]">Tất cả</button>
                        <button className="bg-[#6a5dad] px-2 py-1 rounded hover:bg-[#7b6fc3]">Online</button>
                    </div>

                    <div className='flex items-center justify-between mb-2'>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">Messages</p>
                        <p className="text-xs font-semibold tracking-wide text-gray-300">(2) online</p>
                    </div>
                </div>

                {/* DANH SÁCH NGƯỜI DÙNG CUỘN ĐƯỢC */}
                <div className='min-h-0 max-w-full flex flex-col flex-grow-1 pt-2'>
                    <ul className="space-y-2 overflow-x-hidden overflow-y-auto flex flex-col basis-0 flex-grow-1">
                        {users.map(user => (
                            <li
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#6a5dad] transition"
                            >
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className={`text-sm ${user.active ? 'text-green-400' : 'text-gray-300'}`}>
                                        ● {user.active ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <main className='col-span-9 min-h-0 max-w-full min-w-0 flex flex-col basis-0 relative overflow-hidden bg-[#f0e5ff] '>
                {selectedUser ? (
                    <>
                        {/* header */}
                        <div className='bg-[#d4c2fd] p-4'>
                            <div className='flex items-center justify-between min-h-11 w-full'>
                                <div className='flex items-center justify-between min-h-11 w-full'>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={selectedUser.avatar}
                                            alt={selectedUser.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">{selectedUser.name}</p>
                                            <p className={`text-sm ${selectedUser.active ? 'text-green-500' : 'text-gray-500'}`}>
                                                ● {selectedUser.active ? 'Active now' : 'Offline'}
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

                        <div className='bg-[#f0e5ff]  min-h-0 max-w-full flex flex-col flex-grow-1'>
                            {/* chat container */}
                            <div className='overflow-x-hidden overflow-y-auto flex flex-col basis-0 flex-grow-1'>

                            </div>

                            {/* chat input */}
                            <div className='p-4 h-20 '>
                                <div className="flex gap-2 items-center max-w-full mx-auto h-full">
                                    <div className="relative w-full flex items-center h-full bg-gray-100 border border-gray-300 p-4 rounded-full gap-2">
                                        <input
                                            placeholder="Search..."
                                            className=" text-gray-900 text-base w-full outline-none rounded-lg flex-1 "
                                            id="voice-search"
                                            type="text"
                                        />


                                        <div className='flex items-center justify-center gap-2'>
                                            {/* Button: Mic */}
                                            <button type="button" title="Voice Message">
                                                <svg
                                                    className="w-5 h-5 text-gray-500 hover:text-gray-800"
                                                    viewBox="0 0 16 20"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M15 7v3a5.006 5.006 0 0 1-5 5H6a5.006 5.006 0 0 1-5-5V7m7 9v3m-3 0h6M7 1h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3Z"
                                                        strokeWidth="2"
                                                        strokeLinejoin="round"
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                    />
                                                </svg>
                                            </button>

                                            {/* Button: Image Upload */}
                                            <button type="button" title="Send Image">
                                                <svg
                                                    className="w-6 h-6 text-gray-500 hover:text-gray-800"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14m18 0H3m18 0-4-4a2 2 0 0 0-2.828 0L14 17l-2-2a2 2 0 0 0-2.828 0L3 19"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>

                                            {/* Button: Sticker */}
                                            <button type="button" title="Send Sticker">
                                                <svg
                                                    className="w-6 h-6 text-gray-500 hover:text-gray-800"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 3.863 2.186 7.22 5.379 8.838.379.19.621.57.621.995v.077a.75.75 0 0 0 .75.75h6.5a.75.75 0 0 0 .75-.75v-.077c0-.425.242-.805.621-.995A9.978 9.978 0 0 0 22 12Z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Button: Send Message */}
                                    <button
                                        className="flex justify-center items-center p-2 pl-3 hover:bg-gray-100 rounded-full"
                                        type="submit"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 text-[#778ff9]"
                                        >
                                            <path
                                                d="M2 21l21-9L2 3v7l15 2-15 2v7z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </button>
                                </div>

                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">
                        <p>Hãy chọn một người để bắt đầu trò chuyện 👈</p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Chatbox