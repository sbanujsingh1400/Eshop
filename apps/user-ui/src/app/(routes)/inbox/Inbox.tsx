'use client'
export const dynamic = 'force-dynamic';
import useRequireAuth from '@/app/hooks/useReguiredAuth';
import useUser from '@/app/hooks/useUser';
import ChatInput from '@/app/shared/components/chats/chatInput';
import axiosInstance from '@/app/utils/axiosInstance';
import { isProtected } from '@/app/utils/protected';
import { useWebSocket } from '@/app/configs/context/web-socket-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Loader2, MessageSquare } from 'lucide-react'; // Example icon for empty state

const page = () => {
  const { user, isLoading: isUserLoading }= useUser();

 

const searchParams = useSearchParams();
const router = useRouter();
const wsRef = useRef<WebSocket |null>(null);
const messageContainerRef= useRef<HTMLDivElement>(null);
const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
const queryClient =useQueryClient();

const [chats, setChats] = useState<any[]>([]);
const [selectedChat, setSelectedChat] = useState<any | null>(null);
const [message, setMessage] = useState("");
const [hasMore, setHasMore] = useState(false);
const [page, setPage] = useState(1);
const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
const {ws,unreadCounts}:any= useWebSocket();
const [isLoadingMore, setIsLoadingMore] = useState(false);
const prevScrollHeightRef = useRef<number | null>(null);

const [conversationId,setConversationId] = useState(searchParams.get("conversationId"));


const {data:messages=[]}= useQuery({
    queryKey:['messages',conversationId],
    queryFn:async ()=>{
      if(!conversationId || hasFetchedOnce)return [];
        const res:any = await axiosInstance.get("/chatting/get-messages/"+conversationId+"?page=1",isProtected);
        console.log(res.data,res.data.hasMore)
        setPage(1);
        setHasMore(res.data.hasMore);
        setHasFetchedOnce(true);
        return res.data.messages.reverse();
    },
    enabled:!!conversationId,
    staleTime:2 * 60 *1000,
})   

const {data:conversations,isLoading}= useQuery({
    queryKey:['conversations'],
    queryFn:async ()=>{
      console.log('calling api')
        const res:any = await axiosInstance.get("/chatting/get-user-conversations",isProtected);
        console.log(res.data)
        return res.data.conversations;
    }
})

useEffect(()=>{
  // Only scroll to bottom if we are NOT loading previous messages
  if(messages?.length>0 && !isLoadingMore) {
    scrollToBottom();
  }
},[messages, isLoadingMore]); // <-- Added isLoadingMore


// useEffect(()=>{
//     if(messages?.length>0)scrollToBottom();
// },[messages]);


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
       console.log(data);
      if(data.type==="NEW_MESSAGE" && data?.payload?.senderType=='seller'){
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


const getLastMessage= (chat:any)=>{
return chat.lastMessage || "";
}

const loadMoreMessages = async ()=>{
  if (!messageContainerRef.current) return;
  setIsLoadingMore(true);
    const nextPage = page+1;
    const res:any = await axiosInstance.get(`/chatting/get-messages/${conversationId}?page=${nextPage}`,isProtected);
    queryClient.setQueryData(["messages",conversationId],(old:any=[])=>[...res.data.messages.reverse(),...old]);
    setPage(nextPage);
    setHasMore(res?.data?.hasMore);
}

// const scrollToBottom = ()=>{
//     requestAnimationFrame(()=>{
//        if(messageContainerRef)setTimeout(()=>{ messageContainerRef.current?.scrollIntoView({behavior:"smooth"})},0);
//     })
// }

const scrollToBottom = ()=>{
  requestAnimationFrame(()=>{
   
     setTimeout(()=>{ 
       
        if(scrollAnchorRef.current){
          scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 0);
  })
}
useLayoutEffect(() => {
  if (isLoadingMore && prevScrollHeightRef.current !== null && messageContainerRef.current) {
      
      // --- We just loaded more messages ---
      const newScrollHeight = messageContainerRef.current.scrollHeight;
      
      // Calculate the difference in height
      const scrollOffset = newScrollHeight - prevScrollHeightRef.current;
      
      // Restore the scroll position by adding the offset
      messageContainerRef.current.scrollTop = scrollOffset; 
      
      // Reset the flags
      prevScrollHeightRef.current = null;
      setIsLoadingMore(false);
  }
}, [messages, isLoadingMore]); // Runs when messages update *if* we are loading

const handleSend = async (e:any)=>{
    e.preventDefault();
    if(!message.trim() || !selectedChat)return;
    const payload = {
        fromUserId:user?.id,
        toUserId:selectedChat?.seller?.id,
        conversationId:selectedChat?.conversationId,
        messageBody:message,
        senderType:"user"
    }
    ws?.send(JSON.stringify(payload));
    queryClient.setQueryData(
        ["messages", selectedChat.conversationId],
        (old: any = []) => [
          ...old,
          {
            content: payload.messageBody,
            senderType: "user",
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
    // setChats((prevChats)=>prevChats.map((chat)=>chat.conversationId === selectedChat.conversationId ?{...chat,lastMessage:payload.messageBody}:chat));
    // setSelectedChat(chat);
    setConversationId(chat.conversationId);
    router.push(`?conversationId=${chat.conversationId}`)
    ws?.send(JSON.stringify({
        type:"MARK_AS_SEEN",
        conversationId:chat.conversationId
    }))
}
if (isUserLoading) {
  return (
      <div className="w-full h-screen flex flex-col gap-4 items-center justify-center bg-slate-50 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <span className="font-semibold">Loading Your Conversations...</span>
      </div>
  );
}


  return (
    <div className='w-full bg-white' >
        <div className="max-w-7xl mx-auto py-8 ">

  <div className='flex h-[calc(100vh-45vh)] border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden' >

    <div className='w-full max-w-xs border-r border-slate-200 bg-slate-50 flex flex-col' >
        <div className='p-4 border-b border-slate-200 text-lg font-bold text-slate-800 flex-shrink-0' >
            Messages
        </div>
        <div className='divide-y divide-slate-200 overflow-y-auto' >
            {isLoading ?(<div className='p-4 text-sm text-slate-500' >Loading...</div>): chats.length===0 ? (<div className='p-4 text-sm text-slate-500' >No Conversations</div>):( chats.map((chat:any)=>{
            const isActive = selectedChat?.conversationId === chat?.conversationId;
            // console.log(chat?.seller?.avatar[0] ||'https://ik.imagekit.io/sbanujsingh/products/product-1759764430247_euLdMDxH7?updatedAt=1759764432032')
            // console.log(chat.conversationId)
            return <button onClick={() => handleChatSelect(chat)} key={chat.conversationId} className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${isActive ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
            <div className="relative flex-shrink-0">
                <Image 
                    src={chat?.seller?.avatar?.[0] || 'https://ik.imagekit.io/sbanujsingh/static_images/backupImage.jpeg?updatedAt=1763010683740'} 
                    alt={chat?.seller?.name}
                    width={40}
                    height={40}
                    className='rounded-full w-10 h-10 object-cover'
                />
                {chat?.seller?.isOnline && (<span className='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white'></span>)}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className={`text-sm ${chat.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {chat.seller?.name}
                    </span>
                    {/* --- THIS IS THE NEW BADGE UI --- */}
                    {chat.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                    )}
                </div>
                <p className={`text-xs truncate   ${chat.unreadCount > 0 ? 'font-bold text-slate-700' : 'text-slate-500'}`}>
                    {getLastMessage(chat)}
                </p>
            </div>
        </button>

            }))}
        </div>
    </div>

    <div className="flex flex-col flex-1 bg-white">
        {selectedChat ? (<>
        <div className="p-3 border-b border-slate-200 bg-white flex items-center gap-3 flex-shrink-0 shadow-sm">
            <Image src={selectedChat?.seller?.avatar[0] || "https://ik.imagekit.io/sbanujsingh/static_images/backupImage.jpeg?updatedAt=1763010683740"} alt={selectedChat.seller.name} width={40} height={40} className='rounded-full w-10 h-10 object-cover' />
            <div>
              <h2 className='text-slate-800 font-semibold text-base' >{selectedChat.seller.name}</h2>
              <p className='text-xs text-slate-500' >{selectedChat.seller?.isOnline?"Online":"Offline"}</p>
            </div>
        </div>
        <div ref={messageContainerRef} className='flex-1 overflow-y-auto p-6 space-y-4 text-sm bg-slate-100/50' >
      
            {hasMore && (<div className='flex justify-center mb-2' >
                <button 
                onClick={loadMoreMessages} 
                className='text-xs px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-full font-semibold text-slate-600 transition'  >Load previous messages</button>
            </div>)}
            {messages?.map((msg:any,index:number)=>(<div key={index} className={`flex flex-col ${msg.senderType==="user"?"items-end":"items-start"}`} >
                <div className={`px-4 py-2 shadow-sm w-fit max-w-md ${
                  msg.senderType === "user"
                    ? "bg-blue-600 text-white rounded-t-xl rounded-l-xl"
                    : "bg-white text-slate-700 rounded-t-xl rounded-r-xl border border-slate-200"
                  }`}
                >
                  {msg.text || msg.content}
                </div>

                <div
                  className={`text-[11px] text-slate-400 mt-1 flex items-center ${
                    msg.senderType === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.time ||
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>
            </div>))}
            <div ref={scrollAnchorRef} />
        </div>
        <ChatInput message={message} setMessage={setMessage} onSendMessage={handleSend} />
        </>):(
        <div className='flex-1 flex flex-col gap-2 items-center justify-center text-slate-400 w-full bg-slate-50'>
          <MessageSquare size={48} className="text-slate-300"/>
          <h3 className="font-semibold text-lg">Select a conversation</h3>
          <p className="text-sm">Start chatting with sellers.</p>
        </div>
        )}
    </div>
  </div>

        </div>
         
    </div>
  )
}

export default page