'use client'
import React from 'react'
import Hero from './shared/modules/hero/Hero'
import SectionTitle from './shared/components/section/section-title'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from './utils/axiosInstance'
import ProductCard from './shared/components/Cards/product-card'
import ShopCard from './shared/components/Cards/ShopCard'

// NOTE: The component's structure and logic are 100% identical to your original code.
// The only changes are to the className strings to improve the visual presentation.

const page = () => {

      const {data: products,isLoading,isError }:{data:any,isLoading:any,isError:any} = useQuery({
        queryKey:["products"],
        queryFn: async ()=>{
          
          const res:any = await axiosInstance.get('/product/get-all-products?page=1&limit=10');
          return res.data.products;
        },
        staleTime:1000 * 60 *2
      })

      const {data: latestProducts } = useQuery({
        queryKey:["latest-products"],
        queryFn: async ()=>{
          
          const res:any = await axiosInstance.get('/product/get-all-products?page=1&limit=10&type=latest');
          return res.data.products;
        },
        staleTime:1000 * 60 *2
      })

      const {data: shops,isLoading:shopLoading, isError:shopError } = useQuery({
        queryKey:["shops"],
        queryFn: async ()=>{
          
          const res:any = await axiosInstance.get('/product/top-shops');
          return res.data.shops;
        },
        staleTime:1000 * 60 *2
      })

      const {data: offers,isLoading:offersLoading, isError:offersError } = useQuery({
        queryKey:["offers"],
        queryFn: async ()=>{
          
          const res:any = await axiosInstance.get('/product/get-all-events?page=1&limit=10');
          return res.data.events;
        },
        staleTime:1000 * 60 *2
      })
  
   

  return (
    <div className='bg-slate-50' >
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col gap-y-16">
        
        {/* --- Suggested Products Section --- */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
          <SectionTitle title='Suggested Products' />
          
          {isLoading && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 mt-6' >
              {Array.from({length:10}).map((_,index) => (
                <div key={index} className='space-y-3 rounded-xl bg-white p-2 shadow-md animate-pulse'>
                  <div className="h-40 w-full rounded-lg bg-slate-200"></div>
                  <div className="p-2 space-y-2">
                    <div className="h-4 rounded bg-slate-200 w-3/4"></div>
                    <div className="h-4 rounded bg-slate-200 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        
          {!isLoading && !isError && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 mt-6' >
              {products?.map((product:any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {products?.length === 0 && !isLoading && (
            <p className='text-center py-12 text-slate-500 font-medium bg-slate-50 rounded-lg mt-6'>
              No Products available yet!
            </p>
          )}

        </div>

        {/* --- Latest Products Section --- */}
        <div className='bg-white p-6 sm:p-8 rounded-2xl shadow-sm' >
          <SectionTitle title='Latest Products' />
          {/* Note: Duplicated loading state from original code is preserved. Ideally this would be tied to `latestLoading`. */}
          {isLoading && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 mt-6'>
              {Array.from({length:10}).map((_,index) => (
                 <div key={index} className='space-y-3 rounded-xl bg-white p-2 shadow-md animate-pulse'>
                  <div className="h-40 w-full rounded-lg bg-slate-200"></div>
                  <div className="p-2 space-y-2">
                    <div className="h-4 rounded bg-slate-200 w-3/4"></div>
                    <div className="h-4 rounded bg-slate-200 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && !isError && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 mt-6' >
              {latestProducts?.map((product:any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {latestProducts?.length === 0 && !isLoading && (
            <p className='text-center py-12 text-slate-500 font-medium bg-slate-50 rounded-lg mt-6'>
              No new products at the moment!
            </p>
          )}
        </div>

        {/* --- Top Shops Section --- */}
        <div className='bg-white p-6 sm:p-8 rounded-2xl shadow-sm' >
          <SectionTitle title='Top Shops' />
          {/* This section has its own shopLoading state */}
          {shopLoading && (
             <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 mt-6' >
              {Array.from({length:5}).map((_,index) => (
                <div key={index} className='space-y-3 rounded-xl bg-white p-2 shadow-md animate-pulse'>
                  <div className="h-32 w-full rounded-lg bg-slate-200"></div>
                  <div className="p-2 space-y-2">
                    <div className="h-4 rounded bg-slate-200 w-3/4"></div>
                    <div className="h-4 rounded bg-slate-200 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!shopLoading && !shopError && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 mt-6' >
              {shops?.map((shop:any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
          {(shops?.length === 0 || shopError) && !shopLoading && (
            <p className='text-center py-12 text-slate-500 font-medium bg-slate-50 rounded-lg mt-6'>
              No shops are available right now.
            </p>
          )}
        </div>

        {/* --- Offers Section --- */}
        <div className='bg-white p-6 sm:p-8 rounded-2xl shadow-sm' >
          <SectionTitle title='Top Offers' />
          {offersLoading && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 mt-6' >
               {Array.from({length:5}).map((_,index) => (
                <div key={index} className='space-y-3 rounded-xl bg-white p-2 shadow-md animate-pulse'>
                  <div className="h-40 w-full rounded-lg bg-slate-200"></div>
                  <div className="p-2 space-y-2">
                    <div className="h-4 rounded bg-slate-200 w-3/4"></div>
                    <div className="h-4 rounded bg-slate-200 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!offersLoading && !offersError && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 mt-6' >
              {offers?.map((product:any) => (
                <ProductCard key={product.id} product={product} isEvent={true} />
              ))}
            </div>
          )}
          {(offers?.length === 0) && !offersLoading && (
            <p className='text-center py-12 text-slate-500 font-medium bg-slate-50 rounded-lg mt-6'>
              There are no offers at this time.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default page;