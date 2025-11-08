import axiosInstance from '@/app/utils/axiosInstance';
import { countries } from '@/app/configs/countries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, X } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a more impressive UI.

const ProfileDetails = ({profilePic,updateImageHandler,user}:any) => {
    const [showModal,setShowModal]= useState(false);
    const queryClient = useQueryClient();

    const {register,handleSubmit,reset,formState:{errors}}= useForm<any>(
        {
            defaultValues:{
                label:"Home",
                name:user.name,
                dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : "", // Format for date input
                phone: user.phone ||"",
                country:user.country ||"India",
                            
            }
        }
    )

    const {mutate:updateProfile}= useMutation({
        mutationFn:async (payload)=>{
            const res:any = await axiosInstance.post('/update-user',payload);
            return res.data.user;
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['user']});
            reset();
            setShowModal(false);
        }
    })

    const onSubmit = async (data:any)=>{
         updateProfile(data);
    }

  return (
    <div className='space-y-8 text-base text-slate-800' >
        <h2 className='text-3xl font-bold text-slate-800 flex w-full justify-between items-center' >
            Profile Details
            <button  onClick={()=>setShowModal(true)}  className='flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-transform transform hover:scale-105' >
                <Pencil className='w-4 h-4' /> Edit Profile
            </button>
        </h2>
        
        <div className="p-6 bg-slate-50/70 rounded-xl border border-slate-200">
            <div className='flex items-center gap-6' >
                <Image src={ profilePic } alt="User Avatar" width={80} height={80} className='w-20 h-20 rounded-full object-cover ring-4 ring-offset-2 ring-blue-400' />
                <label htmlFor="photo-upload" className='flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-full px-4 py-2 cursor-pointer transition-colors' >
                    <Pencil className="w-4 h-4" />
                    Change Photo
                </label>
                <input id="photo-upload" type="file" accept='image/*' className="hidden" onChange={updateImageHandler} />
            </div>
        </div>

        <div className="divide-y divide-slate-200/80">
            <p className="flex items-center justify-between py-4"><span className='font-semibold text-slate-500 w-32' >Name:</span><span className="font-semibold">{user.name}</span></p>
            <p className="flex items-center justify-between py-4"><span className='font-semibold text-slate-500 w-32' >Email:</span><span className="font-semibold">{user.email}</span></p>
            <p className="flex items-center justify-between py-4"><span className='font-semibold text-slate-500 w-32' >Date of Birth:</span><span className="font-semibold">{ user.dob ? new Date(user.dob).toLocaleDateString() : "Not Set"}</span></p>
            <p className="flex items-center justify-between py-4"><span className='font-semibold text-slate-500 w-32' >Phone:</span><span className="font-semibold">{user.phone || "Not Set" }</span></p>
            <p className="flex items-center justify-between py-4"><span className='font-semibold text-slate-500 w-32' >Country:</span><span className="font-semibold">{user.country || "Not Set" }</span></p>
            <p className="flex items-center justify-between py-4"><span className='font-semibold text-slate-500 w-32' >Joined:</span><span className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span></p>
            <p className="flex items-center justify-between py-4"><span className='font-semibold text-slate-500 w-32' >Earned Points:</span><span className="font-semibold">{user.points || 0}</span></p>
        </div>

        {/* Modal */}
        {showModal && (<div className='fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4' >
            <div className='bg-white w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-xl relative' >
                <button className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors' onClick={()=>setShowModal(false)} > <X className='w-5 h-5 ' /> </button>
                <h3 className='text-xl font-bold mb-6 text-slate-900' >
                    Edit Profile Details
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' >
                   
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                        <input type="text" placeholder='Name' {...register("name",{required:"Name is required"})} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' />
                        {errors?.name && (<p className='text-red-500 text-xs mt-1' >{String(errors.name.message)}</p>)}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth</label>
                        <input type="date" placeholder='Date of Birth' {...register("dob",{required:"Date of Birth is required"})} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' />
                        {errors?.dob && (<p className='text-red-500 text-xs mt-1' >{String(errors?.dob?.message)}</p>)}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                        <input type="text" placeholder='Phone Number' {...register("phone",{required:"Phone Number is required"})} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' />
                        {errors?.phone && (<p className='text-red-500 text-xs mt-1' >{String(errors?.phone?.message)}</p>)}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Country</label>
                        <select {...register("country")} className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white' >
                           {countries.map(country=> <option key={country} value={country}>{country}</option>)}
                        </select>
                    </div>
                 
                    <button type='submit' className='w-full !mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-indigo-500/40 transition-shadow duration-300' >Update Profile</button>
                </form>
            </div>
        </div>)}
                       
    </div>
  )
}

export default ProfileDetails;