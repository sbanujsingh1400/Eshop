import crypto from 'crypto';
import { ValidationError } from '../../../../packages/libs/errorMiddleware'; 
import { NextFunction, Request,Response } from 'express';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendmail/index';
import prisma from "../../../../packages/libs/prisma";

// @ts-ignore
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;



export const validationRegistrationData = (data:any,useType:"user" | "seller")=>{
   
    const {name,email,password,phone_number,country}= data;

    if(!name || !email || !password || (useType=== "seller" && (!phone_number || !country))){

    throw new ValidationError(`missing required fields`)
    }

    if(!emailRegex.test(email)){
        throw new ValidationError("Invalid email format!");
    }

}


export const checkOtpRestrictions = async(email:string,next:NextFunction)=>{

    if(await redis.get(`otp_lock:${email}`)){
        throw(new ValidationError("Account locked due to multiple failed attempts! Try again after 30 minuites") )
    }
    if(await redis.get(`otp_spam_lock:${email}`)){
        throw(new ValidationError("Too many OTP requests! Please wait 1 hour before requestiong again") )
    }
    if(await redis.get(`otp_cooldown:${email}`)){
        throw(new ValidationError("Please wait 1 minuite before requesting a new OTP!") );
    }




}

export const trackOtpRequests = async (email:string,next:NextFunction)=>{
   const otpRequestKey = `otp_request_count:${email}`;
   let otpRequests = parseInt((await redis.get(otpRequestKey))|| "0" );

   if(otpRequests>=2){
    await redis.set(`otp_span_lock:${email}`,"locked","EX",3600);
    throw(new ValidationError("Too many OTP requests. Please wait 1 hour before requesting again."))
   }

   await redis.set(otpRequestKey,otpRequests+1,"EX",3600);
}

export const sendOtp = async (email:string,name:string,template:string)=>{
    const otp = crypto.randomInt(1000,9999).toString();
    // console.log("___________Send OTP______________")
    // console.log(email,template,name,otp);
    // console.log("___________Send OTP______________")
       
    await sendEmail(email,"Verify Your Email",template,{name,otp}); 
    await redis.set(`otp:${email}`,otp,"EX",300);
    await redis.set(`otp_cooldown:${email}`,"true","EX",300);
   
    
}



export const verifyOtp = async (email:string,otp:string,next:NextFunction)=>{
      const storedOtp = await redis.get(`otp:${email}`);

      if(!storedOtp){
        return next(new ValidationError("Invalid or Expired OTP!"));
      }

       const failedAttemptsKey =`otp_attempts:${email}`;
       const failedAttempts= parseInt((await redis.get(failedAttemptsKey))|| "0");
        if(storedOtp!=otp){
            if(failedAttempts>=2){
        
                await redis.set(`otp_lock:${email}`,"locked","EX",1800);
                await redis.del(`otp:${email}`,failedAttemptsKey);
                 throw(new ValidationError("Too many failed attempts.Your account is locked for 30 minuites!"));
                 
            }else {
                await redis.set(failedAttemptsKey,failedAttempts+1,"EX",300);    
                   throw(new ValidationError(`Incorrect OTP. ${2-failedAttempts} attempts left`));
            }
            
        }
        await redis.del(`otp:${email}`,failedAttemptsKey);

}


export const handleForgotPassword = async (req:Request,res:Response, next:NextFunction,userType:"user"|"seller")=>{

    try {
        
           const {email}= req.body;
    
           if(!email) return  next(new   ValidationError("Email is required"));
             
           const user = userType==='user' ? await prisma.users.findUnique({where:{email}}): await prisma.sellers.findUnique({where:{email}});
    
           if(!user) return  next(new   ValidationError(` ${userType} not found!`));
           
           await checkOtpRestrictions(email,next);
           await trackOtpRequests(email,next);
    
           await sendOtp(email,user.name,userType==='user'?("forgot-password-user-mail"):"forgot-password-seller-mail" )
    
            
           return res.status(200).json({message:"OTP sent to email. please verify yout account."});
    
    
    
    } catch (error) {
        console.log("_____________________error in controller  in userFOrgetPassword _____________________");
        console.log(error);
        console.log("_____________________error in controller  in userFOrgetPassword _____________________");
        return next(error);
    }
    
    
    
    }


    export const verifyForgotPasswordOtp = async (req:Request,res:Response, next:NextFunction)=>{

        try {
            
            const {email,otp} = req.body;
             console.log('***************',otp,"***************");
            if(!email || !otp ){
                throw(new ValidationError("All Fields are required"));
            }
            await  verifyOtp(email,otp,next);
        
           return res.status(200).json({
            message:"OTP verified. You can now reset your password"
           })
        
        } catch (error) {
            console.log("_____________________error in controller  in verifyForgotPasswordOtp _____________________");
            console.log(error);
            console.log("_____________________error in controller  in verifyForgotPasswordOtp _____________________");
            return next(error);
        
        }
        
        
        }



        
    
    
