'use client'

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useState } from "react"

const SIDEBAR_HIDDEN_PATHS = [
    /^\/shop(\/.*)?$/,/^\/login$/,/^\/signup$/,/^\/$/]

const useHandleSideBar = ()=>{

    // const [showSideBar,setShowSideBar]= useState(false);
    const pathname = usePathname();
    const showSideBar = useMemo(()=>{
        return !SIDEBAR_HIDDEN_PATHS.some(pattern=>pattern.test(pathname));
    },[pathname])
    
  





    return showSideBar;


}

export default useHandleSideBar;