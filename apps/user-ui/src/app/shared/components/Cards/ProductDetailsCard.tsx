'use client'
import Image from 'next/image'
import Link from 'next/link';
import React, {useState } from 'react'
import Ratings from '../ratings';
import { Heart, MapPin, ShoppingCart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useLocationTracking from '../../../hooks/useLocationTracking';
import useDeviceTracking from '../../../hooks/useDeviceTracking';
import { useStore } from '../../../store';
import useUser from '../../../hooks/useUser';
import axiosInstance from '@/app/utils/axiosInstance';
import { isProtected } from '@/app/utils/protected';
import toast from 'react-hot-toast';


const ProductDetailsCard = ({data,setOpen}:{data:any,setOpen:(open:boolean)=>void}) => {
      const cart = useStore((state:any)=>state.cart)
      const [activeImage,setActiveImage]= useState(0);
      const [isLoading,setIsLoading]= useState(false);
      const [isSelected,setIsSelected]= useState(data?.colors?.[0]|| '');
      const [isSizeSelected,setIsSizeSelected]= useState(data?.sizes?.[0] || "");
      const [quantity,setQuantity]= useState(cart.find((item:any)=>item?.id==data?.id)?.quantity|| 1);
      const {user}= useUser()
const location = useLocationTracking();
const deviceInfo = useDeviceTracking();

const addTocart = useStore((state:any)=>state.addToCart);
const addToWishlist = useStore((state:any)=>state.addToWishlist);
const removeFromWishlist = useStore((state:any)=>state.removeFromWishlist);
const wishlist = useStore((state:any)=>state.wishlist);
const isWishlisted= wishlist.some((item:any)=>{ 
    return item.id==data.id});
  
  const isInCart= cart.some((item:any)=>item.id===data.id)
    
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate()+5);

      const router = useRouter();

 const handleChat = async ()=>{
  if(isLoading){
    return;
  }
setIsLoading(true);

try {
  console.log('inside chat')   

  const res:any = await axiosInstance.post('/chatting/create-user-conversationGroup',{sellerId:data?.Shop?.sellerId},isProtected);
  console.log(res.data);
  console.log('after chat')   
  router.push(`/inbox?conversationId=${res.data.conversation.id}`) ;
  console.log('after chat 1')   
  
} catch (error) {
  console.log(error)
  setIsLoading(false);
} finally{
  console.log('finally')
  setIsLoading(false);
}
   

 }

 const addtoCartDisable=(isInCart && quantity== cart.find((item:any)=>item?.id==data?.id)?.quantity )
// console.log(cart.find((item:any)=>item?.id==data?.id)?.quantity,isInCart && quantity== cart.find((item:any)=>item?.id==data?.id)?.quantity)
  return (
    <div className='fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-black/60 backdrop-blur-sm z-50 p-4' onClick={()=>setOpen(false)}  >
        
   <div className='w-full max-w-5xl h-auto max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-white shadow-2xl shadow-black/10 rounded-2xl relative' onClick={(e)=>e.stopPropagation()} >
        <div className='w-full flex flex-col md:flex-row gap-8 lg:gap-12' >
            <div className="w-full md:w-1/2 h-full ">
                <Image src={data?.images?.[activeImage]?.url} alt={data?.title} width={400} height={400}  className='w-full rounded-lg object-contain max-h-[450px]' />
           
            {/* Thumbnails */}
            <div className='flex items-center justify-center gap-3 mt-4' >
                {data.images?.map((img:any,index:number)=>{ 
                    return <div key={index} className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${activeImage===index ? 'ring-2 ring-blue-500 ring-offset-4' : 'border border-transparent'}`} onClick={()=>setActiveImage(index)} >
                    <Image src={ img?.url ||data?.images?.[activeImage]?.url} alt={`Thumbnail ${index}`} width={80} height={80}  className='rounded-md object-cover' />

                    </div>
                 })}
            </div>
            </div>
           
  <div className='w-full md:w-1/2' >
      {/* Seller Info */}
      <div className='border-b relative pb-4 border-slate-200 flex items-center justify-between ' >
        <div className='flex items-start gap-4' >
            {/* shop Logo */}
            {/* <Image src={data?.Shop?.avatar} alt='Shop Logo' width={60} height={60} className='rounded-full w-[60px] h-[60px] object-cover border' /> */}
            <div>
                <Link href={`/shop/${data?.Shop?.id}`} className='text-lg font-semibold text-slate-800 hover:text-blue-600' >
                    {data?.Shop?.name}
                </Link>
                <span className='block mt-1'>
                    <Ratings rating={data?.Shop?.ratings} />
                </span>
                <p className='text-slate-500 text-sm mt-1 flex items-center gap-1'>
                     <MapPin size={16} />{" "}
                     {data?.Shop?.address || "Location Not Available"}
                </p>
            </div>
        </div>
        <button className='flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors text-sm' onClick={()=>handleChat()} > 💬 Chat with seller </button>
         <button className='absolute -top-2 -right-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full p-1 transition-colors z-10' >
            <X  size={24} onClick={()=>setOpen(false)} />
         </button>
      </div>
      <h3 className='text-2xl lg:text-3xl font-bold text-slate-900 mt-4' >{data?.title}</h3>
      <p className='mt-2 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap w-full' >
        {data?.short_description }  
      </p>
      {/* Brand */}
      {data?.brand && <p className='mt-3 text-sm' >
        <strong className="text-slate-800">Brand:</strong> <span className="text-slate-600">{data?.brand}</span>
      </p>}

     {/* Color & Size Selection */}
     <div className="flex items-start gap-6 mt-5">
            {/* Color Options */}
 {data?.colors && data.colors.length > 0 && (
        <div>
          <strong className="text-slate-800 text-sm font-semibold">Color:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.colors.map((color: string, index: number) => (
              <button
                key={index}
                onClick={() => setIsSelected(color)}
                className={`w-8 h-8 cursor-pointer rounded-full border-2 transition-all duration-300 ${
                  isSelected === color
                    ? "ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-md"
                    : "border-slate-200"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* --- Size Options Section --- */}
      {data?.sizes && data.sizes.length > 0 && (
        <div>
          <strong className="text-slate-800 text-sm font-semibold">Size:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.sizes.map((size: string, index: number) => (
              <button
                key={index}
                onClick={() => setIsSizeSelected(size)}
                className={`px-4 py-1.5 cursor-pointer rounded-full transition-colors duration-200 font-medium text-sm border ${
                  isSizeSelected === size
                    ? "bg-slate-900 text-white shadow-md border-slate-900"
                    : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
</div>
      {/* Price Section */}
      <div className='mt-5 flex items-baseline gap-3' >
   <h3 className='text-3xl font-bold text-slate-900' > 
   ${data?.sale_price}
   </h3>
  {data?.regular_price && (<h3 className='text-lg text-red-500 line-through opacity-70' >
  ${data?.regular_price}
  </h3>)}
      </div>
      {data.stock>0 ?(<span className='text-sm text-green-600 font-semibold'>In Stock</span>):(<span className='text-sm text-red-600 font-semibold'>Out of Stock</span>)}

      <div className="mt-5 flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-slate-300">
            <button className='px-4 py-2 cursor-pointer text-slate-800 font-bold hover:bg-slate-100 rounded-l-lg transition-colors' onClick={()=>setQuantity((prev:number)=>Math.max(1,prev-1))} >-</button>
            <span className='px-5 py-2 bg-white font-semibold text-slate-900' >{quantity}</span>
            <button className='px-4 py-2 cursor-pointer text-slate-800 font-bold hover:bg-slate-100 rounded-r-lg transition-colors' onClick={()=>setQuantity((prev:number)=>(prev+1))} >+</button>
        </div>
    <button disabled={addtoCartDisable}  className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg transition-all transform hover:-translate-y-px active:translate-y-0 ${addtoCartDisable ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}  onClick={()=> !addtoCartDisable &&addTocart({...data,quantity:quantity},user,location,deviceInfo)} >
        <ShoppingCart size={20} /> {addtoCartDisable?"Already added":"Add to Cart"}
    </button>
    <button className='flex-shrink-0 p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors' >
        <Heart size={24} fill={isWishlisted?'#ef4444':'transparent'} stroke={isWishlisted?'#ef4444':'#4b5563'}  onClick={()=> { 
            if(!user){
               toast.error("Please login to wishlist product !")
              return;
            }
            isWishlisted?removeFromWishlist(data.id,user,location,deviceInfo):addToWishlist({...data,quantity:1},user,location,deviceInfo)
            }} />
    </button>
      </div>
     </div>


        </div>
   </div>
    </div>
  )
}

export default ProductDetailsCard