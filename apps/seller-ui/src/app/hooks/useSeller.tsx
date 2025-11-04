
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";


const fetchSeller = async ()=>{

    const response:any = await axiosInstance.get("/logged-in-seller");
    //  console.log(response.data);
    // console.log(process.env.NEXT_PUBLIC_SERVER_URI)
   return response.data.seller

}

const useSeller = ()=>{

    const {data:seller,isLoading,isError,refetch}= useQuery({
        queryKey:["seller"],
        queryFn:fetchSeller,
        staleTime:1000 * 60 * 5 ,
        retry:1,
    });

    console.log(process.env.NEXT_PUBLIC_SERVER_URI)
    return {seller,isLoading}

}


export default useSeller;