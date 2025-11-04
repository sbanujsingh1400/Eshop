'use client'
import React, { useEffect, useState } from 'react'
import useUser from '../../hooks/useUser';
import useLocationTracking from '../../hooks/useLocationTracking';
import useDeviceTracking from '../../hooks/useDeviceTracking';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '../../store';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const CartPage = () => {
  const router = useRouter();
    const {user}= useUser()
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const cart = useStore((state:any)=>state.cart)
    const removeFromCart = useStore((state:any)=>state.removeFromCart);
    const [loading,setLoading] =useState(false);
    const [discountedProductId,setDiscountedProductId]= useState('')
    const [discountPercent,setDiscountPercent]= useState(0)
    const [discountAmount,setDiscountAmount]= useState(0)
    const [couponCode,setCouponCode]= useState('')
    const [selectedAddressId,setSelectedAddressId]= useState('');
    const [error,setError]= useState('')
 const [storedCouponCode,setStoredCouponCode]= useState('')

    const couponCodeapplyHandler = async ()=>{
      
      setError('');
      if(!couponCode.trim()){
        setError('Coupon code is required');
        return ;
      }
  
      try {
          
        const res :any = await axiosInstance.put(`/order/verify-coupon`,{couponCode:couponCode.trim(),cart});
        console.log(res.data)
        if(res.data.valid){
          setStoredCouponCode(couponCode.trim());
          setDiscountAmount(parseFloat(res.data.discountAmount));
          setDiscountPercent(res.data.discount);
          setDiscountedProductId(res.data.discountedProductId);
          setCouponCode("");
        }else{
          setDiscountAmount(0);
          setDiscountPercent(0);
          setDiscountedProductId('');
          setError(res.data.message || "Couponnot valid for any items in the cart")
        }
         
      } catch (error:any) {
        setDiscountAmount(0);
        setDiscountPercent(0);
        setDiscountedProductId('');
        setError(error?.response?.data?.message || "Couponnot valid for any items in the cart")
      }

    }

    const decreseQuantity = (id:string)=>{
        useStore.setState((state:any)=>({cart:state.cart.map((item:any)=>item.id ==id && item.quantity > 1 ?{...item,quantity:item.quantity-1}:item)}))
   }

   const increaseQuantity = (id:string)=>{
     useStore.setState((state:any)=>({cart:state.cart.map((item:any)=>item.id ==id ? {...item,quantity:(item.quantity?? 1)+1}:item)}))
}
const removeItem=(id:string)=>{
    // console.log(id)
    removeFromCart(id,user,location,deviceInfo)
}
const subtotal = cart.reduce((total:number,item:any)=>total+item.quantity*item.sale_price,0);

const {data:addresses,isLoading}= useQuery({
  queryKey:["shipping-address"],
  queryFn:async ()=>{
      const res:any = await axiosInstance.get('/shipping-addresses');
      // console.log(res.data)
      return res.data.addresses
  }
})
 
useEffect(()=>{
  
  if(addresses?.length>0 && !selectedAddressId){
    const defaultAddr = addresses.find((addr:any)=>addr?.isDefault);

    if(defaultAddr){
      setSelectedAddressId(defaultAddr?.id)
    }
  }

},[addresses,selectedAddressId]);


    const createPaymentSession = async ()=>{
      if(addresses?.length ===0)toast.error("Please set your delivery address to create an order!")
      if(!user?.id){
        toast.error("Please login to proceed with checkout !")
        
      return ;
      }
      setLoading(true);
   try {
     
    const res:any = await axiosInstance.post("/order/create-payment-session",{
      cart,selectedAddressId,coupon:{
        code:storedCouponCode,
        discountAmount,
        discountPercent,
        discountedProductId
      },
    });
  console.log(res?.data);
    const sessionId = res?.data?.sessionId;
    router.push(`/checkout?sessionId=${sessionId}`);

   } catch (error) {
      toast.error("Something went wrong. Please try again");
   } finally {
    setLoading(false);
   }

    }

     
console.log(cart)
  return (
    <div className='w-full bg-white' >
        
        <div className='md:w-[80%] w-[95%] mx-auto min-h-screen' >

            <div className='pb-[50px]' >
              <h1 className='md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost' >
                Shopping Cart
              </h1>
              <div>
    <Link href={"/"} className="text-[#55585b] hover:underline">
      Home
    </Link>
    
    {/* This span acts as a dot separator */}
    <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full" />
    
    <span className="text-[#55585b]">Cart</span>
  </div>
            </div>

{
    cart.length ===0 ? (<div className='text-center text-gray-600 text-lg '>Your cart is empty! Start adding products.</div>):(
    <div className='lg:flex items-start gap-10'>
    <table className='w-full lg:w-[70%] border-collapse ' >
    <thead className="bg-[#f1f3f4]">
        <tr>
          <th className="py-3 text-left pl-4">Product</th>
          <th className="py-3 text-left">Price</th>
          <th className="py-3 text-left">Quantity</th>
          
          <th className="py-3 text-left"></th>
        </tr>
      </thead>
      <tbody>
        {cart?.map((item:any)=>(<tr key={item.id} className='border-b border-b-[#0000000e]' >

        <td className='flex items-center gap-4 p-4' >
                <Image src={item.images[0].url} alt={item.title} width={80} height={80} className='rounded' />
                
                <div className='flex flex-col' >
                    <span className='font-medium' >{item.title}</span>
                    {item?.selectedOptions &&(<div className='text-sm text-gray-500' >
                        {item?.selectedOptions?.color &&
                        <span>
                            Color: {}
                            <span style={{
                                backgroundColor:item?.selectedOptions?.color,
                                width:"12px",
                                height:"12px",
                                borderRadius:"100%",
                                display:"inline-block"
                            }} ></span> 
                            </span>}

                            {item?.selectedOptions.size &&(<span className='ml-2' >
                                size:{item?.selectedOptions?.size}
                            </span>)}
                    </div>)}
                </div>
            </td>
            <td className='px-6 text-lg text-center' >
             {item?.id === discountedProductId?(<div className='flex flex-col items-center '>
                <span className='line-through text-gray-500 text-sm' >{item.sale_price.toFixed(2)}</span>
                <span className='text-green-600 font-semibold' > ${((item.sale_price *(100-discountPercent))/100).toFixed(2)} </span>
             </div>):(<span> ${item?.sale_price.toFixed(2)}</span>)}
            </td>
         
            <td>
                <div className='flex justify-center items-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]' >
                    <button className='text-black cursor-pointer text-xl' onClick={()=>decreseQuantity(item.id)} >-</button>
                    <span className='px-4' > {item?.quantity} </span>
                    <button className='text-black cursor-pointer text-xl' onClick={()=>increaseQuantity(item.id)}  >+</button>
                </div>
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
    <div className='p-6 shadow-md lg:w-[30%] bg-[#f9f9f9] rounded-lg  ' >
    {discountAmount >0 && (<div className='flex justify-between items-center text-[#010f1c] text-base font-medium pb-1'>

        <span className='font-jost' >Discount ({discountPercent}%)</span>
        <span className='text-green-600' >${discountAmount.toFixed(2)}</span>
    </div>)}
    <div className="flex justify-between text-[#010f1c] text-[20px] font-[550] pb-3  ">
        <span>Subtotal</span>
        <span>${(subtotal-discountAmount).toFixed(2)}</span>
    </div>
    <hr className='my-4 text-slate-200' />
    <div className="mb-[7px] font-[500] text-[15px]">
        Have a Coupon?
    </div>
    <div className="flex flex-col">
        <div className='flex'>
        <input type="text" value={couponCode} onChange={(e:any)=>setCouponCode(e.target.value)} placeholder='Enter coupon code'  className='w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500' />
        <button
  className="bg-blue-500 cursor-pointer text-white px-4 rounded-r-md hover:bg-blue-600 transition-all"
  onClick={couponCodeapplyHandler} 
>
  Apply
</button>
        </div>
{error &&<p className='text-sm pt-2 text-red-500' >{error}</p>}
    </div>
    <hr className='my-4 text-slate-200' />
    <div className="mb-4">
        <h4 className=' mb-[7px] font-medium text-[15px] ' >
            Select Shipping Address
        </h4>
       {addresses?.length !==0&& <select  value={selectedAddressId} className='w-full p-2 border-gray-200 rounded-md focus:outline-none  focus:border-blue-500'  onChange={(e:any)=>setSelectedAddressId(e.target.value)} >
           {addresses?.map((address:any)=>( <option key={address?.id} value={address?.id}>{address?.label} - {address?.city} ,{address?.country}</option>))}

        </select>}
    </div>
    <hr className='my-4 text-slate-200'  />
    <div className='mb-4' >
    <h4 className=' mb-[7px] font-medium text-[15px] ' >
            Select Payment Method
        </h4>
        <select  className='w-full p-2 border-gray-200 rounded-md focus:outline-none  focus:border-blue-500'   >
            <option value="credit_card">Online Payment</option>
            <option value="cash_on_delivery">Cash on Delivery</option>

        </select>
    </div>
    <hr className='my-4 text-slate-200'  />

    <div className="flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3 ">
        <span className='font-jost' >Total</span>
        <span>${(subtotal-discountAmount).toFixed(2)}</span>
    </div>
    <button
   onClick={createPaymentSession} 
  disabled={loading}
  className="w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989FF] transition-all rounded-lg"
>
  {/* Show a spinner icon only when loading */}
  {loading && <Loader2 className="animate-spin w-5 h-5" />}
  
  {/* Change the button text based on the loading state */}
  {loading ? "Redirecting..." : "Proceed to Checkout"}
</button>
    </div>
    </div>)
}


        </div>

    </div>
  )
}

export default CartPage