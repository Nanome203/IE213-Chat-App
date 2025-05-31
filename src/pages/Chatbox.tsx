import React, { useState } from 'react'
import { Phone, Video, Info, ArrowDown } from 'lucide-react';
import NoChatSelected from '@/components/NoChatSelected';
import bgLogin from '../assets/img/bg_login.png'
import MenuDropdown from '@/components/MenuDropdown';
import MessageInput from '@/components/MessageInput';


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
        <div className='h-screen w-screen' style={{ backgroundImage: `url(${bgLogin})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className='grid grid-cols-12 h-full w-full p-10'>
                <aside className='col-span-3 min-h-0 max-w-full min-w-0 flex flex-col basis-0 relative overflow-hidden bg-[#584d82] text-white p-4 rounded-tl-xl rounded-bl-xl '>
                    <div className="p-4 border-b border-[#6a5dad]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className='avatar'>
                                    <div className="w-10 rounded-full">
                                        <img src="https://img.daisyui.com/images/profile/demo/yellingwoman@192.webp" />
                                    </div>
                                </div>
                                <span className="font-semibold">My name</span>
                            </div>

                            <div className="flex items-center">
                                <MenuDropdown
                                    position="bottom-right"
                                    iconColor="fill-white"
                                    items={[
                                        { label: 'Profile', onClick: () => console.log('Profile') },
                                        { label: 'Logout', onClick: () => console.log('Logout') },
                                    ]}
                                />

                            </div>
                        </div>

                        <div className="mb-3 relative flex items-center justify-center">
                            <form
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
                            </form>


                        </div>

                        {/* <div className="mb-3 flex gap-2 text-sm">
                            <div className="filter">
                                <input className="btn bg-[#778ff9] text-white  filter-reset" type="radio" name="metaframeworks" aria-label="All" />
                                <input className="btn bg-[#778ff9] text-white " type="radio" name="metaframeworks" aria-label="Online" />
                                <input className="btn bg-[#778ff9] text-white " type="radio" name="metaframeworks" aria-label="Chưa xem" />
                            </div>
                        </div> */}

                        <div className='flex items-center justify-between mb-2'>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">Messages</p>
                            {/* <p className="text-xs font-semibold tracking-wide text-gray-300">(2) online</p> */}
                            <div className="dropdown dropdown-bottom dropdown-end">
                                <div tabIndex={0} role="button" className="btn text-xs font-semibold tracking-wide text-gray-300 bg-transparent border-none shadow-none">(2) online
                                    <ArrowDown className="w-4 h-4 ml-1 inline-block" />
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                    <li><a>(2) online</a></li>
                                    <li><a>chưa xem</a></li>
                                </ul>
                            </div>
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
                                    <div className={`avatar ${user.active ? 'avatar-online' : 'avatar-offline'}`}>
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
                </aside>
                <main className='col-span-9 min-h-0 max-w-full min-w-0 flex flex-col basis-0 relative overflow-hidden bg-transparent rounded-tr-xl rounded-br-xl'>
                    {selectedUser ? (
                        <>
                            {/* header */}
                            <div className='bg-[#d4c2fd] p-4' >
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

                            <div className='bg-[#f0e5ff]  min-h-0 max-w-full flex flex-col flex-grow-1' style={{ backgroundImage: `url(https://img.daisyui.com/images/profile/demo/yellingwoman@192.webp)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                {/* chat container */}
                                <div className='overflow-x-hidden overflow-y-auto flex flex-col basis-0 flex-grow-1'>

                                </div>

                                {/* chat input */}
                                <MessageInput onSend={() => console.log('Send clicked')} />
                            </div>
                        </>
                    ) : (
                        <NoChatSelected />
                    )}
                </main>
            </div>
        </div>
    )
}

export default Chatbox