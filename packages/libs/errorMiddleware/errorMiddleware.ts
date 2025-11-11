import {Request,Response} from 'express'
import AppError from './index'

 const errorMiddleware= (err:Error,req:Request,res:Response)=>{

if(err instanceof AppError){
console.log(`Error ${req.method} ${req.url} -  ${err.message} `);
console.log('inside app error '+err.message)
return res.status(err.statusCode).json({status:'error',message:err.message,...(err.details &&{details:err.details})})

}
console.log('outside app error '+err.message)
console.log("unhandled error:",err);

return res.status(500).json({
    error:"Something went wrong, please try again!"
});

}


export default errorMiddleware;