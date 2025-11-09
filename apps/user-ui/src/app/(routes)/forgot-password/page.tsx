"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import {useForm} from 'react-hook-form'
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
//@ts-ignore
import axios,{ AxiosError }  from 'axios';


type FormData = {
    email:string,
    password:string
}



const page = () => {
 
    const [step,setStep]= useState<"email"| "otp"| "reset">("email")
    const [userEmail,setUserEmail]= useState<string | null>(null);
    const [canResend,setCanResend]= useState(true);
    const [passwordVisible,setPasswordVisible]= useState(false);
    const [serverError,setServerError]= useState<string | null>(null);
    const [rememberMe,setRememberMe]= useState(false);
    const inputRef = useRef<(HTMLInputElement | null)[]>([]) 
    const [timer,setTimer] = useState(60);
    const [otp,setOtp] = useState(["","","",""]);
    const [showOtp,setShowOtp] = useState(false);
    const [userData,setUserData] = useState<FormData | null>(null);
    
    
    const router = useRouter();
     

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
    

     const {
        register,
        handleSubmit,
        formState:{errors},
     } = useForm<FormData>();

    
     const requestOtpMutation = useMutation({
        mutationFn:async({email}:{email:string})=>{
            const response = await axios.post(`${process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_SERVER_URI:process.env.NEXT_PUBLIC_SERVER_URI_LOCAL}/forgot-password-user`,{email});
           return response.data;
        },
        onSuccess:(_,{email})=>{
            setUserEmail(email);
            setStep('otp');
            setCanResend(false);
            startResetTimer();
        },
        onError:(error:AxiosError)=>{
            const errorMessage = (error?.response?.data as { message?:string})?.message || "Invalid OTP. Try again!"
           setServerError(errorMessage)
        }
     })
     


     const verifyOtpMutation = useMutation({
        mutationFn:async()=>{

            if(!userEmail)return;
            const response = await axios.post(`${process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_SERVER_URI:process.env.NEXT_PUBLIC_SERVER_URI_LOCAL}/verify-forgot-password-user`,{email:userEmail,otp:otp.join('')});
           return response.data;
        },
        onSuccess:()=>{
            
            setStep('reset');
            
            setServerError(null);
            
        },
        onError:(error:AxiosError)=>{
            const errorMessage = (error?.response?.data as { message?:string})?.message || "Invalid OTP. Try again!"
           setServerError(errorMessage)
        }
     })

     const resendOtp = ()=>{
           
        if(userEmail){
            verifyOtpMutation.mutate()
        }

    }

     const resetPasswordMutation = useMutation({
        mutationFn:async({password}:{password:string})=>{

            if(!password)return;
            // console.log(password,userEmail)
            const response = await axios.post(`${process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_SERVER_URI:process.env.NEXT_PUBLIC_SERVER_URI_LOCAL}/reset-password-user`,{email:userEmail,newPassword:password},{withCredentials:true});
           return response.data;
        },
        onSuccess:(_,{password})=>{
            
            setStep('email');
            toast.success("Password reset Successfully! Please login with your new password")
            router.push('/login');
            
            
            setServerError(null);
            
        },
        onError:(error:AxiosError)=>{
            const errorMessage = (error?.response?.data as { message?:string})?.message || "Invalid OTP. Try again!"
           setServerError(errorMessage)
        }
     })

    //  const verifyOtpMutation=useMutation({mutationFn:async()=>{
 
    //     console.log('verify mutation ',otp);
    //          const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/verify-user`,{...userData,otp:otp.join('')});
     
    //          return response.data
     
    //       },onSuccess:()=>{
    //          router.push('/')
    //       }});

     const onSubmitEmail = ({email}:{email:string})=>{
        // loginMutation.mutate(data);
        requestOtpMutation.mutate({email})
     }
     const onSubmitPassword = ({password}:{password:string})=>{
        // loginMutation.mutate(data);
        resetPasswordMutation.mutate({password})
     }
     const onSubmit = (data:FormData)=>{
        // loginMutation.mutate(data);
     }


 console.log(otp.join(','))
    return (
    <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]' >
        <h1 className='text-4xl font-Poppins font-semibold text-black text-center' >Forgot Password</h1>
        <p className="text-center text-lg font-medium py-3 text-[#00000099] ">
            Home . Forgot Password
        </p>
     
       <div className='w-full flex justify-center' >
        <div className='md:w-[480px] p-8 bg-white shadow rounded-lg' >
       {step==='email'&& (<>     <h3 className='text-3xl font-semibold text-center mb-2' >Login to Eshop</h3>
        <p className='text-center text-gray-500 mb-4' >
            Go back to ?
            <Link href={'/login'} className='text-blue-500' >
                Login
            </Link>
        </p>
        
        <form onSubmit={handleSubmit(onSubmitEmail)}>
            {/* Email field */}
 <label className='block  text-gray-700 '>Email</label>
 
            <input type="email" placeholder='abc@gmail.com' className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1' {...register("email",{
                required:"Email is required",
                pattern:{
                    value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message:"Invalid email address"
                }
            })}/>
            {errors.email && <p className='text-red-500' > {String(errors.email.message)} </p>}
        
    <button type='submit'  disabled={requestOtpMutation.isPending}  className='w-full text-lg mt-4 cursor-pointer bg-black text-white py-2 rounded-lg' >{ requestOtpMutation.isPending?"Submitting ...":'Submit'} </button>

        </form></>)}

        {step==='otp'&&<div>
    <h3 className='text-xl font-semibold text-center mb-4  ' >Enter OTP</h3>
    <div className='flex justify-center gap-6' >
        {otp &&otp?.map((digit,index)=>
        
        <input key={index} type='text' maxLength={1} className='w-12 h-12 text-center border border-gray-300 outline-none !rounded' value={digit} onChange={(e)=>handleOtpChange(index,e.target.value)} onKeyDown={(e:any)=>handleOtpKeyDown(index,e)} ref={(el)=>{
            if(el){
                inputRef.current[index]=el;
            }
        }} />)} 
    </div>
    <button className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg ' onClick={()=>verifyOtpMutation.mutate()} disabled={verifyOtpMutation.isPending}  >{verifyOtpMutation.isPending?"Verifying ...":"verify OTP"}</button>
    <p className='text-center text-sm mt-4' >
        {canResend?(<button onClick={resendOtp} className='text-blue-500 cursor-pointer' >ResendOtp</button>):(`Resend OTP in ${timer}`)}
    </p>
    {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError &&(<p className='text-red-500 text-sm mt-2' >{verifyOtpMutation.error.message}</p>)}
    </div>}

    {step ==='reset' && (<><h3 className='text-xl font-semibold text-center mb-4' >Reset Password</h3>
    
       <form onSubmit={handleSubmit(onSubmitPassword)}>
       <label className='block  text-gray-700 '>New Password</label>
       <input type={passwordVisible?"text":"password"} placeholder='Min 6 characters' className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1' {...register("password",{
     required:"Password is required",
     minLength:{
         value:6,
         message:"Password must be at least 6 charsacters"
     }
 })}/>
 {errors.password && <p className='text-red-500 text-sm' > {String(errors.password.message)} </p>}
 <button type='submit' className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg '  disabled={resetPasswordMutation.isPending}  >{resetPasswordMutation.isPending?"Submitting ...":"Submit"}</button>
       </form>
    </>)}
        </div>
        
        </div> 
       
    </div>
  )
}

export default page