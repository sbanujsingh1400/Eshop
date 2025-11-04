'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus,ChevronRight, Trash, X } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import axiosInstance from '../../../utils/axiosInstance'
import toast  from 'react-hot-toast'
import { Controller, useForm } from 'react-hook-form'

// @ts-ignore
import { AxiosError } from 'axios'
import DeleteDiscountCodeModal from '../../../shared/components/modals/DeleteDiscountCodeModal'
import Input from '../../../../../../../packages/components/input'

const page = () => {

   const [showModel , setShowModal] = useState(false);
   const [showDeleteModel , setShowDeleteModal] = useState(false);
   const [selectedDiscount,setSelectedDiscount]= useState<any>();

   const queryClient = useQueryClient()

   const {data:discountCodes=[],isLoading}= useQuery({
    queryKey:["shop-discounts"],
    queryFn:async ()=>{
        const res = await axiosInstance.get("/product/get-discount-code")
        // @ts-ignore
        return res?.data?.discount_code || [];
    }
   })
 const {register,handleSubmit,control,reset,formState:{errors}}= useForm({defaultValues:{
    public_name:"",
    discountType:"percentage",
    discountValue:"",
    discountCode:""
 }})
    
  const createDiscountCodeMutation = useMutation({
    mutationFn: async(data)=>{
        await axiosInstance.post("/product/create-discount-code",data);
    },
    onSuccess:()=>{
         queryClient.invalidateQueries({queryKey:["shop-discounts"]});
         reset()
         setShowModal(false);
    }
  })

   
  const deleteDiscountMutation = useMutation({
    mutationFn: async(discount)=>{
        await axiosInstance.delete("/product/delete-discount-code/"+discount);
    },
    onSuccess:()=>{
         queryClient.invalidateQueries({queryKey:["shop-discounts"]});
         
         setShowDeleteModal(false);
    }
  })

   const handleDeleteClick = (discount:any)=>{
    setSelectedDiscount(discount);
     setShowDeleteModal(true)

   }

    const onSubmit = (data:any)=>{
        if(discountCodes.length>=8){
            toast.error("You can only create up to 8 discount codes. ")
            return ;
        }
        createDiscountCodeMutation.mutate(data)
    }

console.log(selectedDiscount)
  return (
    <div className='w-full space-y-6' >

        <div className='flex justify-between items-center' >
            <h2 className='text-3xl text-white font-bold' >Discount Codes</h2>
            <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors' onClick={()=>setShowModal(true)} >
                <Plus size={18} /> Create Discount 
            </button>

        </div>
   {/* Breadcrumbs */}
  <div className="flex items-center text-sm">
    <Link href={'/dashboard'} className='cursor-pointer text-blue-400 hover:text-blue-300' >
        Dashboard
    </Link>
    <ChevronRight size={16} className='text-slate-500 mx-1' />
    <span className="text-slate-400"> Discount Codes</span>
</div>

   
   <div className="overflow-x-auto bg-slate-800/80 rounded-lg border border-slate-700" >
    <h3 className='text-lg font-semibold text-slate-100 p-4 border-b border-slate-700' >
        Your Discount Codes
    </h3>
    { isLoading ? (<p className='text-center py-20 text-slate-400'>Loading discounts...</p>):(
        <table className='w-full text-sm text-left text-slate-400' >
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                <tr >
                <th className="p-4 font-semibold tracking-wider">Title</th>
                <th className="p-4 font-semibold tracking-wider">Type</th>
                <th className="p-4 font-semibold tracking-wider">Value</th>
                <th className="p-4 font-semibold tracking-wider">Code</th>
                <th className="p-4 font-semibold tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
{discountCodes?.map((discount:any)=>{
    // The original code had a bug where it was displaying public_name twice.
    // Preserving this bug as per instructions to only change classNames.
    return <tr key={discount?.id}  className='hover:bg-slate-800 transition-colors' >
        <td className='p-4 align-middle font-medium text-slate-200'>{discount?.public_name}</td>
        <td className='p-4 align-middle capitalize'>{discount?.public_name}</td>
        <td className='p-4 align-middle capitalize' >
            {discount.discountType ==='percentage'?"Percentage (%)":"Flat ($)"}
        </td>
        <td className='p-4 align-middle' >
            {discount.discountType ==='percentage'?`${discount.discountValue}%`:`$${discount.discountValue}`}
        </td>
        <td className='p-4 align-middle font-mono text-slate-300'>{discount?.discountCode}</td>
        <td className='p-4 align-middle'>
            <button onClick={()=>handleDeleteClick(discount)} className='text-slate-400 hover:text-red-500 transition-colors'  >
                <Trash size={18} />
            </button>
            </td>
    </tr>
})}



            </tbody>
        </table>
        
    )}
    {!isLoading && discountCodes?.length===0 &&(<p className='text-center py-20 text-slate-500' >No Discount Codes Available</p>)}
   </div>

   {/* create discounts modal  */}

   {showModel && (<div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4' >
    
      <div className='bg-slate-800 p-6 rounded-xl w-full max-w-lg shadow-2xl shadow-black/20 border border-slate-700' >

      <div className='flex justify-between items-center border-b border-slate-700 pb-4' >

        <h3 className='text-lg font-semibold text-slate-100' > Create Discount Code </h3>
        <button onClick={()=>setShowModal(false)} className='text-slate-400 hover:text-white transition-colors' >
            <X  size={22} />
        </button>
      </div>
 <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-4' >
   {/* Title */}
   <Input label='Title (Public Name)' {...register('public_name',{required:"Title is required"})} />
   {errors.public_name && (<p className='text-red-500 text-xs mt-1' >
    {errors.public_name.message}
   </p>)}

   {/* Discount */}
   <div >
   <label className="block text-sm font-semibold text-slate-300 mb-1.5">Discount Type</label>
   <Controller  control={control} name="discountType" render={({field})=>(<select {...field} className='w-full border border-slate-700 bg-slate-800/50 px-4 py-2.5 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' >
    <option value={"percentage"} >Percentage (%)</option>
    <option value={"flat"} >Flat Amount ($)</option>
   </select>)} />

   </div>
   {/* Discount Value */}
   <div >
   <Input label='Discount Value' type='number' min={1} {...register('discountValue',{required:"Value is required"})} />
   </div>
   <div >
   <Input label='Discount Code' min={1} {...register('discountCode',{required:"Discount code is required"})} />
   </div>
   <button type='submit' disabled={createDiscountCodeMutation.isPending} className='!mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50' >
    <Plus size={18} />
    {createDiscountCodeMutation.isPending?"Creating...":'Create'}
   </button>
   {createDiscountCodeMutation.isError &&(<p className='text-red-500 text-sm text-center mt-2'>
    {(createDiscountCodeMutation.error as AxiosError<{message:string}>)?.response?.data?.message || "Something went wrong" }
   </p>)}
 </form>
      </div>

     </div>)}

     {showDeleteModel && selectedDiscount && (<DeleteDiscountCodeModal discount={selectedDiscount} onClose={()=>{setShowDeleteModal(false)} } onConfirm={()=>{deleteDiscountMutation.mutate(selectedDiscount.id)}} />)}

    </div>
  )
}

export default page;