'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, X } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce'
import axiosInstance from '@/app/utils/axiosInstance';

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Debounce the search query to prevent API calls on every keystroke
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['product-searchbar',debouncedQuery],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/product/search-products-bar?q=${debouncedQuery}`);
      // console.log(data.products);
      return data.products as any[];
    },
    // Only run the query if the debounced query is at least 2 characters long
    enabled: debouncedQuery?.length > 1,
  });

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setQuery('');

      }

    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
// console.log(isFocused)
  return (
    <div className="relative w-full max-w-lg" ref={searchContainerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for products, brands and more"
          className="w-full px-5 py-3 text-base rounded-full bg-slate-100 border-transparent outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
        />
        <div className="absolute top-0 right-0 h-full flex items-center pr-4">
          {isLoading ? (
            <Loader2 className="animate-spin text-slate-400" />
          ) : query ? (
            <X className="text-slate-500 cursor-pointer" onClick={() => setQuery('')} />
          ) : (
            <Search className="text-slate-400" />
          )}
        </div>
      </div>

      {/* --- Suggestions Dropdown --- */}
      {isFocused && debouncedQuery.length > 1 && (
  <div
    className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-200 
               z-50 overflow-hidden animate-fadeIn"
  >
    {data && data.length > 0 ? (
      <ul className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto custom-scrollbar">
        {data.map((product) => (
          <li key={product.id} onClick={()=>{ setQuery(''); setIsFocused(false)}} >
            <Link href={`/product/${product?.slug}`} className="block">
              <button
                onClick={() => setIsFocused(false)}
                className="group flex w-full items-center gap-4 p-3 transition-all duration-200 
                           hover:bg-slate-50 active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                  <img
                    src={product.images?.[0]?.url || '/placeholder.png'}
                    alt={product.title}
                    className="object-cover w-full h-full transition-transform duration-200 
                               group-hover:scale-105"
                  />
                </div>

                <div className="flex-grow text-left">
                  <p className="font-medium text-slate-800 text-sm truncate">
                    {product.title}
                  </p>
                  <p className="font-semibold text-blue-600 text-sm mt-0.5">
                    ${product?.sale_price?.toFixed(2)}
                  </p>
                </div>
              </button>
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      !isLoading && (
        <p className="p-4 text-center text-sm text-slate-500 animate-fadeIn">
          No products found.
        </p>
      )
    )}
  </div>
)}

    </div>
  );
};

export default ProductSearch;