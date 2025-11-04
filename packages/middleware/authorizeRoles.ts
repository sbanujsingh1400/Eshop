import { AuthError } from "../../packages/libs/errorMiddleware";

import { Response,NextFunction } from "express";

export const isSeller = async (req:any,res:Response,next:NextFunction)=>{
       
    //    console.log("______IS SELLERE",req.seller);
    if(req.role!=='seller'){
        return next(new AuthError("Access denied: seller only"))
    }else{
        next();
    }
}

export const isAdmin = async (req:any,res:Response,next:NextFunction)=>{
       
    console.log("______IS admin",req.admin);
 if(req.role!=='admin'){
     return next(new AuthError("Access denied: seller only"))
 }else{
     next();
 }
}


export const isUser = async (req:any,res:Response,next:NextFunction)=>{

    if(req.role!=='user'){
        return next(new AuthError("Access denied: user only"))
    }else{
        next();
    }
}

