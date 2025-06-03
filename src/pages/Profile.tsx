import React, { useState } from "react";
import { ArrowLeftIcon, CameraIcon } from "lucide-react";
import bgLogin from "../assets/img/bg_login.png";

function Profile() {
    return (
        <>
            {/* tui để bg 2 loại ae thích cái nào thì chỉnh hết cho đồng bộ cái đó */}
            {/* Change Username Modal */}
            <dialog className="modal" id="ChangeUsernameModal">
                <form method="dialog" className="modal-box flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#D1C4E9] to-[#9575CD]">
                    <h2 className="text-center text-3xl text-black">Change Username</h2>
                    <fieldset className="fieldset w-full ">
                        <legend className="fieldset-legend text-base">New Username</legend>
                        <input type="text" className="input w-full" placeholder="Type here" />
                    </fieldset>
                    <button className="btn btn-info">Accept</button>
                </form>
            </dialog>
            {/* Change Nametag Modal */}
            <dialog className="modal" id="ChangeNametagModal">
                <form method="dialog" className="modal-box flex flex-col items-center justify-center gap-6 bg-center bg-no-repeat bg-cover" style={{
                    backgroundImage: `url(${bgLogin})`,
                }}>
                    <h2 className="text-center text-3xl text-black">Change Nametag</h2>
                    <fieldset className="fieldset w-full ">
                        <legend className="fieldset-legend text-base">New Nametag</legend>
                        <input type="text" className="input w-full" placeholder="Type here" />
                    </fieldset>
                    <button className="btn btn-info">Accept</button>
                </form>
            </dialog>
            {/* Change Password Modal */}
            <dialog className="modal" id="ChangePasswordModal">
                <form method="dialog" className="modal-box flex flex-col items-center justify-center gap-6 bg-center bg-no-repeat bg-cover" style={{
                    backgroundImage: `url(${bgLogin})`,
                }}>
                    <h2 className="text-center text-3xl text-black">Change Password</h2>
                    <fieldset className="fieldset w-full ">
                        <legend className="fieldset-legend text-base">New Password</legend>
                        <input type="text" className="input w-full" placeholder="Type here" />
                    </fieldset>
                    <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend text-base">Confirm New Password</legend>
                        <input type="text" className="input w-full" placeholder="Type here" />
                    </fieldset>
                    <button className="btn btn-info">Accept</button>
                </form>
            </dialog>
            {/* Change PhoneNumber Modal */}
            <dialog className="modal" id="ChangePhoneNumberModal">
                <form method="dialog" className="modal-box flex flex-col items-center justify-center gap-6 bg-center bg-no-repeat bg-cover" style={{
                    backgroundImage: `url(${bgLogin})`,
                }}>
                    <h2 className="text-center text-3xl text-black">Change Phone Number</h2>
                    <fieldset className="fieldset w-full ">
                        <legend className="fieldset-legend text-base">New Phone Number</legend>
                        <input type="text" className="input w-full" placeholder="Type here" />
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
                        <div className="flex mb-10 gap-2 items-center justify-between cursor-pointer text-gray-500 text-base hover:text-gray-800 transition-colors">
                            <ArrowLeftIcon className="" onClick={() => window.history.back()} />
                            <p className="">Back</p>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-8">
                        <div className="flex flex-col items-center justify-center gap-2 border-2 border-gray-300 py-6 px-10 rounded-xl">
                            <div className="avatar">
                                <div className="w-36 rounded-full">
                                    <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
                                </div>
                                <div className="absolute bottom-0 right-0">
                                    <button className="btn btn-circle bg-gray-300 hover:bg-gray-400">
                                        <CameraIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold">Username</h2>
                            <p className="text-gray-600">Nametag</p>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 border-2 border-gray-300 p-6 rounded-xl">
                            <h3 className="text-2xl font-semibold">General Information</h3>
                            <div className="flex gap-4">
                                <div className="relative border border-gray-300 p-8 rounded-xl flex-1">
                                    <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">Username</p>
                                    <p className="font-semibold text-2xl text-gray-600">my name</p>
                                </div>
                                <div className="relative border border-gray-300 p-8 rounded-xl flex-1">
                                    <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">Nametag</p>
                                    <p className="font-semibold text-2xl text-gray-600">name tag</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <button className="btn btn-xl btn-accent rounded-lg" onClick={() => (document.getElementById("ChangeUsernameModal") as HTMLDialogElement).showModal()}>Change Username</button>
                                </div>
                                <div className="flex-1">
                                    <button className="btn btn-xl btn-accent rounded-lg" onClick={() => (document.getElementById("ChangeNametagModal") as HTMLDialogElement).showModal()}>Change Nametag</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-4  border-2 border-gray-300 p-6 rounded-xl">
                        <h3 className="text-2xl font-semibold">Security</h3>
                        <div className="flex gap-4">
                            <div className="relative border border-gray-300 p-8 rounded-xl flex-1">
                                <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">Email</p>
                                <p className="font-semibold text-2xl text-gray-600">anphotratien@gmail.com</p>
                            </div>
                            <div className="relative border border-gray-300 p-8 rounded-xl flex-1">
                                <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">Password</p>
                                <p className="font-semibold text-2xl text-gray-600">**********</p>
                            </div>
                            <div className="relative border border-gray-300 p-8 rounded-xl flex-1">
                                <p className="absolute z-10 bg-[#e4d1ff] px-2 text-base -top-3 ">Phone Number</p>
                                <p className="font-semibold text-2xl text-gray-600">0123456789</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="btn btn-xl btn-outline btn-accent rounded-lg" onClick={() => (document.getElementById("ChangePasswordModal") as HTMLDialogElement).showModal()}>Change Password</button>
                            <button className="btn btn-xl btn-outline btn-accent rounded-lg" onClick={() => (document.getElementById("ChangePhoneNumberModal") as HTMLDialogElement).showModal()}>Change Phone Number</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile