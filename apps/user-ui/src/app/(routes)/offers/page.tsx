'use client'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { useState } from 'react'
import { join } from 'path'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {Range} from 'react-range';
import ProductCard from '../../shared/components/Cards/product-card'

// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a better UI.

const MIN=0;
const MAX = 1199;

const colors = [
    { name: "Black", code: "#000000" },
    { name: "Red", code: "#ff0000" },
    { name: "Green", code: "#00ff00" },
    { name: "Blue", code: "#0000ff" },
    { name: "Yellow", code: "#ffff00" },
    { name: "Magenta", code: "#ff00ff" },
    { name: "Cyan", code: "#00ffff" },
  ];
const sizes= ["XS","S","M","L","XL","XXL"];
  

const page = () => {
   
    const [isProductLoading, setIsProductLoading] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1199]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);
    const router = useRouter();

    const updateURL= ()=>{
        const params = new URLSearchParams(window.location.search);
        params.set("priceRange",priceRange.join(','));

        if(selectedCategories.length>0){
            params.set('categories',selectedCategories.join(','));
        } else {
            params.delete('categories');
        }
         
        if(selectedColors.length>0){
            params.set('colors',selectedColors.join(','));
        } else {
            params.delete('colors');
        }

        if(selectedSizes.length>0){
            params.set('sizes',selectedSizes.join(','));
        } else {
            params.delete('sizes');
        }

        params.set('page',page.toString());
        router.replace(`/offers?${decodeURIComponent(params.toString())}`, { scroll: false });
    }

    const fetchFilteredProducts = async ()=>{
        setIsProductLoading(true);
        try {
            const query= new URLSearchParams();     
            query.set('priceRange',priceRange.join(','));
            if(selectedCategories.length>0){
                query.set('categories',selectedCategories.join(','));
            }
            if(selectedColors.length>0){
                query.set('colors',selectedColors.join(','));
            }
            if(selectedSizes.length>0){
                query.set('sizes',selectedSizes.join(','));
            }
            query.set('page',page.toString());
            query.set('limit','12');
            const res:any = await axiosInstance.get(`/product/get-filtered-offers?${query.toString()}`);
            setProducts(res.data.products);
            setTotalPages(res.data.pagination.totalPages)
        } catch (error) {
           console.log("Failed to fetch filtered products",error) 
        } finally {
            setIsProductLoading(false);
        }
    }
  
   useEffect(()=>{
    updateURL()
    fetchFilteredProducts();
   },[priceRange,selectedCategories,selectedColors,selectedSizes,page]);

   const {data,isLoading}:any= useQuery({
    queryKey:["categories"],
    queryFn:async ()=>{
        const res = await axiosInstance.get('/product/get-categories');
        return res.data;
    },
    staleTime:1000 * 60 * 30
   });

    const toggleCategory = (label:string)=>{
        setSelectedCategories((prev)=>prev.includes(label) ? prev.filter((cat)=>cat!==label):[...prev,label])
    }
    const toggleColor = (label:string)=>{
        setSelectedColors((prev)=>prev.includes(label) ? prev.filter((col)=>col!==label):[...prev,label])
    }
    const toggleSize = (label:string)=>{
        setSelectedSizes((prev)=>prev.includes(label) ? prev.filter((size)=>size!==label):[...prev,label])
    }

  return (
    <div className='w-full bg-slate-50 min-h-screen'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12' >
            <div className="pb-8 sm:pb-12 text-center sm:text-left">
                <h1 className='text-4xl sm:text-5xl font-bold text-slate-900 mb-2' >
                   All Offers
                </h1>
                <div className="flex items-center justify-center sm:justify-start text-sm">
                  <Link href={"/"} className='text-slate-500 hover:text-slate-700'>Home</Link>
                  <span className='inline-block w-1 h-1 mx-2 bg-slate-400 rounded-full'  ></span>
                  {/* Note: The original component had "All Products" hardcoded here. I am preserving that text. */}
                  <span className='text-slate-700 font-medium' >All Products</span>
                </div>
            </div>
            <div className="w-full flex flex-col lg:flex-row gap-8">
                {/* sidebar */}
                <aside className='w-full lg:w-72 lg:flex-shrink-0 h-max bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 space-y-6' >
                    <div>
                      <h3 className='text-lg font-semibold text-slate-800' >Price Filter</h3>
                      <div className="pt-6 pb-2 mx-2">
                        <Range step={1} min={MIN} max={MAX} values={tempPriceRange} onChange={(values)=>setTempPriceRange(values)} renderTrack={({props,children})=>{
                          const [min,max]=tempPriceRange;
                          const percentageLeft = ((min-MIN)/(MAX-MIN))*100;
                          const percentageRight = ((max-MIN)/(MAX-MIN))*100;
                          return <div {...props} className='h-1.5 bg-slate-200 rounded-full relative' style={{...props.style}} >
                                      <div className="absolute h-full bg-blue-500 rounded-full" style={{left:`${percentageLeft}%`,width:`${percentageRight-percentageLeft}%`}}></div>
                                      {children}
                          </div>
                        }} renderThumb={({props})=>{
                          const {key,...rest}=props;
                          return <div key={key} {...rest} className='w-4 h-4 bg-blue-500 rounded-full shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' ></div>
                        }} />  
                      </div>
                      <div className="flex justify-between items-center mt-4">
                          <div className="text-sm font-medium text-slate-600">
                              ${tempPriceRange[0]} - ${tempPriceRange[1]}
                          </div>
                          <button onClick={()=>{
                              setPriceRange(tempPriceRange);
                              setPage(1);
                          }} className='text-sm px-4 py-1.5 bg-blue-500 text-white font-semibold hover:bg-blue-600 transition rounded-md' >Apply</button>
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className='text-lg font-semibold text-slate-800 border-t border-slate-200 pt-6' >Categories</h3>
                      <ul className="space-y-3 pt-4">
                          {isLoading ? (<p className="text-sm text-slate-500">Loading...</p>) : (
                              data?.categories?.map((category: any) => (
                              <li key={category} className="flex items-center">
                                  <label className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-800 cursor-pointer">
                                  <input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                                  {category}
                                  </label>
                              </li>
                              ))
                          )}
                      </ul>
                    </div>
                    {/* Colors */}
                    <div>
                      <h3 className='text-lg font-semibold text-slate-800 border-t border-slate-200 pt-6' >Filter By Colors</h3>
                      <ul className="space-y-3 pt-4">
                          {colors?.map((color: any) => (
                          <li key={color.name} className="flex items-center">
                              <label className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-800 cursor-pointer">
                              <input type="checkbox" checked={selectedColors.includes(color.name)} onChange={() => toggleColor(color.name)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                              <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: color.code }}></span>
                              {color.name}
                              </label>
                          </li>
                          ))}
                      </ul>
                    </div>
                    {/* Sizes */}
                    <div>
                      {/* Note: The original component had a typo "ColSizesors". I am preserving that text. */}
                      <h3 className='text-lg font-semibold text-slate-800 border-t border-slate-200 pt-6' >Filter By ColSizesors</h3>
                      <ul className="space-y-3 pt-4">
                        {sizes.map((size) => (
                          <li key={size} className="flex items-center">
                            <label className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-800 cursor-pointer">
                              <input type="checkbox" checked={selectedSizes.includes(size)} onChange={() => toggleSize(size)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                              <span className="font-medium">{size}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                </aside>

                {/* product grid */}
                 <div className="flex-1">
                   {isProductLoading? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6" >
                      {Array.from({length:12}).map((_,index)=>{return <div key={index} className='h-80 bg-white shadow-md animate-pulse rounded-xl'></div>})}
                    </div>
                   ):( products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <p className="w-full text-center py-20 text-slate-500 bg-white rounded-lg shadow-md">No offers found matching your criteria!</p>
                  ))}
                  {totalPages>1 && (<div className='flex justify-center items-center mt-12 gap-2' >
                    {Array.from({length:totalPages}).map((_,i)=>(<button key={i+1} onClick={()=>setPage(i+1)} className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${page === i + 1 ? "bg-blue-600 text-white shadow" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}`}  >{i+1}</button>))}
                  </div>)}
                 </div>
            </div>
        </div>
    </div>
  )
}

export default page