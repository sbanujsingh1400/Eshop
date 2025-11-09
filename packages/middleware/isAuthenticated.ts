import prisma from "../../packages/libs/prisma/index";
import { Response,NextFunction } from "express";
import jwt from 'jsonwebtoken'
 const isAuthenticated =  async (req:any,res:Response,next:NextFunction)=>{
 
    console.log("____________________________________",req.url,req.subdomains,req.hostname,"________________________________________________")
    try {

        
        const token = req.cookies["access_token"] || req.cookies["seller-access_token"] || req.headers.authorization?.split(" ")[1];
        console.log(req.cookies["access_token"]) 
        if(!token){
            console.log(token) 
            return res.status(401).json({message:"Unauthorized! token is missing"});}
        const decoded =await jwt.verify(token,process.env.JWT_SECRET!)as {id:string,role:"user"|"seller" | "admin"};
        
        if(!decoded){
            // console.log(decoded)
            return res.status(401).json({message:"Unauthorized! Invalid token."});
        }
        let account ;
        req.role=decoded?.role;
       if(decoded.role=='user'){
        account =await prisma.users.findUnique({where:{id:decoded.id},include:{avatar:true}});
        //  console.log("USERRR____________",account,"USERRR____________")     
        // @ts-ignore
        if(account) req.user= account;
       } else if(decoded.role=='admin'){
        account =await prisma.users.findUnique({where:{id:decoded.id},include:{avatar:true}});
        //  console.log("USERRR____________",account,"USERRR____________")     
        // @ts-ignore
        if(account) req.admin= account;
       }else {
        account =await prisma.sellers.findUnique({where:{id:decoded.id},include:{shop:{ include:{products:{include:{images:true}},reviews:{include:{user:{include:{avatar:true}}}}}},avatar:true,}});
        // console.log(account)    
        // @ts-ignore
        if(account){ req.seller= account;}
        // console.log(req.seller)
       }
        
       
  
        
        
        return next();


    } catch (error) {
        console.log(error)
        return res.status(401).json({message:"Unauthorized! Invalid token."});
    }


}


export default isAuthenticated