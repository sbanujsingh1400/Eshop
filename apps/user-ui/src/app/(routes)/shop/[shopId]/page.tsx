'use client'

import React, { useState } from 'react'
import {
    Star,
    MapPin,
    Clock,
    Globe,
    MessageSquare,
    Store,
    LayoutGrid,
    Loader2,
    AlertCircle,
    MessageCircle, // Icon for "no reviews"
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import axiosInstance from '@/app/utils/axiosInstance'
import { useParams, useRouter } from 'next/navigation'
import { isProtected } from '@/app/utils/protected'
import useUser from '@/app/hooks/useUser'

// --- DATA TYPES (from your Prisma schema) ---
// You should ideally move these to a central /types file

type ShopImage = {
    url: string;
};

type ShopProduct = {
    id: string;
    title: string;
    slug: string;
    sale_price: number;
    regular_price: number;
    ratings: number;
    images: ShopImage[];
};

type ShopReview = {
    id: string;
    rating: number;
    reviews: string; // From shopReviews model
    createdAt: string; // Or Date
    user: {
        name: string;
    };
};

type ShopData = {
    id: string;
    name: string;
    bio: string;
    category: string;
    avatar: ShopImage[];
    coverBanner: string;
    address: string;
    opening_hours: string;
    website: string;
    ratings: number;
    reviews: ShopReview[];
    products: ShopProduct[]; // Added products array
    sellerId:string
};

type ReviewFormData = {
    rating: number;
    reviews: string;
};

// --- REAL API FUNCTIONS (using axiosInstance) ---

/**
 * Fetches public shop details from the API.
 * This is the queryFn for useQuery.
 */
const fetchShopDetails = async (shopId: string): Promise<ShopData> => {
    // This now uses your axiosInstance and a real API endpoint
    // Adjust the endpoint if necessary (e.g., /api/user/shop/${shopId})
    const { data } = await axiosInstance.get(`/product/get-shop/${shopId}`);
    console.log(data)
    return data.shop;
};



/**
 * Posts a new shop review.
 * This is the mutationFn for useMutation.
 */
const postShopReview = async ({ userId,shopId, formData }: { shopId: string, formData: ReviewFormData,userId:string }) => {
    // This now uses your axiosInstance and a real API endpoint
    // Adjust the endpoint if necessary
    console.log({...formData,userId,shopId})
    const { data } = await axiosInstance.post(`/product/shops/${shopId}/reviews`, {...formData,userId,shopId});
    return data;
};

// --- SUB-COMPONENTS ---

// 1. Shop Header
const ShopHeader = ({ name, ratings, reviewCount, coverBanner, avatarUrl,handleChat }: {
    name: string,
    ratings: number,
    reviewCount: number,
    coverBanner: string,
    avatarUrl: string
    handleChat:()=>any
}) =>{ 
    
   return  (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Cover Banner */}
        <div className="h-48 md:h-64 bg-gray-200">
            <img
                src={coverBanner}
                alt={`${name} cover`}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/1200x300/E2E8F0/AAAAAA?text=Banner+Not+Found')}
            />
        </div>
        
        {/* Shop Info */}
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-4">
                    {/* <div className="w-24 h-24 rounded-full border-4 border-white -mt-16 bg-gray-300 flex-shrink-0">
                        <img
                            src={avatarUrl}
                            alt={`${name} avatar`}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100/E2E8F0/AAAAAA?text=Shop')}
                        />
                    </div> */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-gray-700">{ratings?.toFixed(1)}</span>
                            <span className="text-gray-500">({reviewCount} Reviews)</span>
                        </div>
                    </div>
                </div>
                {/* TODO: Wire this up to your chat system */}
                <button onClick={()=>handleChat()} className="flex items-center justify-center gap-2 mt-4 sm:mt-0 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <MessageSquare className="w-4 h-4" />
                    Chat with Seller
                </button>
            </div>
        </div>
    </div>
);}

// 2. Shop Sidebar
const ShopSidebar = ({ bio, address, hours, website }: {
    bio: string,
    address: string,
    hours: string,
    website: string
}) => (
    <div className="space-y-6">
        {/* About Shop Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">About Shop</h3>
            <p className="text-gray-600 text-sm">
                {bio}
            </p>
        </div>
        
        {/* Shop Details Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Shop Details</h3>
            <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{address}</span>
                </li>
                <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700">{hours}</span>
                </li>
                <li className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        {website}
                    </a>
                </li>
            </ul>
        </div>
    </div>
);

// 3. Product Card (Styled for User UI)
const ProductCard = ({ product }: { product: ShopProduct }) => (
    <a href={`/product/${product.slug}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden block transition-shadow hover:shadow-md">
        <div className="w-full aspect-square bg-gray-100">
            <img 
                src={product?.images &&product?.images[0]?.url} 
                alt={product?.title} 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/300x300/E2E8F0/AAAAAA?text=Image')}
            />
        </div>
        <div className="p-4">
            <h4 className="text-base font-medium text-gray-800 truncate">{product.title}</h4>
            <div className="flex items-center justify-between mt-2">
                <p className="text-lg font-bold text-gray-900">
                    ₹{product.sale_price.toLocaleString('en-IN')}
                    {product.regular_price > product.sale_price && (
                        <span className="text-sm text-gray-500 line-through ml-2">₹{product.regular_price.toLocaleString('en-IN')}</span>
                    )}
                </p>
                <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-700">{product.ratings.toFixed(1)}</span>
                </div>
            </div>
        </div>
    </a>
);

// 4. Shop Review Form (Uses useForm and useMutation)
const ShopReviewForm = ({ userId,shopId, onSubmitSuccess }: { userId:string,shopId: string, onSubmitSuccess: () => void }) => {
    const queryClient = useQueryClient();
    
    // This is the useForm hook you requested
    const { control, handleSubmit, formState: { errors, isDirty }, register, setValue, reset } = useForm<ReviewFormData>({
        defaultValues: { rating: 0, reviews: '' }
    });

    // This is the useMutation hook you requested
    const mutation = useMutation({
        mutationFn: (formData: ReviewFormData) => postShopReview({ userId,shopId, formData }),
        onSuccess: () => {
            // Invalidate and refetch shop data to show the new review
            queryClient.invalidateQueries({ queryKey: ['shopDetails', shopId] });
            reset();
            onSubmitSuccess(); // e.g., show a success toast
        },
        onError: (error) => {
            // Handle error, e.g., show an error toast
            console.error("Failed to submit review:", error);
            // You could use react-hot-toast here: toast.error('Failed to submit review.')
        }
    });

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
                    <Controller
                        name="rating"
                        control={control}
                        rules={{ min: 1 }} // Require at least 1 star
                        render={({ field }) => (
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-6 h-6 cursor-pointer ${
                                            field.value >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                        }`}
                                        onClick={() => setValue('rating', star, { shouldDirty: true })}
                                    />
                                ))}
                            </div>
                        )}
                    />
                    {errors.rating && <p className="text-red-500 text-xs mt-1">Please select a rating.</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="comment" className="text-sm font-medium text-gray-700 mb-2 block">Your Review</label>
                    <textarea
                        id="comment"
                        {...register('reviews', { required: 'Review comment is required' })}
                        rows={4}
                        placeholder="What did you like or dislike?"
                        className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                    {errors.reviews && <p className="text-red-500 text-xs mt-1">{errors.reviews.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={mutation.isPending || !isDirty}
                    className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {mutation.isPending ? (
                        <span className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </span>
                    ) : (
                        'Submit Review'
                    )}
                </button>
            </form>
        </div>
    );
};

// 5. List of Shop Reviews
const ShopReviewList = ({ reviews }: { reviews: ShopReview[] }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Reviews ({reviews?.length})</h3>
        
        {reviews?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300" />
                <h4 className="text-lg font-semibold text-gray-700 mt-4">No Reviews Yet</h4>
                <p className="text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
        ) : (
            <ul className="space-y-6">
                {reviews?.map(review => (
                    <li key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {/* Example: <img src={review.user.avatar[0]?.url} alt={review.user.name} className="w-8 h-8 rounded-full bg-gray-200" /> */}
                                <span className="font-semibold text-gray-800">{review.user.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                        review.rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-gray-600 text-sm">{review.reviews}</p>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

// --- MAIN COMPONENT ---
export default function UserShopPage() {
    const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
    const router = useRouter();
   const {user} = useUser();
//    console.log(user)
    // This is the useQuery hook you requested
    const { shopId  }:{shopId:string}= useParams();
    
    const { data: shopData, isLoading, isError, error } = useQuery<ShopData>({
        queryKey: ['shopDetails', shopId], // React Query key
        queryFn: () => fetchShopDetails(shopId), // The API function to call
    });
    
    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen p-4 md:p-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="h-48 md:h-64 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-6">
                        <div className="flex items-end gap-4">
                            <div className="w-24 h-24 rounded-full bg-gray-200 -mt-16 border-4 border-white"></div>
                            <div className="flex-1">
                                <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
                                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Body Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                            <div className="h-5 bg-gray-200 rounded w-full mb-3"></div>
                            <div className="h-5 bg-gray-200 rounded w-full mb-3"></div>
                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                    {/* Content Skeleton */}
                    <div className="lg:col-span-3">
                        <div className="h-10 bg-white rounded-lg shadow-sm border border-gray-200 w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (isError) {
        return (
            <div className="bg-gray-50 min-h-screen p-4 md:p-8 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">Could not load shop</h2>
                    <p className="text-gray-600 mt-2">
                        {error instanceof Error ? error.message : 'An unknown error occurred.'}
                    </p>
                    <a href="/" className="mt-6 inline-block bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-sm hover:bg-blue-700">
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    const handleChat = async ()=>{

  
        try {
           
          const res:any = await axiosInstance.post('chatting/create-user-conversationGroup',{sellerId:shopData?.sellerId},isProtected);
          router.push(`/inbox?conversationId=${res.data.conversation.id}`) ;
        
        } catch (error) {
          console.log(error)
        } 
           
        
         }
    
    // --- Success State (Data is loaded) ---
    // We can safely assume shopData exists here
    return (
        // Changed main background to bg-slate-50 to match your reference
        <div className="bg-slate-50 min-h-screen p-4 md:p-8"> 
            <div className="max-w-7xl mx-auto">
                {/* Shop Header */}
                <ShopHeader 
                    name={shopData?.name!}
                    ratings={shopData?.ratings!}
                    reviewCount={shopData?.reviews?.length!}
                    coverBanner={shopData?.coverBanner!}
                    avatarUrl={(shopData?.avatar &&shopData?.avatar[0]?.url)!}
                    handleChat={handleChat}
                />
                
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        <ShopSidebar 
                            bio={shopData?.bio!}
                            address={shopData?.address!}
                            hours={shopData?.opening_hours!}
                            website={shopData?.website!}
                        />
                    </div>
                    
                    {/* Right Content (Tabs) */}
                    <div className="lg:col-span-3">
                        {/* Tab Navigation */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6">
                            <nav className="flex items-center space-x-2">
                                <TabButton
                                    icon={<LayoutGrid className="w-4 h-4" />}
                                    label="Products"
                                    isActive={activeTab === 'products'}
                                    onClick={() => setActiveTab('products')}
                                />
                                <TabButton
                                    icon={<MessageSquare className="w-4 h-4" />}
                                    label={`Reviews (${shopData?.reviews?.length})`}
                                    isActive={activeTab === 'reviews'}
                                    onClick={() => setActiveTab('reviews')}
                                />
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div>
                            {/* Products Tab */}
                            {activeTab === 'products' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {shopData?.products?.length! > 0 ? (
                                        shopData?.products.map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))
                                    ) : (
                                        <p className="text-gray-500 md:col-span-2 xl:col-span-3">This shop hasn't added any products yet.</p>
                                    )}
                                </div>
                            )}
                            
                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Review Form */}
                                    <div className="md:col-span-1">
                                        <ShopReviewForm 
                                           userId={user?.id! || ""}
                                            shopId={shopData?.id!} 
                                            onSubmitSuccess={() => {
                                                // You could show a toast notification here
                                                console.log("Review submitted!");
                                                // e.g., toast.success('Review submitted successfully!')
                                            }} 
                                        />
                                    </div>
                                    {/* Review List */}
                                    <div className="md:col-span-2">
                                        <ShopReviewList reviews={shopData?.reviews!} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- UPDATED TabButton Component ---
// Styled to match your reference image's navigation
const TabButton = ({ label, icon, isActive, onClick }: {
    label: string,
    icon: React.ReactNode,
    isActive: boolean,
    onClick: () => void
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
                ? 'bg-blue-100 text-blue-600' // Active: Light blue bg, blue text (like your 'Profile' tab)
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900' // Inactive: Gray text (like 'My Orders')
        }`}
    >
        {icon}
        {label}
    </button>
);