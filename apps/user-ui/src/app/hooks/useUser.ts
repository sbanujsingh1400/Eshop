
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "../utils/protected";
import { useEffect } from "react";

const fetchUser = async () => {
    try {
        const response: any = await axiosInstance.get("/logged-in-user");
        return response.data.user;
    } catch (error) {
        // If the request fails (e.g., 401), it will throw an error,
        // and React Query will handle it. Return null.
        return null;
    }
}


const useUser = ()=>{
   const {setLoggedIn}= useAuthStore()

    const {data:user,isLoading:isPending,isError,refetch}= useQuery({
        queryKey:["user"],
        queryFn:()=>fetchUser(),
        staleTime:1000 * 60 * 5 ,
        retry:1,
    });

    useEffect(() => {
        if (!isPending) {
            setLoggedIn(!!user);  
        }
    }, [user, isPending, setLoggedIn]);
    return {user:user as any,isLoading:isPending}

}


export default useUser;