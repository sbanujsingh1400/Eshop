import { ArrowUpRight, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    avatar: string;
    coverBanner?: string;
    address?: string;
    followers?: [];
    rating?: number;
    category?: string;
  };
}

// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a better UI.

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className='w-full h-full rounded-xl cursor-pointer bg-white border border-slate-200/80 shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl group'>
      <div className='h-32 w-full relative group-hover:opacity-90 transition-opacity'>
        <Image
          src={
            shop?.coverBanner ||
            'https://ik.imagekit.io/sbanujsingh/products/product-1759764430247_euLdMDxH7?updatedAt=1759764432032'
          }
          alt='Cover'
          layout='fill'
          className='object-cover transition-transform duration-500 group-hover:scale-110'
        />
      </div>
      {/* Avatar */}
      <div className='relative flex justify-center -mt-10'>
        <div className='w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-110 bg-white'>
          <Image
            src={
              shop?.avatar ||
              'https://ik.imagekit.io/sbanujsingh/products/product-1759764430247_euLdMDxH7?updatedAt=1759764432032'
            }
            alt={shop.name}
            width={80}
            height={80}
            className='object-cover'
          />
        </div>
      </div>

      {/* Info */}
      <div className='px-4 pb-5 pt-2 text-center'>
        {/* Shop Name */}
        <h3 className='text-lg font-bold text-slate-800'>{shop?.name}</h3>

        {/* Followers Count */}
        <p className='text-sm text-slate-500 mt-1'>
          {shop?.followers?.length ?? 0} Followers
        </p>

        {/* Address + Rating */}
        <div className='flex items-center justify-center flex-wrap text-xs text-slate-500 mt-3 gap-x-4 gap-y-1'>
          {/* Address */}
          {shop.address && (
            <span className='flex items-center gap-1 max-w-[120px]'>
              <MapPin className='w-4 h-4 shrink-0 text-slate-400' />
              <span className='truncate'>{shop.address}</span>
            </span>
          )}

          <span className='flex items-center gap-1'>
            <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
            {shop.rating ?? 'N/A'}
          </span>
        </div>
        {/* Category */}
        {shop?.category && (
          <div className='mt-4 flex flex-wrap justify-center gap-2 text-xs'>
            <span className='bg-blue-100 capitalize text-blue-700 px-2.5 py-1 rounded-full font-semibold'>
              {shop.category}
            </span>
          </div>
        )}
        {/* Visit Shop */}
        <div className='mt-5'>
          <Link
            href={`/shop/${shop.id}`}
            className='inline-flex items-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full px-5 py-2 transition-colors'
          >
            Visit Shop <ArrowUpRight className='w-4 h-4 ml-1' />{' '}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;