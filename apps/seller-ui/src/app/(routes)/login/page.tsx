"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import {useForm} from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
//@ts-ignore
import axios,{ AxiosError }  from 'axios';
import toast from 'react-hot-toast';

type FormData = {
    email:string,
    password:string
}

// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a better UI.

const page = () => {
 
    const [passwordVisible,setPasswordVisible]= useState(false);
    const [serverError,setServerError]= useState<string | null>(null);
    const [rememberMe,setRememberMe]= useState(false);
    const queryClient=useQueryClient(); 
     const router = useRouter();

     const {
        register,
        handleSubmit,
        formState:{errors},
     } = useForm<FormData>();

     const loginMutation = useMutation<any, AxiosError, FormData>({
        mutationFn:async(formData:FormData)=>{
         
            const response = await axios.post(`${process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_SERVER_URI:process.env.NEXT_PUBLIC_SERVER_URI_LOCAL}/login-seller`,formData,{withCredentials:true});

            return response.data
    
        },
        onSuccess:(data)=>{
            setServerError(null);
            router.push('/dashboard');
            toast.success('Seller sucessfully logged in');
            queryClient.invalidateQueries({ queryKey:["seller"] });
            
        },
        onError:(error:any)=>{
            const errorMessage = (error?.response?.data as {message?:string})?.message || "Invalid Credentials";
            setServerError(errorMessage)
            console.log(error);
            toast.error(error.response.data.message)
        }
    })

     const onSubmit = (data:FormData)=>{
        loginMutation.mutate(data);
     }


//  console.log('inside login')
    return (
    <div className='w-full min-h-screen  flex flex-col items-center justify-center p-4' >
        <h1 className='text-4xl font-bold text-white text-center' >Seller Login</h1>
        <p className="text-center text-base text-slate-500 mt-2 mb-8">
            Home . Login
        </p>
     
       <div className='w-full flex justify-center' >
        <div className='w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-2xl' >
        <h3 className='text-2xl font-bold text-center text-slate-900' >Login to Your Seller Account</h3>
        <p className='text-center text-sm text-slate-600' >
            Don't have an account?{' '}
            <Link href={'/signup'} className='font-semibold text-blue-600 hover:text-blue-700 transition-colors' >
                Sign up
            </Link>
        </p>
        
        <div className="flex items-center text-slate-400 text-xs ">
           <div className="flex-1 border-t border-slate-200"/>
           <span className="px-3 font-medium text-slate-500">SIGN IN WITH EMAIL</span>
           <div className="flex-1 border-t border-slate-200"/>

        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email field */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-1'>Email</label>
              <input type="email" placeholder='abc@gmail.com' className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' {...register("email",{
                  required:"Email is required",
                  pattern:{
                      value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message:"Invalid email address"
                  }
              })}/>
              {errors.email && <p className='text-red-500 text-xs mt-1' > {String(errors.email.message)} </p>}
            </div>
         {/* Password */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-1'>Password</label>
              <div className="relative">
                <input type={passwordVisible?"text":"password"} placeholder='Min 6 characters' className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' {...register("password",{
                    required:"Password is required",
                    minLength:{
                        value:6,
                        message:"Password must be at least 6 characters"
                    }
                })}/>

                <button type='button' onClick={()=>setPasswordVisible(!passwordVisible)} className='absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors' >
                    {passwordVisible?<Eye size={20} />:<EyeOff size={20} />}
                </button>
              </div>
              {errors.password && <p className='text-red-500 text-xs mt-1' > {String(errors.password.message)} </p>}
            </div>
            <div className="flex justify-between items-center">
              <label  className="flex items-center text-sm text-slate-600">
                  <input type="checkbox" className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2' checked={rememberMe} onChange={()=>setRememberMe(!rememberMe)} />
                  Remember me
              </label>
              <Link href={'/forgot-password'} className='text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors' >Forgot password?</Link>
            </div>
            <button type='submit' disabled={loginMutation.isPending}  className='w-full font-semibold bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed' >
              {loginMutation.isPending?"Logging in ...":"Login"}
            </button>
            {serverError && <p className='text-red-500 text-sm text-center pt-2' >{serverError}</p>}
        </form>
        </div>
        
        </div> 
       
    </div>
  )
}

export default page