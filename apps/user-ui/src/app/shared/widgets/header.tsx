'use client'
import Link from 'next/link'
import React from 'react'
import { Search, User, Heart, ShoppingCart, LogIn } from 'lucide-react'
import HeaderBottom from './header-bottom'
import useUser from '../../hooks/useUser'
import { useStore } from '../../store'
import Image from 'next/image'
import ProductSearch from '../components/ProductSearch'

// --- NEW REUSABLE COMPONENTS FOR A CLEANER UI ---

/**
 * @description A reusable link component for action icons with notification badges.
 */
const IconLink = ({ href, IconComponent, count }: { href: string, IconComponent: React.ElementType, count: number }) => (
  <Link href={href} className="relative flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors">
    <IconComponent strokeWidth={1.5} />
    {count > 0 && (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
        <span className="text-white font-bold text-xs">{count}</span>
      </div>
    )}
  </Link>
);

/**
 * @description A component to handle the display of user login/profile status.
 */
const UserAccountNav = ({ user, isLoading }: { user: any, isLoading: boolean }) => {
  
  if (isLoading) {
    return <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md" />;
  }

  if (!user) {
    return (
      <Link href="/login" className="flex items-center gap-2 font-semibold text-slate-600 hover:text-blue-600 transition-colors">
        <LogIn strokeWidth={1.5} />
        <span>Login</span>
      </Link>
    );
  }

  return (
    <Link href="/profile" className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full">
        { user?.avatar && user?.avatar[0]?.url ?<Image src={ user?.avatar[0]?.url} width={35}height={35} className='rounded-full' alt={'Profile Image'} />:<User  className="text-slate-600" />}

      </div>
      <div>
        <span className="text-sm text-slate-500 block">Hello,</span>
        <span className="font-bold text-slate-800">{user?.name?.split(" ")[0]}</span>
      </div>
    </Link>
  );
};



// --- ENHANCED HEADER COMPONENT ---

const Header = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
console.log(process.env.NEXT_PUBLIC_SELLER_URI_LOCAL,process.env.NODE_ENV=='production');
  return (
    <header className='w-full bg-white shadow-sm sticky top-0 z-50'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <div className='flex-shrink-0'>
            <Link href={'/'}>
              <span className='text-3xl font-bold text-slate-800 tracking-tight'>Eshop</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className='w-full max-w-lg relative'>
          <ProductSearch />
          </div>

          {/* Actions */}
          <div className='flex items-center space-x-8'>
            <UserAccountNav user={user} isLoading={isLoading} />
            <div className="flex items-center space-x-6">
                <IconLink href="/wishlist" IconComponent={Heart} count={wishlist?.length || 0} />
                <IconLink href="/cart" IconComponent={ShoppingCart} count={cart?.length || 0} />
            </div>
          </div>
        </div>
      </div>

      <div className='border-b border-b-slate-200' />
      
    <HeaderBottom />
  
    </header>
  );
};

export default Header;