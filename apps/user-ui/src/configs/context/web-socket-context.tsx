'use client'
import { useContext, useEffect, useRef, useState, createContext } from "react";

interface WebSocketContextType {
  ws: WebSocket | null;
  unreadCounts: Record<string, number>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({
  children,
  user,
  isUserLoading
}: {
  children: React.ReactNode;
  user: any;
  isUserLoading:any;
}) => {

    const wsRef = useRef<WebSocket | null>(null); 
  // const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.id || isUserLoading) return;

    const socket = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!);
    // console.log(socket);
       wsRef.current=socket
    // setWs(socket);
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
  };
    socket.onopen = () => {
      socket.send(`user_${user.id}`);
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
      console.log("WebSocket closed for user", user.id);
    };

    return () => {
      socket.close();
    };
  }, [user?.id]);
  
  // if(!wsReady)return null;
   
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
