"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import {useForm} from 'react-hook-form'

import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
// @ts-ignore
import { AxiosError } from 'axios';
import { countries } from '../../utils/countries';
import CreateShop from '../../shared/modules/auth/CreateShop';
import StripeLogo from '../../assets/svgs/stripe-logo';

type FormData = {
    email:string,
    password:string
    name:string,
    phone_number:number
    country:string
    
}


const page = () => {
 
    const [passwordVisible,setPasswordVisible]= useState(false);
    const [serverError,setServerError]= useState<string | null>(null);
    const [rememberMe,setRememberMe]= useState(false);
    const [canResend,setCanResend]= useState(true);
    const [timer,setTimer] = useState(60);
    const [otp,setOtp] = useState(["","","",""]);
    const [showOtp,setShowOtp] = useState(false);
    const [sellerData,setSellerData] = useState<FormData | null>(null);
    const [activeStep,setActiveStep]= useState(1)
    const [sellerId,setSellerId]= useState("")
    const inputRef = useRef<(HTMLInputElement | null)[]>([])

     const startResetTimer= ()=>{
      
        const interval = setInterval(()=>{
            setTimer((prev)=>{
                if(prev>=1){
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
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
           
        if(sellerData){
            signupMutation.mutate(sellerData)
        }

    }


     const router = useRouter();

     const {
        register,
        handleSubmit,
        formState:{errors},
     } = useForm<FormData>();


  
     const signupMutation = useMutation({mutationFn:async (data:FormData)=>{
    //  console.log(`${process.env.NEXT_PUBLIC_SERVER_URI}/user-registration`,data);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/seller-registration`,data);
         
        console.log(response);
        return response.data;
     },onSuccess:(_,formData)=>{
        setSellerData(formData);
        setShowOtp(true);
        setCanResend(false)
        setTimer(60);
        startResetTimer();
     }})

    
 

     const verifyOtpMutation=useMutation({mutationFn:async()=>{
 
   console.log('verify mutation ',otp);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/verify-seller`,{...sellerData,otp:otp.join('')});

        return response.data

     },onSuccess:(data:any)=>{
        setSellerId(data?.seller?.id)
        setActiveStep(2);
     }});
 
     const connectStripe = async()=>{
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/create-stripe-link`,{sellerId});
        // @ts-ignore
            if(response?.data?.url){
                // @ts-ignore
                window.location.href=response?.data?.url
            }

        } catch (error) {
            console.log('error in stripe connection: '+error)
        }
     }
     const onSubmit = (data:FormData)=>{
        console.log(data)
         signupMutation.mutate(data);
 
      }

    return (
    <div className="w-full flex flex-col items-center justify-center pt-12 pb-20 min-h-screen bg-slate-950 p-4">
        <div className="relative flex items-start justify-between w-full max-w-2xl mb-16">
            
         <div className="absolute top-5 left-0 w-full h-1 bg-slate-700 -z-10"/>
         <div className="absolute top-5 left-0 h-1 bg-blue-500 transition-all duration-500" style={{width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%'}}/>
         {[1,2,3].map((step)=>(<div key={step} className="flex flex-col items-center relative z-10">
            <div className={`w-10 h-10 flex justify-center items-center rounded-full font-bold transition-colors duration-500 ${
                step < activeStep ? 'bg-blue-500 border-2 border-blue-500 text-white' :
                step === activeStep ? 'bg-blue-500 border-2 border-blue-500 text-white scale-110' : 
                'bg-slate-800 border-2 border-slate-600 text-slate-400'}`} >
                {step}
            </div>
            <span className="absolute top-12 w-32 text-center text-xs mt-2 font-semibold text-slate-400">
                {step===1?"Create Account":step===2?"Setup Shop":"Connect Bank"}
            </span>
         </div>))}
       
        </div>
          {/* Steps content */}
          <div className='w-full max-w-md p-8 bg-white shadow-xl rounded-2xl' >
            {activeStep===1 &&(<>
                {!showOtp?(<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className='text-2xl font-bold text-center text-slate-900 mb-4' >Create Account </h3>
 {/* Name field */}
 <div>
    <label className='block text-sm font-semibold text-slate-700 mb-1'>Name</label>
    <input type="text" placeholder='Enter your name' className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500' {...register("name",{ required:"Name is required" })}/>
    {errors.name && <p className='text-red-500 text-xs mt-1' > {String(errors.name.message)} </p>}
 </div>

 {/* Email field */}
 <div>
    <label className='block text-sm font-semibold text-slate-700 mb-1'>Email</label>
    <input type="email" placeholder='abc@example.com' className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500' {...register("email",{ required:"Email is required", pattern:{ value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message:"Invalid email address" } })}/>
    {errors.email && <p className='text-red-500 text-xs mt-1' > {String(errors.email.message)} </p>}
 </div>


{/* Phone number field */}
<div>
    <label className='block text-sm font-semibold text-slate-700 mb-1'>Phone Number </label>
    <input type="tel" placeholder='9999999999' className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500' {...register("phone_number",{ required:"phone number  is required", pattern:{ value:/^\+?[1-9]\d{1,14}$/, message:"Invalid phone format" }, minLength:{ value:10, message:'Phone number must be atleast 10 digits' }, maxLength:{ value:15, message:'Phone number cannot exeed 15 digits' } })}/>
    {errors.phone_number && <p className='text-red-500 text-xs mt-1' > {String(errors.phone_number.message)} </p>}
</div>
  
  {/* Country */}
  <div>
    <label className='block text-sm font-semibold text-slate-700 mb-1'>Country</label>
    <select  className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500' {...register("country",{ required:"country is required" })}><option value={''} >Select your  country</option> 
      {countries.map((country:{code:string,name:string})=>(<option key={country.code}  value={country?.code} >{country.name} </option>))}
    </select>
  </div>

{/* Password */}
<div>
    <label className='block text-sm font-semibold text-slate-700 mb-1'>Password</label>
    <div className="relative">
    <input type={passwordVisible?"text":"password"} placeholder='Min 6 characters' className='w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500' {...register("password",{ required:"Password is required", minLength:{ value:6, message:"Password must be at least 6 charsacters" } })}/>

    <button type='button' onClick={()=>setPasswordVisible(!passwordVisible)} className='absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600' >
        {passwordVisible?<Eye size={20}/>:<EyeOff size={20}/>}
    </button>
    </div>
    {errors.password && <p className='text-red-500 text-xs mt-1' > {String(errors.password.message)} </p>}
</div>

<button disabled={signupMutation.isPending} className='w-full !mt-6 font-semibold bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50' >{signupMutation.isPending?"Signing up...":"Signup"} </button>
{serverError && <p className='text-red-500 text-sm text-center mt-2' >{serverError}</p>}
<p className='pt-3 text-center text-sm text-slate-600' >
        Already have an account?{" "}
        <Link href={'/login'} className='font-semibold text-blue-600 hover:text-blue-700' >Login</Link>
    </p>
</form>):
<div className="text-center">
    <h3 className='text-xl font-bold text-slate-900 mb-2' >Enter OTP</h3>
    <p className="text-slate-500 text-sm mb-6">Enter the 4-digit code sent to your email.</p>
    <div className='flex justify-center gap-2 sm:gap-4' >
        {otp &&otp?.map((digit,index)=>
        
        <input key={index} type='text' maxLength={1} className='w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-semibold border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition' value={digit} onChange={(e)=>handleOtpChange(index,e.target.value)} onKeyDown={(e:any)=>handleOtpKeyDown(index,e)} ref={(el)=>{
            if(el){
                inputRef.current[index]=el;
            }
        }} />)} 
    </div>
    <button className='w-full mt-6 font-semibold bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50' onClick={()=>verifyOtpMutation.mutate()} disabled={verifyOtpMutation.isPending}  >{verifyOtpMutation.isPending?"Verifying ...":"verify OTP"}</button>
    <p className='text-center text-sm text-slate-500 mt-4' >
        {canResend?(<button onClick={resendOtp} className='font-semibold text-blue-600 hover:text-blue-700' >ResendOtp</button>):(`Resend OTP in ${timer}`)}
    </p>
    {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError &&(<p className='text-red-500 text-sm text-center mt-2' >{verifyOtpMutation.error.message}</p>)}

    
    </div>}
            </>)}
            {activeStep==2 &&(<CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />)}
            {activeStep==3 &&(<div className='text-center' >
                <h3 className='text-2xl font-bold text-slate-900' >Withdraw Method</h3>
                <br />
                <button className='w-full max-w-xs mx-auto flex items-center justify-center gap-3 text-lg font-semibold bg-[#635BFF] text-white py-3 rounded-lg hover:bg-[#534BFF] transition-colors' onClick={connectStripe} >Connect Stripe <StripeLogo/></button>
            </div>)} 

         </div>
       
    </div>
  )
}

export default page;