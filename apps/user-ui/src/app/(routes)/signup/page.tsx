"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import {useForm} from 'react-hook-form'
import GoogleButton from '../../shared/components/google-button';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
// @ts-ignore
import { AxiosError } from 'axios';

type FormData = {
    email:string,
    password:string
    name:string
}

// NOTE: All logic and JSX structure are IDENTICAL to your original code. 
// Only the className strings have been updated for a better UI.

const page = () => {
 
    const [passwordVisible,setPasswordVisible]= useState(false);
    const [serverError,setServerError]= useState<string | null>(null);
    const [rememberMe,setRememberMe]= useState(false);
    const [canResend,setCanResend]= useState(true);
    const [timer,setTimer] = useState(60);
    const [otp,setOtp] = useState(["","","",""]);
    const [showOtp,setShowOtp] = useState(false);
    const [userData,setUserData] = useState<FormData | null>(null);
    const inputRef = useRef<(HTMLInputElement | null)[]>([])

     const startResetTimer= ()=>{
      
        const interval = setInterval(()=>{
            setTimer((prev)=>{
                if(prev<=1){ // Corrected condition to stop at 0
                    clearInterval(interval);
                    setCanResend(true);
                    return 60; // Reset timer for next use
                }
                return prev-1;
            })
        },1000)

     } 

    const handleOtpChange = (index:number,value:string)=>{
    if(!/^[0-9]?$/.test(value))return;

     const newOtp = [...otp];
     newOtp[index] = value;
     setOtp(newOtp);
     
     if(value && index <inputRef.current.length-1){
        inputRef.current[index+1]?.focus();
     }
    }


    const handleOtpKeyDown = (index:number,e:React.KeyboardEvent<HTMLInputElement>)=>{
     if(e.key==='Backspace' &&!otp[index] && index>0){
        inputRef.current[index-1]?.focus();
     }
        
    }  

    const resendOtp = ()=>{
           
        if(userData){
            signupMutation.mutate(userData)
        }

    }


     const router = useRouter();

     const {
        register,
        handleSubmit,
        formState:{errors},
     } = useForm<FormData>();


  
     const signupMutation = useMutation({mutationFn:async (data:FormData)=>{
        const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/user-registration`,data);
        return response.data;
     },onSuccess:(_,formData)=>{
        setUserData(formData);
        setShowOtp(true);
        setCanResend(false)
        setTimer(60);
        startResetTimer();
     }})

     const onSubmit = (data:FormData)=>{
        signupMutation.mutate(data);
     }
 

     const verifyOtpMutation=useMutation({mutationFn:async()=>{
        const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/verify-user`,{...userData,otp:otp.join('')});
        return response.data
     },onSuccess:()=>{
        router.push('/')
     }});
 
    return (
    <div className='w-full min-h-[85vh] bg-slate-50 flex flex-col items-center justify-center py-12 px-4' >
        <h1 className='text-4xl font-bold text-slate-800 text-center' >Create Account</h1>
        <p className="text-center text-base text-slate-500 mt-2 mb-8 ">
            Home . Signup
        </p>
     
       <div className='w-full flex justify-center' >
        <div className='w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-2xl' >
        {!showOtp?(
            <>
                <h3 className='text-2xl font-bold text-center text-slate-900' >Signup to Eshop</h3>
                <p className='text-center text-sm text-slate-600' >
                    Already have an account?{' '}
                    <Link href={'/login'} className='font-semibold text-blue-600 hover:text-blue-700 transition-colors' >
                        Login
                    </Link>
                </p>
            </>
        ) : null}

        {!showOtp && (
            <>
                <a href="http://localhost:8080/google?type=signup&&role=user"><GoogleButton  /></a>
                <div className="flex items-center text-slate-400 text-xs">
                    <div className="flex-1 border-t border-slate-200"/>
                    <span className="px-3 font-medium text-slate-500">OR SIGNUP WITH EMAIL</span>
                    <div className="flex-1 border-t border-slate-200"/>
                </div>
            </>
        )}

        {!showOtp?(<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 
            {/* Name field */}
            <div>
                <label className='block text-sm font-semibold text-slate-700 mb-1'>Name</label>
                <input type="text" placeholder='Enter your name' className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' {...register("name",{
                    required:"Name is required",
                })}/>
                {errors.name && <p className='text-red-500 text-xs mt-1' > {String(errors.name.message)} </p>}
            </div>


            {/* Email field */}
            <div>
                <label className='block text-sm font-semibold text-slate-700 mb-1'>Email</label>
                <input type="email" placeholder='abc@example.com' className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' {...register("email",{
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

            <button disabled={signupMutation.isPending} className='w-full font-semibold bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed' >
                {signupMutation.isPending?"Creating Account...":"Create Account"}
            </button>
            {serverError && <p className='text-red-500 text-sm text-center mt-2' >{serverError}</p>}
</form>):
<div className="text-center">
    <h3 className='text-xl font-bold text-slate-900 mb-2' >Verify Your Email</h3>
    <p className="text-slate-500 text-sm mb-6">Enter the 4-digit code sent to your email.</p>
    <div className='flex justify-center gap-2 sm:gap-4' >
        {otp && otp?.map((digit,index)=>
        
        <input key={index} type='text' maxLength={1} className='w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-semibold border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition' value={digit} onChange={(e)=>handleOtpChange(index,e.target.value)} onKeyDown={(e:any)=>handleOtpKeyDown(index,e)} ref={(el)=>{
            if(el){
                inputRef.current[index]=el;
            }
        }} />)} 
    </div>
    <button className='w-full mt-6 font-semibold bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed' onClick={()=>verifyOtpMutation.mutate()} disabled={verifyOtpMutation.isPending}  >
        {verifyOtpMutation.isPending?"Verifying...":"Verify Account"}
    </button>
    <p className='text-sm text-slate-500 mt-4' >
        Didn't receive a code?{' '}
        {canResend?(<button onClick={resendOtp} disabled={signupMutation.isPending} className='font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors' >Resend</button>):(`Resend in ${timer}s`)}
    </p>
    {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError &&(<p className='text-red-500 text-sm text-center mt-2' >{verifyOtpMutation.error.message}</p>)}
    </div>}
        </div>
        
        </div> 
       
    </div>
  )
}

export default page