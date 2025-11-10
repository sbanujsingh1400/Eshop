'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { countries } from '@/app/configs/countries';
import { MapPin, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import axiosInstance from '../../../utils/axiosInstance';


// NOTE: All logic and JSX structure are IDENTICAL to your original code. 
// Only the className strings have been updated for a better UI.

const ShippingAddressSection = () => {
   
    const [showModal,setShowModal]= useState(false);
    const queryClient = useQueryClient();

    const {register,handleSubmit,reset,formState:{errors}}= useForm(
        {
            defaultValues:{
                label:"Home",
                name:"",
                street:"",
                city:"",
                zip:"",
                country:"India",
                isDefault:"false",
            
            }
        }
    )

    const {mutate:addAddress}= useMutation({
        mutationFn:async (payload)=>{
            const res:any = await axiosInstance.post('/add-address',payload);
            return res.data.address;
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['shipping-addresses']});
            reset();
            setShowModal(false);
            
        }
    })


    const {data:addresses,isLoading}= useQuery({
        queryKey:["shipping-addresses"],
        queryFn:async ()=>{
            const res:any = await axiosInstance.get('/shipping-addresses');
            return res.data.addresses
        }
    })
       
    const onSubmit = (data:any)=>{
         addAddress({...data,isDefault:data?.isDefault===true})
    }

    const {mutate:deleteAddress} = useMutation({
        mutationFn:async (id:string)=>{
            await axiosInstance.delete(`/delete-address/${id}`);
        },
        onSuccess : ()=>{
            queryClient.invalidateQueries({queryKey:["shipping-addresses"]})
        }
    })

  return (
    <div className='space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center border-b border-slate-200 pb-4' >
         <h2 className='text-xl font-bold text-slate-800' >
            Saved Addresses
         </h2>
         <button  onClick={()=>setShowModal(true)} className='flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors' >
            <Plus className='w-4 h-4' /> Add New Address
         </button>
        </div>

        {/* Address List */}
        <div>
      {isLoading ? (<p className='text-center py-12 text-slate-500 bg-slate-50 rounded-lg'>Loading Addresses...</p>): !addresses || addresses.length===0 ?(<p className='text-center py-12 text-slate-500 bg-slate-50 rounded-lg'>No saved addresses found.</p>):(<div className='grid grid-cols-1 sm:grid-cols-2 gap-6' >
         {addresses.map((address:any)=>{
            return <div key={address.id} className='border border-slate-200 rounded-xl p-5 relative transition-all duration-300 hover:shadow-lg hover:border-blue-500'>
               {address?.isDefault && <span className='absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full'>Default</span>}
               <div className="flex items-start gap-4 text-sm text-slate-700">
                <MapPin className='w-6 h-6 text-slate-400 flex-shrink-0 mt-1' />
                <div>
                    <p className='font-bold text-slate-800'>
                        {address.label} - {address.name}
                    </p>
                    <p className="text-slate-600 mt-1">
                        {address.street}, {address.city}, {address.zip}, {address.country}
                    </p>
                </div>
               </div>
               <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                <button className='flex items-center gap-1 cursor-pointer text-xs text-red-500 hover:text-red-700 transition-colors' onClick={()=>deleteAddress(address.id)} >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
               </div>
            </div>
         })}
      </div>)}
        </div>

        {/* Modal */}
        {showModal && (<div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4' >
            <div className='bg-white w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-xl relative' >
                <button className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors' onClick={()=>setShowModal(false)} > <X className='w-5 h-5 ' /> </button>
                <h3 className='text-xl font-bold mb-6 text-slate-900' >
                    Add New Address
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' >
                    <select {...register("label")} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                    </select>

                    <input type="text" placeholder='Full Name' {...register("name",{required:"Name is required"})} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' />
                    {errors.name && (<p className='text-red-500 text-xs mt-1' >{errors.name.message}</p>)}

                    <input type="text" placeholder='Street Address' {...register("street",{required:"Street is required"})} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' />
                    {errors.street && (<p className='text-red-500 text-xs mt-1' >{errors.street.message}</p>)}

                    <input type="text" placeholder='City' {...register("city",{required:"City is required"})} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' />
                    {errors.city && (<p className='text-red-500 text-xs mt-1' >{errors.city.message}</p>)}

                    <input type="text" placeholder='Zip Code' {...register("zip",{required:"Zip Code is required"})} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' />
                    {/* The original code had a bug here, displaying errors.name.message for the zip input. I've preserved this bug as requested. */}
                    {errors.name && (<p className='text-red-500 text-xs mt-1' >{errors.name.message}</p>)}
                    
                    <select {...register("country")} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' >
                       {countries.map(country=> <option key={country} value={country}>{country}</option>)}
                    </select>

                    <select {...register("isDefault")} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' >
                        <option value="true">Set as Default</option>
                        <option value="false">Not Default</option>
                    </select>
                    <button type='submit' className='w-full mt-4 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600' >Save Address</button>
                </form>
            </div>
        </div>)}
    </div>
  )
}

export default ShippingAddressSection