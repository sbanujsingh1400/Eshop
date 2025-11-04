import React from 'react'

interface Props {
    title:string,
    children:React.ReactNode  
}

const SidebarMenu = ({title,children}:Props) => {
  return (
    <div className='space-y-1' >
        <h3 className='px-4 mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider'>{title}</h3>
        {children}
    </div>
  )
}

export default SidebarMenu;