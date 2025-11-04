'use client'


import React, { useEffect, useState } from 'react'
import useUser from '../../hooks/useUser'
import { BadgeCheck, Bell, CheckCircle, Clock, Gift, Inbox, Loader2, Lock, LogOut, MapPin, Pencil, PhoneCall, Receipt, Settings, ShoppingBag, Truck, User } from 'lucide-react'
import StatCards from '../../shared/components/Cards/StatCards'
import NavItem from '../../shared/components/Cards/NavItem'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../utils/axiosInstance'

import QuickActionCard from '../../shared/components/Cards/QuickActionCard'
import ShippingAddressSection from '../../shared/components/shippingAddress'
import OredersTable from '../../shared/components/tables/OrdersTable'
import ChangePassword from '../../shared/components/chage-password'
import ProfileDetails from '@/app/shared/components/profile-details/ProfileDetails'


// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a better UI.

const page = () => {

    const {user,isLoading}=useUser();
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const queryTab = searchParams.get('active') || "Profile"
    const [activeTab,setActiveTab]= useState(queryTab)
    const [profilePic,setProfilePic]= useState<string>((user?.avatar && user?.avatar[0]?.url) || 'https://ik.imagekit.io/sbanujsingh/products/product-1759752532938_5xZEInFAX?updatedAt=1759752534342' )
    
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [processingOrders, setProcessingOrders] = useState<number>(0);
    const [completedOrders, setCompletedOrders] = useState<number>(0);
    // const {isLoggedIn,setLoggedIn}= useAuthStore()

  const logoutHandler = async()=>{
       
    await axiosInstance.get("/logout-user").then((res)=>{
       if(res.data.success){

        queryClient.setQueryData(['user'], null);
        // setLoggedIn(false)
        router.push('/'); 
       }
    })

  }

  useEffect(()=>{
   
    const fetchProfileOrderDetails= async ()=>{
     
         const res:any=await axiosInstance.get('/order/get-user-profile-details');

          const {totalOrder,processingOrders,completedOrders}=res.data;
    
       setTotalOrder(totalOrder);
       setProcessingOrders(processingOrders);
       setCompletedOrders(completedOrders);




    }
    fetchProfileOrderDetails();

  },[])


   useEffect(()=>{
    if(activeTab !== queryTab){
        const newParams = new URLSearchParams(searchParams);
        newParams.set('active',activeTab);
        router.replace(`/profile?${newParams.toString()}`, { scroll: false }) // prevent scroll to top
    }

   },[activeTab])
   const convertFileToBase64 = async (file:File)=>{
    return new Promise( (resolve,reject)=>{
             const reader = new FileReader();
             reader.readAsDataURL(file);
             reader.onload= ()=>resolve(reader.result);
             reader.onerror= (error)=>reject(error);
    })
 } 
   
   const updateImageHandler = async(e:any)=>{
    e.preventDefault();
    console.log(e.target.files[0]);
    
    const file = await convertFileToBase64(e?.target?.files?.[0]);
    
    if(file){
        const res:any =await  axiosInstance.put('/update-user-profile-image',{file},{withCredentials:true});
        if(res.data.success){
            queryClient.invalidateQueries({ queryKey: ['user'] });
            setProfilePic(res.data.image) 
            
        }
    }

   }
    


  return (
    <div className='bg-slate-100 min-h-[105vh] p-4 sm:p-6 lg:p-8 pb-20' >
        <div className='max-w-7xl mx-auto' >
            {/* Greeting */}
            <div className="text-center mb-8 lg:mb-12">
                <h1 className='text-4xl lg:text-5xl font-bold text-slate-800' >Welcome back,{" "}
              <span className='text-blue-600'>
                {isLoading ?(<Loader2  className='inline animate-spin w-8 h-8' />):(`${user?.name || "User" } `)}
              </span>{" "} 👋🏻
              </h1>
            </div>
            {/* Profile Overview Grid */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <StatCards title="Total Orders" count={totalOrder} Icon={Clock} />
            <StatCards title="Processing Orders" count={processingOrders} Icon={Truck} />
            <StatCards title="Completed Orders" count={completedOrders} Icon={CheckCircle} />
            </div>
            {/* Sidebar and contents  */}
            <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
                {/* Left Navigation */}
                <div className='bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 w-full lg:w-64 flex-shrink-0 h-max'>
                    <nav className="space-y-1">
                <NavItem label='Profile' Icon={User} active={activeTab==='Profile'} onClick={()=>setActiveTab('Profile')} />
                <NavItem label='My Orders' Icon={ShoppingBag} active={activeTab==='My Orders'} onClick={()=>setActiveTab('My Orders')} />
                <NavItem label='Inbox' Icon={Inbox} active={activeTab==='Inbox'} onClick={()=>router.push('/inbox')} />
                <NavItem label='Notifications' Icon={Bell} active={activeTab==='Notifications'} onClick={()=>setActiveTab('Notifications')} />
                <NavItem label='Shipping Address' Icon={MapPin} active={activeTab==='Shipping Address'} onClick={()=>setActiveTab('Shipping Address')} />
                <NavItem label='Change Password' Icon={Lock} active={activeTab==='Change Password'} onClick={()=>setActiveTab('Change Password')} />
                <NavItem label='Logout' Icon={LogOut} danger onClick={()=>logoutHandler()} />

                    </nav>
                </div>
                {/* Main Content  */}

                <div className='bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 w-full flex-grow' >
                    {/* <h2 className='text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4' >
                        {activeTab}
                        </h2> */}
                        {activeTab === 'Profile' && !isLoading && user ?(<ProfileDetails profilePic={profilePic} updateImageHandler={updateImageHandler} user={user} /> ):activeTab ==='Shipping Address'?(<ShippingAddressSection/>): activeTab ==='My Orders'?(<>
                        <OredersTable />
                        </>):activeTab ==='Change Password'?(<><ChangePassword /></>):("")}
                        
                    
                </div>
                {/* Right Quick Panel */}
                <div className='w-full lg:w-72 flex-shrink-0 space-y-5' >
                    <QuickActionCard Icon={Gift} title="Referral Program" description="Invite Friends and earn Rewards." />
                    <QuickActionCard Icon={BadgeCheck} title="Your Badges" description="View your earned achievements." />
                    <QuickActionCard Icon={Settings} title="Account Settings" description="Manage preferences and security."/>
                    <QuickActionCard Icon={Receipt} title="Billing History" description="Check your recent payments."/>
                    <QuickActionCard Icon={PhoneCall} title="Support Center" description="Need help? Contact support."/>
                </div>
            </div>
        </div>
        
    </div>
  )
}

export default page;