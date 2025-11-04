'use client';

import axiosInstance from '@/app/utils/axiosInstance';
import { countries } from '@/app/utils/countries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ShopDetailsFormProps {
  initialData: {
    id: string;
    name: string;
    description: string;
    // Add other shop profile fields here
  };
  onClose: () => void;
  onUpdateSuccess: () => void;
}

type FormData = {
  name:string,
  bio:string
  category:string,
  address:string,
  opening_hours:string,
  website:string

  
}
const ShopDetailsForm: React.FC<ShopDetailsFormProps> = ({
  initialData,
  onClose,
  onUpdateSuccess
}:any) => {
  const [isLoading,setIsLoading]= useState(false);
  const queryClient= useQueryClient();

  const {
    register,
    handleSubmit,
    formState:{errors},
    
 } = useForm<FormData>({
  defaultValues:{
    name:initialData.name,
    bio:initialData.bio,
    category:initialData.category,
    address:initialData.address,
    opening_hours:initialData.opening_hours,
    website:initialData.website 
  }
 });

 const updateShopMutation = useMutation({mutationFn:async (data:FormData)=>{
  //  console.log(`${process.env.NEXT_PUBLIC_SERVER_URI}/user-registration`,data);
      const response = await axiosInstance.put(`/shop-details-update`,data);
       setIsLoading(true);
      console.log(response);
      return response.data;
   },onSuccess:(_,formData)=>{
     setIsLoading(false)
     onClose()
     queryClient.invalidateQueries({ queryKey:["seller"] });
     
   },
  onError:()=>{
    setIsLoading(false)
  }
  })
  

  const onSubmit= async(data:any)=>{
    updateShopMutation.mutate(data);
    
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
   <div>
  <label htmlFor="name" className='block text-sm font-medium text-slate-300 mb-1'>Name</label>
  <input 
    type="text" 
    id="name"
    placeholder='Enter your shop name' 
    className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
               text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' 
    {...register("name", { required: "Name is required" })}
  />
  {errors.name && <p className='text-red-500 text-xs mt-1'> {String(errors.name.message)} </p>}
</div>

<div>
  <label htmlFor="bio" className='block text-sm font-medium text-slate-300 mb-1'>Bio</label>
  <textarea 
    id="bio"
    rows={4}
    placeholder='Tell us about your shop...' 
    className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
               text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' 
    {...register("bio", { required: "Bio is required" })}
  />
  {errors.bio && <p className='text-red-500 text-xs mt-1'> {String(errors.bio.message)} </p>}
</div>

<div>
  <label htmlFor="category" className='block text-sm font-medium text-slate-300 mb-1'>Category</label>
  <input 
    type="text" 
    id="category"
    placeholder='e.g., Electronics, Fashion, Home Goods' 
    className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
               text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' 
    {...register("category", { required: "Category is required" })}
  />
  {errors.category && <p className='text-red-500 text-xs mt-1'> {String(errors.category.message)} </p>}
</div>

<div>
  <label htmlFor="address" className='block text-sm font-medium text-slate-300 mb-1'>Address</label>
  <textarea 
    id="address"
    rows={3}
    placeholder='Enter your shop address' 
    className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
               text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' 
    {...register("address", { required: "Address is required" })}
  />
  {errors.address && <p className='text-red-500 text-xs mt-1'> {String(errors.address.message)} </p>}
</div>

<div>
  <label htmlFor="opening_hours" className='block text-sm font-medium text-slate-300 mb-1'>Opening Hours</label>
  <input 
    type="text" 
    id="opening_hours"
    placeholder='e.g., Mon-Fri, 9am - 5pm' 
    className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
               text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' 
    {...register("opening_hours", { required: "Opening hours are required" })}
  />
  {errors.opening_hours && <p className='text-red-500 text-xs mt-1'> {String(errors.opening_hours.message)} </p>}
</div>

<div>
  <label htmlFor="website" className='block text-sm font-medium text-slate-300 mb-1'>Website</label>
  <input 
    type="url" 
    id="website"
    placeholder='https://your-shop.com' 
    className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
               text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' 
    {...register("website", { 
     
      validate: (value) => {
        // If the field is empty, it's valid
        if (!value) {
          return true;
        }
        
        // If the field has a value, then test it
        const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return pattern.test(value) || "Please enter a valid URL";
      }
     
    })}
  />
  {errors.website && <p className='text-red-500 text-xs mt-1'> {String(errors.website.message)} </p>}
</div>




    <div className="flex justify-end gap-3 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2 rounded-lg text-slate-300 border border-slate-700
                   hover:bg-slate-800 transition-colors"
        disabled={isLoading}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold
                   hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Updating...' : 'Update Shop'}
      </button>
    </div>
  </form>
  );
};

export default ShopDetailsForm;