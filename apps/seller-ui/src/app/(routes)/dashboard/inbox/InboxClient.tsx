'use client'
import { useWebSocket } from '@/app/configs/context/web-socket-context';
import useSeller from '@/app/hooks/useSeller';
// import useRequireAuth from '@/app/hooks/useReguiredAuth';


import ChatInput from '@/app/shared/components/chats/chatInput';
import axiosInstance from '@/app/utils/axiosInstance';
// import { isProtected } from '@/app/utils/protected';
// import { useWebSocket } from '@/configs/context/web-socket-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'

const page = () => {

const searchParams = useSearchParams();
// const {user,isLoading:userLoading}= useRequireAuth();

const [chats, setChats] = useState<any[]>([]);
const [selectedChat, setSelectedChat] = useState<any | null>(null);
const [message, setMessage] = useState("");
const [hasMore, setHasMore] = useState(false);
const [page, setPage] = useState(1);
const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
const {ws,unreadCounts}= useWebSocket();
const {seller,isLoading:userLoading}= useSeller();
// const conversationId = searchParams.get("conversationId");

const router = useRouter();
const wsRef = useRef<WebSocket |null>(null);
const messageContainerRef= useRef<HTMLDivElement>(null);
const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
const queryClient =useQueryClient();
const [conversationId,setConversationId] = useState(searchParams.get("conversationId"));

const {data:messages=[]}= useQuery({
    queryKey:['messages',conversationId],
    queryFn:async ()=>{
      if(!conversationId || hasFetchedOnce)return [];

        const res:any = await axiosInstance.get("/chatting/get-seller-messages/"+conversationId+"?page=1");
        setPage(1);
        setHasMore(res.data.hasMore);
        setHasFetchedOnce(true);

        return res.data.messages.reverse();
    },
    enabled:!!conversationId,
    staleTime:2 *60 *1000,
})   

const {data:conversations,isLoading}= useQuery({
    queryKey:['conversations'],
    queryFn:async ()=>{
        const res:any = await axiosInstance.get("/chatting/get-seller-conversations");
    console.log()
        return res.data.conversations;
    }
})

// useEffect(()=>{
  
//     const conversationId = searchParams.get('conversationId');
//     const chat = chats.find((c)=>c.conversationId===conversationId);
//     setSelectedChat(chat || null);

// },[searchParams,chats])


useEffect(()=>{
    if(messages?.length>0)scrollToBottom();
},[messages]);


useEffect(()=>{
    if(conversations)setChats(conversations);
},[conversations]);

useEffect(()=>{
    if(conversationId && chats.length >0){
        const chat = chats.find((c)=>c.conversationId===conversationId);
        setSelectedChat(chat || null);
    }
},[conversationId,chats])

useEffect(()=>{
    if (!ws) return;
    (ws as WebSocket).onmessage=(event)=>{
        const data = JSON.parse(event.data);
         
        if(data.type==="NEW_MESSAGE" && data?.payload?.senderType=='user'){
            const newMsg = data?.payload;
               if(newMsg.conversationId ===conversationId){
                queryClient.setQueryData(['messages',conversationId],(old:any=[])=>[...old,{
                    content:newMsg.messageBody || newMsg.content || "",
                    senderType:newMsg.senderType,
                    seen:false,
                    createdAt:newMsg.createdAt || new Date().toISOString()
                }])
                scrollToBottom();
                  
               }

               setChats((prevChats)=>prevChats.map((chat)=>chat.conversationId===newMsg.conversationId?{...chat,lastMessage:newMsg.content}:chat))
           

        }

        if (data.type === "UNSEEN_COUNT_UPDATE") {
            const { conversationId, count } = data.payload;
            
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat.conversationId === conversationId
                  ? { ...chat, unreadCount: count }
                  : chat
              )
            );
          }

    }
},[ws,conversationId])

 useEffect(()=>{
   if(conversationId && chats.length>0){

    const chat = chats.find((c)=>c.conversationId ===conversationId);
    setSelectedChat(chat || null);

   }


 },[conversationId,chats])
// const getLastMessage= (chat:any)=>{
// return chat.lastMessage || "";
// }

const loadMoreMessages = async ()=>{
    const nextPage = page+1;
    const res:any = await axiosInstance.get(`chatting/get-seller-messages/${conversationId}?page=${nextPage}`);
    queryClient.setQueryData(["messages",conversationId],(old:any=[])=>[...res.data.messages.reverse(),...old]);
    setPage(nextPage);
    setHasMore(res?.data?.hasMore);
}

const scrollToBottom = ()=>{
    requestAnimationFrame(()=>{
       setTimeout(()=>{ scrollAnchorRef.current?.scrollIntoView({behavior:"smooth"})},0);
    })
}

const handleSend = async (e:any)=>{

    e.preventDefault();


    if (
        !message.trim() ||
        !selectedChat ||
        !ws ||
        ws.readyState !== WebSocket.OPEN
      ) {
        return;
      }
      
     
    const payload = {
        fromUserId:seller?.id,
        toUserId:selectedChat?.user?.id,
        conversationId:selectedChat?.conversationId,
        messageBody:message,
        senderType:"seller"
    }

    ws?.send(JSON.stringify(payload));
    queryClient.setQueryData(
      ["messages", selectedChat.conversationId],
      (old: any = []) => [
        ...old,
        {
          content: payload.messageBody,
          senderType: "seller",
          seen: false,
          createdAt: new Date().toISOString()
        }
      ]
    );
    setChats((prevChats)=>prevChats.map((chat)=>chat.conversationId === selectedChat.conversationId ?{...chat,lastMessage:payload.messageBody}:chat));
    setMessage("");
    scrollToBottom()
}

const handleChatSelect =(chat:any)=>{
 
    setHasFetchedOnce(false);
    console.log(chat)
    // setChats((prev)=>prev.map((c)=>c.conversationId===chat.conversationId))
    setConversationId(chat.conversationId);
    router.push(`?conversationId=${chat.conversationId}`)
    ws?.send(JSON.stringify({
        type:"MARK_AS_SEEN",
        conversationId:chat.conversationId
    }))

}
if (userLoading) {
  return (
      <div className="w-full h-screen flex flex-col gap-4 items-center justify-center bg-slate-50 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <span className="font-semibold">Loading Your Conversations...</span>
      </div>
  );
}

  return (
    <div className='w-full ' >
        <div className=" w-full bg-blue-200">

  <div className='flex h-screen shadow-inner overflow-hidden bg-gray-950 text-white' >
        {/* Sidebar */}
    <div className='w-[320px] border-r border-r-gray-800 bg-gray-950 text-white' >
        <div className='p-4 border-b border-b-gray-800 text-lg font-semibold ' >
            Messages
        </div>
        <div className='divide-y divide-gray-900' >
            {isLoading ?(<div className='p-4 border-b text-center font-semibold text-lg' >Loading....</div>): chats.length===0 ? (
            <div className='p-4 text-sm text-center' >No Conversation available yet!</div>):( chats.map((chat:any)=>{
            const isActive = selectedChat?.conversationId === chat?.conversationId;
            console.log(chat)
            return <button
            onClick={() => handleChatSelect(chat)}
            key={chat.conversationId}
            className={`w-full text-left p-4 transition-colors flex items-center gap-3 ${
              isActive ? 'bg-slate-700/60' : 'hover:bg-slate-800/80'
            }`}
          >
            {/* Avatar and Online Status */}
            <div className="relative flex-shrink-0">
              <Image
                src={ chat.user?.avatar?.[0]?.url || 'https://ik.imagekit.io/sbanujsingh/products/product-1759764430247_euLdMDxH7?updatedAt=1759764432032' }
                alt={chat?.user?.name}
                width={40} // Consistent width/height
                height={40}
                className='rounded-full w-10 h-10 object-cover border border-slate-700' // Added border
              />
              {chat?.user?.isOnline && (
                <span className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900'></span> // Added background border
              )}
            </div>
          
            {/* Name, Message, Unread Count */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  chat?.unreadCount > 0 ? 'font-bold text-slate-100' : 'font-semibold text-slate-200' // Bold if unread
                }`}>
                  {chat.user?.name}
                </span>
                {/* --- Unread Count Badge --- */}
                {chat?.unreadCount > 0 && (
                  <span className='ml-2 text-[10px] bg-blue-600 text-white font-bold w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0'>
                    {chat.unreadCount > 9 ? '9+' : chat?.unreadCount}
                  </span>
                )}
              </div>
              <p className={`text-xs truncate ${
                  chat?.unreadCount > 0 ? 'font-medium text-slate-300' : 'text-slate-400' // Slightly brighter if unread
              }`}>
                {chat?.lastMessage || "No messages yet"}
              </p>
            </div>
          </button>

            }))}
        </div>
    </div>
{/* chat content */}
    <div className="flex flex-col flex-1 bg-gray-950 ">
        {selectedChat ? (<>
        {/* Header */}
        <div className="p-4 border-b border-b-gray-800 bg-gray-900 flex items-center gap-3 ">
            <Image src={selectedChat?.user?.avatar[0].url || "https://ik.imagekit.io/sbanujsingh/products/product-1759764430247_euLdMDxH7?updatedAt=1759764432032"} alt={selectedChat.user.name} width={40} height={40} className='rounded-full border w-[40px] object-cover border-gray-600' />
            <div>
            <h2 className='text-white font-semibold text-base' >{selectedChat?.user?.name}</h2>
            <p className='text-xs text-white' >{selectedChat.user?.isOnline?"online":"offline"}</p>
        </div>
        </div>
        {/* Messages */}
        <div ref={messageContainerRef} className='flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm' >
        <div ref={scrollAnchorRef} />
            {hasMore && (<div className='flex justify-center mb-2' >
                <button 
                onClick={loadMoreMessages} 
                className='text-xs px-4 py-1 text-gray-800 rounded-xl bg-gray-200 hover:bg-gray-300'  >Load previous messages</button>
            </div>)}
            {messages?.map((msg:any,index:number)=>(<div key={index} className={`flex flex-col ${msg.senderType==="seller"?"items-end ml-auto":"items-start"} max-w-[80%]`} >
                <div className={`${
  msg.senderType === "user"
    ? "bg-blue-600 text-black"
    : "bg-white text-black"
} px-4 py-2 rounded-lg shadow-sm w-fit`}
 >
                {msg.text || msg.content}
                </div>

                <div
  className={`text-[11px] text-white mt-1 flex items-center ${
    msg.senderType === "user" ? "mr-1 justify-end" : "ml-1"
  }`}
>
  {msg.time ||
    new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
</div>


            </div>))}
            
        </div>
        <ChatInput message={message} setMessage={setMessage} onSendMessage={handleSend} />
        </>):(<div className=' flex-1 flex items-center justify-center text-white w-full'>Select a conversation to start chatting</div>)}
        
    </div>
  </div>

        </div>
         
    </div>
  )
}

export default page