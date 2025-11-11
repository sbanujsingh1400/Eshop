'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Ratings from '../ratings'
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import ProductDetailsCard from './ProductDetailsCard';
import { useStore } from '../../../store';
import useUser from '../../../hooks/useUser';
import useLocationTracking from '../../../hooks/useLocationTracking';
import useDeviceTracking from '../../../hooks/useDeviceTracking';
import toast from 'react-hot-toast';

// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a better UI.

const ProductCard = ({product,isEvent}:{product:any, isEvent?:boolean}) => {
const [timeLeft,setTimeLeft]= useState("");
const {user}= useUser()
const location = useLocationTracking();
const deviceInfo = useDeviceTracking();
const [open,setOpen]= useState(false);
const addTocart = useStore((state:any)=>state.addToCart);
const removeFromCart=useStore((state:any)=>state.removeFromCart);
const addToWishlist = useStore((state:any)=>state.addToWishlist);
const removeFromWishlist = useStore((state:any)=>state.removeFromWishlist);
const wishlist = useStore((state:any)=>state.wishlist);
const isWishlisted= wishlist.some((item:any)=>{ 
  return item.id==product.id});
const cart = useStore((state:any)=>state.cart)
const isInCart= cart.some((item:any)=>item.id===product.id)

  
useEffect(()=>{
   
    if(isEvent && product?.ending_date){
        const interval = setInterval(()=>{
            const endTime = new Date(product.ending_date).getTime();
            const now = Date.now();
            const diff = endTime - now;
            if(diff <=0){
                setTimeLeft("Expired");
                clearInterval(interval)
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${days}d ${hours}h ${minutes}m left`);

        }, 1000);
       return ()=>{clearInterval(interval)}
    }

    return ;

},[isEvent,product?.ending_date])

  return (
    <div className='w-full h-full bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200/80 relative flex flex-col group transition-all duration-300 ' >
       
        {isEvent &&(<div className='absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10' >
            OFFER
            </div>   )}

         {product?.stock <= 5 && <div className='absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10' >Limited Stock</div>}
         <Link href={`/product/${product?.slug}`} className="block overflow-hidden rounded-t-xl">
            <img src={product?.images[0]?.url} alt={product?.title} width={300} height={300} className='w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110' />
         </Link>
         
         <div className="flex flex-col flex-grow p-4">
             <Link href={`/shop/${product?.Shop?.id}` }>
               <span className='block text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors' >{product?.Shop?.name}</span>
             </Link>
             <Link href={`/product/${product?.slug}`}>
               <h3 className='text-base font-bold mt-1 text-slate-800 line-clamp-2 h-12 leading-tight' >{product?.title}</h3>
             </Link>

             <div className='mt-2' >
                <Ratings rating={product?.ratings || 0} />
             </div>
             
             <div className="mt-auto pt-3 flex justify-between items-center border-t border-slate-200/80">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">
                  ${product?.sale_price}
                </span>
                {/* NOTE: This second span is styled as a regular price. You may want to pass `product.regular_price` to it. */}
                <span className="text-sm font-medium text-slate-400 line-through">
                  ${product?.regular_price || product?.sale_price} 
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                  {product?.totalSales || 0} sold
              </span>
            </div>

            {isEvent && timeLeft &&(<div className='mt-2 text-center' >
              <span className='inline-block text-xs bg-red-50 text-red-600 font-semibold px-2 py-1 rounded' >{timeLeft}</span>
            </div>)}
         </div>

         <div className="absolute z-10 flex flex-col gap-2 right-4 top-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <div className='bg-white rounded-full p-2 shadow-lg border border-slate-200/80' >
                <Heart className='cursor-pointer transition' size={20} fill={isWishlisted?'#ef4444':'transparent'} stroke={isWishlisted?'#ef4444':'#4b5563'}  onClick={()=> { 
                     if(!user){
                      toast.error("Please login to wishlist product !")
                      return;
                    }
                  isWishlisted?removeFromWishlist(product.id,user,location,deviceInfo):addToWishlist({...product,quantity:1},user,location,deviceInfo)
                  }}/>
            </div>
            <div className='bg-white rounded-full p-2 shadow-lg border border-slate-200/80' >
                <Eye className='cursor-pointer text-slate-500 hover:text-blue-500 transition' size={20} onClick={()=>setOpen(!open)} />
            </div>
            <div className='bg-white rounded-full p-2 shadow-lg border border-slate-200/80' >
                <ShoppingBag className='cursor-pointer text-slate-500 hover:text-blue-500 transition' fill={isInCart?'#facc15':'transparent'} size={20} onClick={()=> isInCart ?removeFromCart(product?.id,user,location,deviceInfo):addTocart({...product,quantity:1},user,location,deviceInfo)}  />
            </div>
         </div>
         {open && (<ProductDetailsCard data={product}  setOpen={setOpen} /> )}
    </div>
  )
}

export default ProductCard