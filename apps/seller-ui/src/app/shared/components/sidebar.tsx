'use client'
import React, { useEffect } from 'react'
import useSidebar from '../../hooks/useSidebar'
import { usePathname } from 'next/navigation';
import useSeller from '../../hooks/useSeller';
import Box from './box';
import { Sidebar } from './sidebar.styles';
import Link from 'next/link';
import { BadgePlus,BellPlus,CalendarPlus, Home, Inbox, InboxIcon, IndianRupee, LayoutGrid, ListOrdered, LogOut, PackageSearch, ShoppingBasket, TicketPercent } from 'lucide-react';
import SidebarItems from './sidebar.item';
import SidebarMenu from './sidebar.menu';

const SidebarWrapper = () => {
    const {activeSidebar,setActiveSidebar} = useSidebar();
    const pathName = usePathname();
    const {seller} = useSeller();
  
    useEffect(()=>{
        setActiveSidebar(pathName);
    },[pathName,setActiveSidebar])
 
    return (
        // NOTE: The user's original component used a `css` prop here. To follow the "className only" rule,
        // that prop has been left untouched, and styling has been applied to child elements that can accept a className.
        <Box css={{height:'100vh',zIndex:202,position:"sticky",padding:'8px',top:'0',overflowY:"scroll",scrollbarWidth:'none'}} className="bg-slate-900 w-64" >

            <Sidebar.Header className="p-3 border-b border-slate-700/80">
              <Box>
                <Link href={'/'} className='flex items-center gap-3' >
                  <LayoutGrid size={24} className="text-white bg-slate-800 p-1 rounded-lg" />
                <Box>
                  <h3 className='text-base font-bold text-white'>{seller?.shop?.name || "Your Shop"}</h3>
                  <h5 className='text-xs text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]' >
                    {seller?.shop?.address || "Shop Address"}
                  </h5>
                </Box>
                </Link>
              </Box>
            </Sidebar.Header>

            <div className='flex-grow pt-6' >
              <Sidebar.Body>
                <SidebarItems  title='Dashboard' icon={<Home />} href='/dashboard' isActive={activeSidebar=='/dashboard'}  />
                <div className="mt-8 space-y-6">
                  <SidebarMenu title='Main Menu' >
                  <SidebarItems  title='Orders' icon={<ListOrdered />} href='/dashboard/orders' isActive={activeSidebar=='/dashboard/orders'}  />
                  <SidebarItems  title='Payments' icon={<IndianRupee />} href='/dashboard/payments' isActive={activeSidebar=='/dashboard/payments'}  />
            
                  </SidebarMenu>
                  <SidebarMenu title='Products' >
                  <SidebarItems  title='Create Product' icon={<BadgePlus />} href='/dashboard/create-product' isActive={activeSidebar=='/dashboard/create-product'}  />
                  <SidebarItems  title='All Products' icon={<PackageSearch />} href='/dashboard/all-products' isActive={activeSidebar=='/dashboard/all-products'}  />
            
                  </SidebarMenu>
                  <SidebarMenu title='Events' >
                  {/* <SidebarItems  title='Create Event' icon={<CalendarPlus />} href='/dashboard/create-event' isActive={activeSidebar=='/dashboard/create-event'}  />
                  <SidebarItems  title='All Events' icon={<BellPlus />} href='/dashboard/all-events' isActive={activeSidebar=='/dashboard/all-events'}  /> */}
                  <SidebarItems  title='Inbox' icon={<InboxIcon />} href='/dashboard/inbox' isActive={activeSidebar=='/dashboard/all-events'}  />
                  <SidebarItems  title='Shop' icon={<ShoppingBasket />} href={'/shop/'+seller?.shop?.id} isActive={activeSidebar=='/dashboard/all-events'}  />
                  </SidebarMenu>
                  <SidebarMenu title='Extras' >
                  <SidebarItems  title='Discount Codes' icon={<TicketPercent />} href='/dashboard/discount-codes' isActive={activeSidebar=='/dashboard/discount-codes'}  />
                  <SidebarItems  title='Logout' icon={<LogOut />}  isActive={activeSidebar=='/logout'}  />
                  </SidebarMenu>
                </div>
              </Sidebar.Body>
            
            </div>

        </Box>
      )
}

export default SidebarWrapper;