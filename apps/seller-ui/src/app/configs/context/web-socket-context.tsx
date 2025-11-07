'use client'
import { useContext, useEffect, useRef, useState, createContext } from "react";

interface WebSocketContextType {
  ws: WebSocket | null;
  unreadCounts: Record<string, number>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({
  children,
  seller,
}: {
  children: React.ReactNode;
  seller: any;
}) => {

    const wsRef = useRef<WebSocket | null>(null); 
  
  const [wsReady, setWsReady] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!seller?.id) return;

    const socket = new WebSocket(process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI! :process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI_LOCAL!);
    
       wsRef.current=socket
    

    socket.onopen = () => {
      socket.send(`seller_${seller.id}`);
      setWsReady(true)
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "UNSEEN_COUNT_UPDATE") {
          const { conversationId, count } = data.payload;
          setUnreadCounts((prev) => ({
            ...prev,
            [conversationId]: count,
          }));
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket closed for user", seller.id);
    };

    return () => {
      socket.close();
    };
  }, [seller?.id]);
  
  if(!wsReady)return null;

  return (
    <WebSocketContext.Provider value={{ ws:wsRef.current, unreadCounts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  // console.log(ctx);
  if(!ctx){
    return {ws:null,unreadCounts:null};
  }
  // if (!ctx) throw new Error("useWebSocket must be used inside WebSocketProvider");
  return ctx;
};
