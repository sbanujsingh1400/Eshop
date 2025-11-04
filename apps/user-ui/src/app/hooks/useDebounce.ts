'use client'

import { useEffect, useState } from "react"

export function useDebounce (query:string,delay:number){
     
    const [debouncedQuery,setDebouncedQuery]= useState(query);

    useEffect(()=>{
        
        const timeout = setTimeout(()=>{

              setDebouncedQuery(query);
        },delay)
       
        
        return ()=>{
            clearTimeout(timeout);
        }
    },[query,delay])


return debouncedQuery;

}