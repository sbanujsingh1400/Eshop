import React from 'react'
import SidebarWrapper from '../../shared/components/sidebar'

const Layout = ({children}:{children:React.ReactNode}) => {
  return (
    // <div className='flex min-h-screen bg-slate-950' >
    //     {/* sidebar */}
    //     <aside className='flex-shrink-0' >

    //         <div className="sticky top-0 h-screen">
    //             <SidebarWrapper />
    //         </div>

    //     </aside>
    //     {/* Main content area */}
    //     <main className='flex-1 p-6 sm:p-8 lg:p-10' >
         
    //     </main>
    // </div>
    <div className='w-full h-full' >{children}</div>
  )
}

export default Layout