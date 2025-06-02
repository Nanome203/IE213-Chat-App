import { MessageSquare } from 'lucide-react'
import React from 'react'

function NoChatSelected() {
    return (
        <div className='w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50'>
            <div className='max-w-md text-center space-y-6'>
                {/*icon display  */}
                <div className='flex justify-center gap-4 mb-4'>
                    <div className='relative'>
                        <div className='w-16 h-16 bg-[#d4c2fd] rounded-full flex items-center justify-center animate-bounce'>
                            <MessageSquare className='w-8 h-8 text-primary' />
                        </div>
                    </div>
                </div>

                {/*text display */}
                <p className='text-lg text-base-content/70 font-semibold'>
                    Select a conversation to start chatting.
                </p>
            </div>
        </div>
    )
}

export default NoChatSelected