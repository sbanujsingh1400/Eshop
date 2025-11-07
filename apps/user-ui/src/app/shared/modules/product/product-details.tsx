"use client";

import { ChevronLeft, ChevronRight, Heart, MapPin, MessageSquareText, Package, ShoppingBag, ShoppingCartIcon, WalletMinimal } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import {useRouter} from 'next/navigation'
// @ts-ignore
import 'react-medium-image-zoom/dist/styles.css';
import Ratings from '../../components/ratings';
import Link from 'next/link';
import { useStore } from '../../../store';
import useUser from '../../../hooks/useUser';
import useLocationTracking from '../../../hooks/useLocationTracking';
import useDeviceTracking from '../../../hooks/useDeviceTracking';
import ProductCard from '../../components/Cards/product-card';
import axiosInstance from '../../../utils/axiosInstance';
import { ProductReviews } from '../../components/ProductReviews';
import { isProtected } from '@/app/utils/protected';

export type Review = {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string; // Will be a string from JSON
    userId:string
    users: {
      id: string;
      name: string | null;
      image: string | null; // Assuming user might have an image
    };
  };

const ProductDetails = ({productDetails}:any) => {
    const [currentImage,setCurrentImage]= useState(productDetails?.images[0]?.url);
    const[currentIndex,setCurrentIndex]=useState(0);
    const cart = useStore((state:any)=>state.cart)
    const[isSelected,setIsSelected]=useState(productDetails?.colors?.[0] || "");
    const[isSizeSelected,setIsSizeSelected]=useState(productDetails?.sizes?.[0] || "");
    const [quantity,setQuantity]= useState(cart.find((item:any)=>item?.id==productDetails?.id)?.quantity|| 1);
    const[priceRange,setPriceRange]=useState([productDetails?.sale_price,1199]);
    const[recommendedProducts,setRecommendedProducts]=useState([]);
    const router = useRouter();


    const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewCount, setReviewCount] = useState(0); // For the link at the top

    const {user}= useUser()
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();


    const addTocart = useStore((state:any)=>state.addToCart);
    const addToWishlist = useStore((state:any)=>state.addToWishlist);
    const removeFromWishlist = useStore((state:any)=>state.removeFromWishlist);
    const wishlist = useStore((state:any)=>state.wishlist);
    const isWishlisted= wishlist.some((item:any)=>{ 
      return item.id==productDetails.id});
    
    // console.log(cart);
    const isInCart= cart.some((item:any)=>{
      console.log(item)
    return   item.id===productDetails.id
    })
    const addtoCartDisable=(isInCart && quantity== cart.find((item:any)=>item?.id==productDetails?.id)?.quantity )
    const prevImage= ()=>{
        if(currentIndex>0){
            setCurrentIndex(currentIndex-1);
            setCurrentImage(productDetails?.images[currentIndex-1].url);
        }
    }

    const nextImage= ()=>{
        if(currentIndex<productDetails?.images.length-1){
            setCurrentIndex(currentIndex+1);
            setCurrentImage(productDetails?.images[currentIndex+1].url);
        }
    }

    const discountPercentage = Math.round(
        ((productDetails.regular_price-productDetails.sale_price)/productDetails.regular_price)*100
    )

    const fetchFilteredProducts = async ()=>{
        try {
            const query = new URLSearchParams();
            // console.log(query)
            query.set("priceRange",priceRange.join(','));
            query.set("page","1");
            query.set("limit","5");
            const res:any = await axiosInstance.get(`product/get-filtered-products?${query.toString()}`);
            setRecommendedProducts(res.data.products);
        } catch (error) {
            
        }
    }

    const fetchReviews = async () => {
        if (!productDetails?.id) return;
        setIsLoadingReviews(true);
        try {
          // --- REPLACE WITH YOUR REAL API CALL ---
          const res:any = await axiosInstance.get(`/product/reviews/${productDetails.id}`);
        //   console.log(res.data.reviews)
          setReviews(res.data.reviews);
          setReviewCount(res.data.total);
    
          // --- MOCK DATA FOR DEMONSTRATION (Remove this) ---
        
        //   const mockReviews: Review[] = [
            

        //   ];
        //   setReviews(mockReviews);
        //   setReviewCount(mockReviews.length);
          // --- End of Mock Data ---
        } catch (error) {
          console.error('Failed to fetch reviews', error);
        } finally {
          setIsLoadingReviews(false);
        }
      };
    
      const handleReviewSubmit = async (data: {
        rating: number;
        comment: string;
      }) => {
        if (!user) {
          alert('Please log in to submit a review.');
          return;
        }
        setIsSubmittingReview(true);
        try {
          // --- REPLACE WITH YOUR REAL "UPSERT" API CALL ---
          // This logic should create a new review or update an existing one
          // based on the (userId, productId) unique constraint.
          // console.log('Submitting review:', data,productDetails.id);
          if(!isSubmittingReview){
            const res:any = await axiosInstance.post(`/product/reviews/${productDetails.id}`, {
                ...data,
                productId: productDetails.id,
              });
              // console.log(res)
          }
        
          
          
          
          // After success, refetch the reviews
          await fetchReviews();
        } catch (error) {
          console.error('Failed to submit review', error);
        } finally {
          setIsSubmittingReview(false);
        }
      };
    
      const handleReviewDelete = async (reviewId: string) => {
        setIsSubmittingReview(true);
        try {
          // --- REPLACE WITH YOUR REAL DELETE API CALL ---
          // console.log('Deleting review:', reviewId);
          // await axiosInstance.delete(`/reviews/${reviewId}`);
          
          // --- Mock deletion (Remove this) ---
          await new Promise((res) => setTimeout(res, 1000));
          
          // After success, refetch the reviews
          await fetchReviews();
        } catch (error) {
          console.error('Failed to delete review', error);
        } finally {
          setIsSubmittingReview(false);
        }
      };


    useEffect(()=>{ 
        // fetchFilteredProducts()
        fetchReviews();
    },[priceRange])
    const handleChat = async (e:any)=>{
        e.preventDefault();
    
      try {
         
        const res:any = await axiosInstance.post('chatting/create-user-conversationGroup',{sellerId:productDetails?.Shop?.sellerId},isProtected);
        router.push(`/inbox?conversationId=${res.data.conversation.id}`) ;
      
      } catch (error) {
        console.log(error)
      } 
         
      
       }

  return (
    <div className='w-full bg-slate-50 py-8 lg:py-12' >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] gap-8 lg:gap-12" >
            {/* left column - product images */}
            <div className="w-full">
                <div className="relative w-full rounded-lg overflow-hidden border border-slate-200">
                    <Zoom>
                      <img
                        src={currentImage}
                        alt="Product Image"
                        width="500"
                        className="aspect-square object-contain"
                      />
                    </Zoom>
                </div>
                {/* Thumbnail images array */}
                <div className="relative mt-4">
                    {productDetails?.images?.length > 4 && (<button className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white z-10 disabled:opacity-50 transition' onClick={prevImage} disabled={currentIndex===0} >
                        <ChevronLeft size={24} />
                    </button>)}
                  <div className="flex gap-3 overflow-x-auto p-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    {productDetails?.images?.map((img:any,index:number)=>(<Image key={index} src={img?.url} alt='Thimbnail' width={80} height={80} className={`cursor-pointer rounded-lg object-cover aspect-square transition-all duration-300 snap-start ${currentImage===img.url ? 'ring-2 ring-blue-500 ring-offset-4' : 'border border-transparent'}`} onClick={()=>{
                        setCurrentIndex(index);
                        setCurrentImage(img?.url)
                    }} />))}
                  </div>
                  {productDetails?.images?.length > 4 && (<button className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white z-10 disabled:opacity-50 transition' onClick={nextImage} disabled={currentIndex >= productDetails?.images.length - 1} >
                        <ChevronRight size={24} />
                    </button>)}
                </div>
            </div>
            {/* Middle column - product details */}
            <div className="w-full lg:border-r lg:pr-12 border-slate-200/80">
                <h1 className='text-2xl lg:text-3xl font-bold text-slate-900 mb-2' >
                    {productDetails?.title}
                </h1>
                <div className="w-full flex items-center justify-between ">
                    <div className='flex items-center gap-2 text-yellow-400' >
                        <Ratings rating={productDetails?.rating} />
                        <Link href={'#reviews'} className="text-sm text-blue-600 hover:underline">
                ({reviewCount} reviews)
              </Link>
                    </div>
                    <div>
                    <Heart size={25} fill={isWishlisted?'#ef4444':'transparent'} stroke={isWishlisted?'#ef4444':'#64748b'} className='cursor-pointer text-slate-500 hover:text-red-500 transition-colors' onClick={()=> {   isWishlisted?removeFromWishlist(productDetails.id,user,location,deviceInfo):addToWishlist({...productDetails,quantity:quantity},user,location,deviceInfo)}}/>
                </div>
                </div>
                <div className='py-3 border-b border-slate-200/80 text-sm' >
                    <span className='text-slate-500' >
                        Brand: {" "}
                        <span className='font-semibold text-blue-600 hover:underline' >{productDetails?.brand || "No Brand"}</span>
                    </span>

                </div>

                <div className='mt-5' >
                    <div className="flex items-baseline gap-3">
                        <span className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-900' >${productDetails?.sale_price}</span>
                        <span className="text-xl text-slate-400 line-through">
                          ${productDetails?.regular_price}
                        </span>
                        <span className="text-lg font-semibold text-green-600">({discountPercentage}% off)</span>
                    </div>
<div className="mt-6">
    <div className="flex flex-col md:flex-row items-start gap-6 mt-4 ">
        {/* Color Options */}
        {productDetails?.colors?.length>0 && (<div>
            <strong className="block text-sm font-semibold text-slate-900 mb-2">Color:</strong>
            <div className='flex flex-wrap gap-2'>
                {productDetails?.colors?.map((color:string,index:number)=>{  return (<button key={index} className={`w-8 h-8 cursor-pointer rounded-full border-2 transition-all duration-300 ${isSelected===color ?'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-md':'border-slate-200'}`} onClick={()=>setIsSelected(color)} style={{backgroundColor:color}} />)})}
            </div>
        </div>)}
        {productDetails?.sizes && productDetails.sizes.length > 0 && (
        <div>
          <strong className="block text-sm font-semibold text-slate-900 mb-2">Size:</strong>
          <div className="flex flex-wrap gap-2">
            {productDetails.sizes.map((size: string, index: number) => (
              <button
                key={index}
                onClick={() => setIsSizeSelected(size)}
                className={`px-4 py-1.5 cursor-pointer rounded-full transition-colors duration-200 font-medium text-sm border ${
                  isSizeSelected === size
                    ? "bg-slate-900 text-white shadow-md border-slate-900"
                    : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
</div>

<div className="mt-8">
    <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-slate-300">
            <button className='px-4 py-2 cursor-pointer text-slate-800 font-bold hover:bg-slate-100 rounded-l-lg transition-colors' onClick={()=>setQuantity((prev:any)=>Math.max(1,prev-1))} >-</button>
            <span className='px-5 py-2 bg-white font-semibold text-slate-900' >{quantity}</span>
            <button className='px-4 py-2 cursor-pointer text-slate-800 font-bold hover:bg-slate-100 rounded-r-lg transition-colors' onClick={()=>setQuantity((prev:any)=>(prev+1))} >+</button>
        </div>
        {productDetails.stock>0 ?(<span className='text-sm text-green-600 font-semibold'>In Stock <span className='text-slate-500 font-medium' >({productDetails?.stock} items left)</span> </span>):(<span className='text-red-500 font-semibold'>Out of Stock</span>)}
    </div>
    <button disabled={addtoCartDisable} className={`w-full flex mt-6 items-center justify-center gap-2 px-5 py-3 text-white font-semibold rounded-lg transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 ${addtoCartDisable?"cursor-not-allowed bg-slate-400 hover:bg-slate-400 shadow-none":"bg-blue-600 hover:bg-blue-700 cursor-pointer"}`} onClick={()=> (!isInCart ||!addtoCartDisable) &&addTocart({...productDetails,quantity:quantity,selectedOptions:{ color:isSelected,size:isSizeSelected}},user,location,deviceInfo,)}   >
        <ShoppingBag size={20} />
        {addtoCartDisable?"Already added":"Add to Cart"}
    </button>
</div>
                </div>
            </div>
            {/* right column - seller information */}
            <div className="bg-slate-50/80 rounded-lg p-4 h-max lg:sticky lg:top-24 border border-slate-200/80">
        <div className='p-3 border-b border-slate-200' >
            <span className="text-sm font-semibold text-slate-700">Delivery Option</span>
            <div className='flex items-center text-slate-600 gap-2 mt-2' >
            <MapPin size={20} />
                     <span className='font-semibold text-slate-800'>{location?.city+", "+location?.country}</span>
            </div>
        </div>
        <div className='px-3 py-4 border-b border-slate-200 space-y-3' >
            <div className='flex items-center text-slate-600 gap-3' >
                <Package size={20} />
                <div>
                  <span className='text-base font-semibold text-slate-800' >7-Day Returns</span>
                  <p className="text-xs text-slate-500">Change of mind is not applicable.</p>
                </div>
            </div>
            <div className="flex items-center text-slate-600 gap-3">
                <WalletMinimal size={20} />
                <span className='text-base font-semibold text-slate-800' >Warranty not available</span>
            </div>
        </div>
<div className="px-3 py-4">
   <div className="w-full">
    {/* Sold by section */}
    <div className="flex items-center justify-between ">
        <div className="flex items-center justify-between w-full ">
            <div>
                <span className='text-sm text-slate-500' >
                    Sold by
                </span>
                <span className='block font-semibold text-slate-800 text-lg hover:text-blue-600' >
                   <Link href={`/shop/${productDetails?.Shop.id}`}>{productDetails?.Shop?.name}</Link>
                </span>
            </div>
            <button  onClick={(e:any)=>handleChat(e)} className='text-blue-600 font-semibold text-sm flex items-center gap-1 hover:underline' >
                <MessageSquareText size={16} /> Chat
            </button>
        </div>
    </div>
      {/* Seller performance stats */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-200 mt-4 pt-4">
            <div>
                <p className='text-xs text-slate-500' >
                    Seller Rating
                </p>
                <p className='text-lg font-semibold text-slate-800' >88%</p>
            </div>
            <div  >
                <p className='text-xs text-slate-500' >Chat Response</p>
                <p className='text-lg font-semibold text-slate-800' >95%</p>
            </div>
        </div>
        {/* Go to Store */}
        <div className="text-center mt-4 border-t border-slate-200 pt-4">
          <Link
            href={`/shop/${productDetails?.Shop.id}`}
            className="block w-full bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Visit Store
          </Link>
        </div>
   </div>
</div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 lg:mt-12 px-4 sm:px-6 lg:px-8" >
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 min-h-[40vh] p-6 sm:p-8 lg:p-10">
                <h3 className='text-xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6' >
                    Product Details of {productDetails?.title}
                </h3>
                <div className='prose prose-lg prose-slate max-w-none text-slate-700' dangerouslySetInnerHTML={{__html:productDetails?.detailed_description}} />
            </div>
        </div>

        <div className="max-w-7xl max-h-[55vh] overflow-hidden mx-auto">
        {/* Add id="reviews" for the anchor link and scroll-mt-20 for header offset */}
        <div
          id="reviews"
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 min-h-[50vh] mt-8 lg:mt-12 p-6 sm:p-8 lg:p-10 scroll-mt-20"
        >
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
            Ratings & Reviews of {productDetails?.title}
          </h3>

          {/* === REPLACE THE <p> TAG... === */}
          {/* <p className='flex flex-col items-center justify-center text-center py-20 text-slate-500' >
              <span className="text-lg font-medium">No Reviews Yet</span>
              <span className="text-sm">Be the first to review this product!</span>
          </p> 
          */}

          {/* === ...WITH THIS LOGIC === */}
          {isLoadingReviews && !(reviews.length>0) ? (
            <div className="flex items-center justify-center text-center py-20 text-slate-500">
              <span className="text-lg font-medium">Loading Reviews...</span>
            </div>
          ) : (
            <ProductReviews
              productTitle={productDetails?.title}
              productId={productDetails?.id}
              reviews={reviews}
              currentUser={user} // Pass the user from useUser()
              onReviewSubmit={handleReviewSubmit}
              onReviewDelete={handleReviewDelete}
              isSubmitting={isSubmittingReview}
            />
          )}
          {/* === END OF REPLACEMENT === */}

        </div>
      </div>
        <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 min-h-[50vh] mt-8 lg:mt-12 p-6 sm:p-8 lg:p-10">
        <h3 className='text-xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6' >
            You May Also Like
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recommendedProducts?.map((i:any)=><ProductCard key={i?.id} product={i} />)}
        </div>
            </div>
        </div>
    </div>
  )
}

export default ProductDetails;