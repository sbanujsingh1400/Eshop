'use client'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../utils/axiosInstance'
import { Metadata } from 'next';
import ProductDetails from '../../../shared/modules/product/product-details';
import { useParams } from 'next/navigation';


 async function fetchProductDetails(slug:string) {
    const response:any = await axiosInstance.get('/product/get-product/'+slug);
    return response.data.product;

 }

//  export async function generateMetadata({params}:{params:{slug:string}}):Promise<Metadata>{
//     const product =await fetchProductDetails(params.slug);
//     // console.log(product)
//     return {
//         title:`${product.title} | Eshop Marketplace`,
//         openGraph:{
//             title:`${product.title} | Eshop Marketplace`,
//             description:product.short_description || "",
//             images:[product?.images?.[0]?.url || "/default-image.jpg"],
//             type:'website',
//         },
//         twitter: {
//             card: "summary_large_image",
//             title: product?.title,
//             description: product?.short_description || "",
//             images: [product?.images?.[0]?.url || "/default-image.jpg"],
//           }
        
//         }
//  }

const page = () => {

  const params = useParams();
  const slug = params.slug as string;
  const [details,setDetails] = useState(null)
   useEffect(()=>{
    const fetchData = async()=>{
    const data=  await fetchProductDetails(slug)
    setDetails(data)
    
    }
    fetchData();
   },[]) 
   

if(!details) return <div>Product details is loading ....</div>    

  return (
    <ProductDetails productDetails={details} />
  )
}

export default page;