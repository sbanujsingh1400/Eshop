'use client'
import React, { useState } from 'react'
import EmojiPicker from 'emoji-picker-react';
import { ImageIcon, Send, Smile } from 'lucide-react';

const ChatInput = ({ onSendMessage, message, setMessage }: { onSendMessage: (e: any) => void; message: string; setMessage: React.Dispatch<React.SetStateAction<string>> }) => {

  const [showEmoji, setShowEmoji] = useState(false);
  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  }
  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Uploading image");
    }
  }

  return (
    <form onSubmit={onSendMessage} className='border-t border-slate-200 bg-white px-4 py-2 flex items-center gap-1 relative' >
      {/* upload icon */}
      <label className='cursor-pointer p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-500 rounded-full transition-colors'  >
        <ImageIcon className='w-5 h-5' />
        <input type="file" accept='image/*' onChange={handleImageUpload} hidden />
      </label>
      {/* Emoji picker toggle */}
      <div className='relative' >
        <button type='button' onClick={() => setShowEmoji(prev => !prev)} className='p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-500 rounded-full transition-colors' >
          <Smile className='w-5 h-5' />
        </button>
        {showEmoji && (<div className='absolute bottom-14 left-0 z-50'>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>)}
      </div>
      <input type="text" value={message} onChange={(e: any) => setMessage(e.target.value)} placeholder='Type your message...' className='flex-1 px-4 py-2 text-sm bg-slate-100 text-slate-800 placeholder-slate-500 outline-none rounded-full' />
      <button type='submit' className='bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-white p-2 rounded-full flex-shrink-0' disabled={!message.trim()} >
        <Send className='w-5 h-5' />
      </button>

    </form>
  )
}

export default ChatInput;