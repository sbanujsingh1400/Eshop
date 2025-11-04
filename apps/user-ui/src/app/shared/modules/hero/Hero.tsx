'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CircleArrowLeft, CircleArrowRight, MoveRight } from 'lucide-react';
import axiosInstance from '@/app/utils/axiosInstance';

const Hero = () => {
  const router = useRouter();
  const [currentCarouselImage, setCurrentCarouselImage] = useState<number>(0);
  const [imageArray, setImageArray] = useState<string[]>([]);
  const [productsDetails, setProductsDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await axiosInstance.get('/product/get-hero-details');
      const images = res.data.products.map((p: any) => p.images[0].url);
      setImageArray(images);
      setProductsDetails(res.data.products);
    };
    fetchImages();
  }, []);

  const currentProduct = productsDetails[currentCarouselImage];

  return (
    <section className="relative w-full min-h-[90vh] bg-gradient-to-br from-[#16657a] to-[#115061] flex items-center overflow-hidden">
      {/* Subtle glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="relative w-[90%] lg:w-[80%] mx-auto flex flex-col md:flex-row items-center justify-between gap-10 py-12">
        
        {/* -------- LEFT CONTENT -------- */}
        <div className="md:w-1/2 flex flex-col gap-5 text-center md:text-left z-10">
          <p className="text-white/80 text-lg tracking-wide">
            Starting at{' '}
            <span className="font-semibold text-yellow-300">
              ${currentProduct?.sale_price ?? '--'}
            </span>
          </p>

          <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-md">
            {currentProduct?.short_description ?? 'Discover Timeless Elegance'}
          </h1>

          <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed">
            Get up to{' '}
            <span className="font-bold text-yellow-300">
              {(
                ((currentProduct?.regular_price - currentProduct?.sale_price) /
                  currentProduct?.regular_price) *
                100
              ).toFixed(0)}% OFF
            </span>{' '}
            — limited time only!
          </p>

          <div className="flex justify-center md:justify-start mt-4">
            <button
              onClick={() => router.push('/products')}
              className="group flex items-center gap-2 bg-white text-[#115061] font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:bg-yellow-300 hover:text-[#115061] hover:scale-105"
            >
              Shop Now
              <MoveRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* -------- RIGHT IMAGE / CAROUSEL -------- */}
        <div className="md:w-1/2 relative max-w-lg aspect-square rounded-[2rem] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.25)] border border-white/10 bg-white/5 backdrop-blur-sm">
          {/* Arrows */}
          <button
            className="absolute flex justify-center items-center w-10 h-10 bg-white/20 hover:bg-white/40 text-white top-1/2 left-0 -translate-y-1/2 rounded-full z-20 transition-all duration-300"
            onClick={() =>
              setCurrentCarouselImage((prev) => (prev - 1 + imageArray.length) % imageArray.length)
            }
          >
            <ChevronLeft size={22}/>
          </button>

          <button
            className="absolute flex justify-center items-center w-10 h-10 bg-white/20 hover:bg-white/40 text-white top-1/2 right-0 -translate-y-1/2 rounded-full z-20 transition-all duration-300"
            onClick={() =>
              setCurrentCarouselImage((prev) => (prev + 1) % imageArray.length)
            }
          >
            <ChevronRight size={22} />
          </button>

          {/* Pagination dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {imageArray.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentCarouselImage(i)}
                className={`cursor-pointer h-3 w-3 rounded-full transition-all duration-300 ${
                  currentCarouselImage === i
                    ? 'w-6 bg-yellow-300'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              ></div>
            ))}
          </div>

          {/* Product Images */}
          {imageArray?.length ? (
            imageArray.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt="Featured product"
                fill
  
                priority={i === 0}
                className={`absolute inset-0 object-contain p-10 transition-all duration-700 ease-in-out ${
                  currentCarouselImage === i
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }`}
              />
            ))
          ) : (
            <p className="flex items-center justify-center h-full text-slate-200 text-center">
              No Images Available
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
