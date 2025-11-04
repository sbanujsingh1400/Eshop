import axiosInstance from '@/app/utils/axiosInstance';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'

interface Props {
    title:string;
    icon:React.ReactNode;
    isActive:boolean;
    href?:string;
    
}

const SidebarItems = ({icon,title,isActive,href}:Props) => {
   const router = useRouter();
   const queryClient = useQueryClient();
   const onClickHandler = async()=>{
    if(title=='Logout'){
        await axiosInstance.get("/logout-seller").then((res)=>{
            if(res.data.success){
     
             queryClient.setQueryData(['seller'], null);
             // setLoggedIn(false)
             router.push('/login'); 
            }
         })
    }
   }

    
  return (
    <Link href={href || '' }>
        <div onClick={onClickHandler} className={`flex items-center gap-3 w-full p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
            isActive
            ? "bg-slate-700/50 text-white font-semibold"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}>
            {icon}
            <h5 className='text-sm font-medium' >
                {title}
            </h5>

        </div>
    </Link>
  )
}

export default SidebarItems;