'use client'
import React, { useState } from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import useSeller from './hooks/useSeller';
import { WebSocketProvider } from './configs/context/web-socket-context';
import  SidebarWrapper  from '../app/shared/components/sidebar';

import useHandleSideBar from './hooks/useHandleSideBar';
const Providers = ({children}:{children:React.ReactNode}) => {

    const [queryClient]= useState(()=>new QueryClient());
   const showSidebar = useHandleSideBar();
   console.log(showSidebar)
  return (
    <>
    <QueryClientProvider client={queryClient} >
      <ProvidersWithWebSocket>
      <div className='flex min-h-screen bg-slate-950' >
        {/* sidebar */}
        
        {showSidebar &&<aside className='flex-shrink-0' >

            <div className="sticky top-0 h-screen">
                <SidebarWrapper />
            </div>

        </aside>}
        {/* Main content area */}
        <main className='flex-1 p-6 sm:p-8 lg:p-10' >
          <div className='w-full h-full' >{children}</div>
        </main>
    </div>
      </ProvidersWithWebSocket>
     
      </QueryClientProvider>
    </>
    
  )
}


const ProvidersWithWebSocket = ({children}:any)=>{

  const {seller,isLoading} = useSeller();
  
  

  return <>
  {seller && <WebSocketProvider seller={seller}>{children}</WebSocketProvider> }
  {!seller && children}
  </>

}


export default Providers;