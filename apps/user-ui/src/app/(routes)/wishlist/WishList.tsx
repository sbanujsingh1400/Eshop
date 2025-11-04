'use client'

import React from 'react'
import useUser from '../../hooks/useUser';
import useLocationTracking from '../../hooks/useLocationTracking';
import useDeviceTracking from '../../hooks/useDeviceTracking';
import { useStore } from '../../store';
import Link from 'next/link';
import Image from 'next/image';

const wishlistPage = () => {
    const {user}= useUser()
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    
    const addTocart = useStore((state:any)=>state.addToCart);
    const addToWishlist = useStore((state:any)=>state.addToWishlist);
    const removeFromWishlist = useStore((state:any)=>state.removeFromWishlist);
    const wishlist = useStore((state:any)=>state.wishlist);
    // const isWishlisted= wishlist.some((item:any)=>{ 
    //     //  console.log(item);
    //     return item.id==data.id});
      const cart = useStore((state:any)=>state.cart)
    //   const isInCart= cart.some((item:any)=>item.id===data.id)
      //  console.log(cart)
    
      const decreseQuantity = (id:string)=>{
           useStore.setState((state:any)=>({wishlist:state.wishlist.map((item:any)=>item.id ==id && item.quantity > 1 ?{...item,quantity:item.quantity-1}:item)}))
      }

      const increaseQuantity = (id:string)=>{
        useStore.setState((state:any)=>({wishlist:state.wishlist.map((item:any)=>item.id ==id ? {...item,quantity:(item.quantity?? 1)+1}:item)}))
   }
   const removeItem=(id:string)=>{
    removeFromWishlist(id,user,location,deviceInfo)
   }
  return (
    <div  className='w-full bg-white'>
        <div className='md:w-[80%] w-[95%]  mx-auto min-h-screen ' >

          {/* Breadcrumb */}
<div className="pb-[50px]">
  <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost">
    Wishlist
  </h1>

  <div>
    <Link href={"/"} className="text-[#55585b] hover:underline">
      Home
    </Link>
    
    {/* This span acts as a dot separator */}
    <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full" />
    
    <span className="text-[#55585b]">Wishlist</span>
  </div>
</div>
{/* If wishlist is empty */}
{wishlist.length === 0 ? (
  // If true, show the empty state message
  <div className="text-center text-gray-600 text-lg">
    Your wishlist is empty! Start adding products.
  </div>
) : (
  // If false, show the wishlist table
  <div className="flex flex-col gap-10">
    {/* Wishlist Items Table */}
    <table className="w-full border-collapse">
      <thead className="bg-[#f1f3f4]">
        <tr>
          <th className="py-3 text-left pl-4">Product</th>
          <th className="py-3 text-left">Price</th>
          <th className="py-3 text-left">Quantity</th>
          <th className="py-3 text-left">Action</th>
          <th className="py-3 text-left"></th>
        </tr>
      </thead>
      
      <tbody>
        {wishlist?.map((item:any)=>(<tr key={item.id} className='border-b border-b-[#0000000e]' >
            <td className='flex items-center gap-4 p-4' >
                <Image src={item.images[0].url} alt={item.title} width={80} height={80} className='rounded' />
                <span>{item?.title}</span>
            </td>
            <td className='px-6 text-lg ' >
                ${item?.sale_price.toFixed(2)}
            </td>
            <td>
                <div className='flex justify-center items-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]' >
                    <button className='text-black cursor-pointer text-xl' onClick={()=>decreseQuantity(item.id)} >-</button>
                    <span className='px-4' > {item?.quantity} </span>
                    <button className='text-black cursor-pointer text-xl' onClick={()=>increaseQuantity(item.id)}  >+</button>
                </div>
            </td>
            <td>
            <button className="bg-[#2295FF] cursor-pointer text-white px-5 py-2 rounded-md hover:bg-[#007bff] transition-all" onClick={()=>addTocart(item,user,location,deviceInfo)} >
  Add to cart
</button>
            </td>
            <td>
  <button
    className="text-[#818487] cursor-pointer hover:text-[#ff1826] transition duration-200"
    onClick={() => removeItem(item.id)}
  >
    × Remove
  </button>
</td>
        </tr>))}
      </tbody>
      
    </table>
  </div>
)}


        </div>
        

    </div>
  )
}

export default wishlistPage