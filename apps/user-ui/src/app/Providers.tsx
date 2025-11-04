'use client'
import React, { useState } from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import useUser from './hooks/useUser';
import { WebSocketProvider } from '@/configs/context/web-socket-context';

const Providers = ({children}:{children:React.ReactNode}) => {

    const [queryClient]= useState(()=>new QueryClient({
      defaultOptions:{
        queries:{
          refetchOnWindowFocus:false,
          staleTime:1000 * 60 * 5
        }
      }
    }));
     

  return (
    <QueryClientProvider client={queryClient} >
      <ProvidersWithWebSocket>
      {children}
      </ProvidersWithWebSocket>
      
      </QueryClientProvider>
  )
}

const ProvidersWithWebSocket =  ({children}:any)=>{
  
   const {user,isLoading} = useUser();
   


   return <>
   {user && <WebSocketProvider isUserLoading ={isLoading} user={user}>{children}</WebSocketProvider> }
   {!user  && children}
   </>

}


export default Providers;