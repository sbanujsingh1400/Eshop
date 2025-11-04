'use client';

import axiosInstance from '@/app/utils/axiosInstance';
import { countries } from '@/app/utils/countries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ProfileDetailsFormProps {
  initialData: {
    id: string;
    name: string;
    email: string;
    // Add other user profile fields here
  };
  onClose: () => void;
  onUpdateSuccess: () => void;
}
type FormData = {
  name:string,
  phone_number:string
  country:string
  
}

const ProfileDetailsForm: React.FC<ProfileDetailsFormProps> = ({
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
    phone_number:initialData.phone_number ,
    country:initialData.country
  }
 });

 const updateProfileMutation = useMutation({mutationFn:async (data:FormData)=>{
  
      const response = await axiosInstance.put(`/seller-profile-update`,data);
       setIsLoading(true);
      console.log(response);
      return response.data;
   },onSuccess:(_,formData)=>{
     setIsLoading(false)
     onClose();
     queryClient.invalidateQueries({ queryKey:["seller"] });
     
   },
  onError:()=>{
    setIsLoading(false)
  }
  })
  

  const onSubmit= async(data:any)=>{
    updateProfileMutation.mutate(data);
    
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
    <label className='block text-sm font-medium text-slate-300 mb-1'>Name</label>
    <input type="text" placeholder='Enter your name' className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                     text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' {...register("name",{ required:"Name is required" })}/>
    {errors.name && <p className='text-red-500 text-xs mt-1' > {String(errors.name.message)} </p>}
 </div>
 <div>
    <label className='block text-sm font-medium text-slate-300 mb-1'>Phone Number </label>
    <input type="tel" placeholder='9999999999' className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                     text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500'{...register("phone_number",{ required:"phone number  is required", pattern:{ value:/^\+?[1-9]\d{1,14}$/, message:"Invalid phone format" }, minLength:{ value:10, message:'Phone number must be atleast 10 digits' }, maxLength:{ value:15, message:'Phone number cannot exeed 15 digits' } })}/>
    {errors.phone_number && <p className='text-red-500 text-xs mt-1' > {String(errors.phone_number.message)} </p>}
</div>
  
  {/* Country */}
  <div>
    <label className='block text-sm font-medium text-slate-300 mb-1'>Country</label>
    <select  className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                     text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' {...register("country",{ required:"country is required" })}><option value={''} selected >Select your  country</option> 
      {countries.map((country:{code:string,name:string})=>(<option key={country.code}  value={country?.code} >{country.name} </option>))}
    </select>
    {errors.country && <p className='text-red-500 text-xs mt-1' > {String(errors.country.message)} </p>}
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
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileDetailsForm;