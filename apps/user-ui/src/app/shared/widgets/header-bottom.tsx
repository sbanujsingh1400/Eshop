'use client'
import { navItems } from '@/configs/constants';
import { AlignLeft, ChevronDown, Heart, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import useUser from '../../hooks/useUser';
import { useStore } from '../../store';
import Image from 'next/image';

// NOTE: This is a further polished version. All logic and JSX structure remain IDENTICAL.
// Only className strings have been updated for an even better UI.

const HeaderBottom = () => {
    const [show, setShow] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const { user, isLoading } = useUser();
    const wishlist = useStore((state: any) => state.wishlist);
    const cart = useStore((state: any) => state.cart);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        }

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);

    }, [])

    return (
        <div className={`w-full transition-all p-3 duration-500 ${isSticky ? 'fixed top-[0px] left-0 z-40 bg-white/90 backdrop-blur-lg shadow-lg shadow-slate-900/5' : "relative bg-white border-b border-slate-200/80"}`}  >

            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center ${!isSticky?"justify-center":"justify-between"} h-14`} >
                {/* All dropdowns */}
                <div className="relative md:hidden  ">
                    <div 
                        onClick={() => setShow(!show)}
                        className="flex items-center justify-between gap-4 px-4 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-all duration-200 transform hover:-translate-y-px"
                    >
                        <div className="flex items-center gap-2">
                            <AlignLeft size={20} className='text-slate-700' />
                            <span className='text-slate-800 font-semibold'>All Departments</span>
                        </div>
                        <ChevronDown size={20} className={`text-slate-700 transition-transform duration-300 ${show ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {/* Dropdown menu */}
                    {show && <div className="absolute left-0 top-full mt-2 w-72 h-auto bg-white rounded-lg shadow-2xl shadow-slate-500/10 border border-slate-200/80 z-50 p-2" >
                        {/* You can map over your department items here. Example: */}
                        <Link  onClick={() => setShow(!show)} href="/" className="block px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors duration-150">Home</Link>
                        <Link  onClick={() => setShow(!show)} href="/products" className="block px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors duration-150">Products</Link>
                        <Link  onClick={() => setShow(!show)} href="/shops" className="block px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors duration-150">Shops</Link>
                        <Link  onClick={() => setShow(!show)} href="/offers" className="block px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors duration-150">Offers</Link>
                      
                       
                    </div>}
                </div>


                {/* Navigation Links */}
                <div className='hidden md:flex items-center gap-8'>
                    {navItems.map((i, index: number) => (
                        <Link className='font-medium text-slate-600 hover:text-blue-600 transition-all duration-200 transform hover:-translate-y-px' href={i.href} key={index}  > 
                            {i.title}
                        </Link>
                    ))}
                </div>
                
                {/* This div now correctly renders the sticky icons */}
                <div>
                    {isSticky && (
                        <div className='flex items-center space-x-8' >
                            <div className='flex items-center gap-3' >
                                {!isLoading && user ? (<>
                                    <Link href={'/profile'} className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full">
                                        { user?.avatar && user?.avatar[0]?.url ?<Image src={ user?.avatar[0]?.url} width={35}height={35} className='rounded-full' alt={'Profile Image'} />:<User  className="text-slate-600" />}
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-500 block">Hello,</span>
                                            <span className="font-bold text-slate-800">{user?.name?.split(" ")[0]}</span>
                                        </div>
                                    </Link>
                                </>) : <>
                                    <Link className='flex items-center gap-2 font-semibold text-slate-600 hover:text-blue-600 transition-colors' href={"/login"} > 
                                      <User /> 
                                      <span>{isLoading ? '...' : "Sign In"}</span>
                                    </Link>
                                </>}
                            </div>
                            
                            <div className="flex items-center space-x-6">
                                <Link href={'/wishlist'} className='relative' >
                                    <Heart className="text-slate-600 hover:text-blue-600 transition-transform hover:scale-110" />
                                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                                        <span className='text-white font-bold text-[10px]' >{wishlist?.length}</span>
                                    </div>
                                </Link>
                                <Link href={'/cart'} className='relative' >
                                    <ShoppingCart className="text-slate-600 hover:text-blue-600 transition-transform hover:scale-110" />
                                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                                        <span className='text-white font-bold text-[10px]' >{cart?.length}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>)}
                </div>
            </div>
        </div>
    )
}

export default HeaderBottom;