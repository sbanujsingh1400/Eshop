import { Response } from "express";


export const setCookie = (res:Response,name:string,value:string)=>{
res.cookie(name,value,{
    httpOnly:true,
    secure:false,
    sameSite:'lax',
    maxAge:7*24*60*60*1000, //7 days
})
}

export const deleteCookie = (res: Response, name: string) => {
    res.clearCookie(name, {
      httpOnly: true,
      secure: false, // Must match the setCookie config
      sameSite: 'lax', // Must match the setCookie config
    });
  };