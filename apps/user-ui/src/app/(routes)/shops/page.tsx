'use client'
import React, { useEffect } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ShopCard from '../../shared/components/Cards/ShopCard'
import { categories } from '@/configs/categories'
import { countries } from '@/configs/countries'

// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a better UI.

const page = () => {
   
    const [isShopLoading, setIsShopLoading] = useState(false);
    
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [shops, setShops] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    const updateURL= ()=>{
        const params = new URLSearchParams(window.location.search);
        
        if(selectedCategories.length>0){
            params.set('categories',selectedCategories.join(','));
        } else {
            params.delete('categories');
        }
         
        if(selectedCountries.length>0){
            params.set('countries',selectedCountries.join(','));
        } else {
            params.delete('countries');
        }

        params.set('page',page.toString());
        router.replace(`/shops?${decodeURIComponent(params.toString())}`, { scroll: false });
    }

    const fetchFilteredShops = async ()=>{
        setIsShopLoading(true);
        try {
            const query= new URLSearchParams();     
            if(selectedCategories.length>0){
                query.set('categories',selectedCategories.join(','));
            }
            if(selectedCountries.length>0){
                query.set('countries',selectedCountries.join(','));
            }
            query.set('page',page.toString());
            query.set('limit','12');
            const res:any = await axiosInstance.get(`/product/get-filtered-shops?${query.toString()}`);
            setShops(res.data.shops);
            setTotalPages(res.data.pagination.totalPages)
        } catch (error) {
           console.log("Failed to fetch filtered shops",error) 
        } finally {
            setIsShopLoading(false);
        }
    }
  
   useEffect(()=>{
    updateURL()
    fetchFilteredShops();
   },[selectedCategories, selectedCountries, page]);


    const toggleCategory = (label:string)=>{
        setSelectedCategories((prev)=>prev.includes(label) ? prev.filter((cat)=>cat!==label):[...prev,label])
    }

    const toggleCountry = (label:string)=>{
        setSelectedCountries((prev)=>prev.includes(label) ? prev.filter((cou)=>cou!==label):[...prev,label])
    }

  return (
    <div className='w-full bg-slate-50 min-h-screen'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12' >
            <div className="pb-8 sm:pb-12 text-center sm:text-left">
                <h1 className='text-4xl sm:text-5xl font-bold text-slate-900 mb-2' >
                   All Shops
                </h1>
                <div className="flex items-center justify-center sm:justify-start text-sm">
                  <Link href={"/"} className='text-slate-500 hover:text-slate-700'>Home</Link>
                  <span className='inline-block w-1 h-1 mx-2 bg-slate-400 rounded-full'  ></span>
                  <span className='text-slate-700 font-medium' >All Shops</span>
                </div>
            </div>
            <div className="w-full flex flex-col lg:flex-row gap-8">
                {/* sidebar */}
                <aside className='w-full lg:w-72 lg:flex-shrink-0 h-max bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 space-y-6' >
                    {/* Categories */}
                    <div>
                      <h3 className='text-lg font-semibold text-slate-800' >Categories</h3>
                      <ul className="space-y-3 pt-4">
                          {categories?.map((category: any,index:number) => (
                          <li key={category.label} className="flex items-center">
                              <label className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-800 cursor-pointer">
                              <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(category.value)}
                                  onChange={() => toggleCategory(category.value)}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              {category.value }
                              </label>
                          </li>
                          ))}
                      </ul>
                    </div>
                   {/* Countries */}
                   <div>
                     <h3 className='text-lg font-semibold text-slate-800 border-t border-slate-200 pt-6' >Countries</h3>
                     <ul className="space-y-3 pt-4 max-h-60 overflow-y-auto">
                        {countries?.map((country: any) => (
                          <li key={country} className="flex items-center">
                            <label className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedCountries.includes(country)}
                                onChange={() => toggleCountry(country)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              {country}
                            </label>
                          </li>
                        ))}
                      </ul>
                   </div>
                </aside>

                {/* Shop grid */}
                 <div className="flex-1">
                   {isShopLoading? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-6" >
                      {Array.from({length:9}).map((_,index)=>{return <div key={index} className='h-72 bg-white shadow-md animate-pulse rounded-xl'></div>})}
                    </div>
                   ):( shops.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-6">
                      {shops.map((shop) => (
                        <ShopCard key={shop.id} shop={shop} />
                      ))}
                    </div>
                  ) : (
                    <p className="w-full text-center py-20 text-slate-500 bg-white rounded-lg shadow-md">No shops found matching your criteria!</p>
                  ))}
                  {totalPages>1 && (<div className='flex justify-center items-center mt-12 gap-2' >
                    {Array.from({length:totalPages}).map((_,i)=>(<button key={i+1} onClick={()=>setPage(i+1)} className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${page===i+1?"bg-blue-600 text-white shadow":"bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}`}  >{i+1}</button>))}
                  </div>)}
                 </div>

            </div>
        </div>
    </div>
  )
}

export default page