'use client'; 

import React, { useState } from 'react';
import { 
    Star, 
    MessageCircle, 
    MapPin, 
    Clock, 
    Globe, 
    Edit,
    Grid,
    MessageSquare,
    Rss,
    Pencil,
    LayoutDashboard, 
    Settings 
} from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query'; 
import axiosInstance from '@/app/utils/axiosInstance'; // Adjust path if needed
import useSeller from '@/app/hooks/useSeller'; // Adjust path if needed
import { useForm } from 'react-hook-form'; 

// --- ShopDetailsForm Component (Styling Integrated) ---
type FormData = {
  name:string;
  bio:string;
  category:string;
  address:string;
  opening_hours:string;
  website:string;
}

const ShopDetailsForm: React.FC<{ 
    initialData: any; 
    onCancel: () => void; // Function to switch back to view mode
}> = ({
  initialData,
  onCancel, 
}) => {
  const [isLoading,setIsLoading]= useState(false);
  const queryClient= useQueryClient();

  const {
    register,
    handleSubmit,
    formState:{errors},
    reset, 
 } = useForm<FormData>({
  defaultValues:{ // Ensure defaultValues are correctly populated
    name:initialData?.name || '',
    bio:initialData?.bio || '',
    category:initialData?.category || '',
    address:initialData?.address || '',
    opening_hours:initialData?.opening_hours || '',
    website:initialData?.website || '' 
  }
 });

 const updateShopMutation = useMutation({mutationFn:async (data:FormData)=>{
      // Make sure your API endpoint knows which shop to update
      // You might need to pass shopId or handle it implicitly via auth
      const response = await axiosInstance.put(`/shop-details-update`, data); 
       setIsLoading(true); // Set loading state here or within mutate call
      console.log(response);
      return response.data;
   },onSuccess:(data,formData)=>{ 
     setIsLoading(false)
     queryClient.invalidateQueries({ queryKey:["seller"] }); // Invalidate seller to refetch updated shop data
     onCancel(); // Switch back to view mode after success
     alert("Shop updated successfully!"); // Simple feedback
     
   },
  onError:(error)=>{
    
    setIsLoading(false)
    console.error("Update failed:", error);
    alert("Update failed. Please try again."); // Simple feedback
  }
  })
  
  const onSubmit= async(data:FormData)=>{ 
    updateShopMutation.mutate(data);
  }

  // Handle Cancel - reset form to initial values and switch tab
  const handleCancel = () => {
      reset({ // Reset form fields to original data
          name:initialData?.name || '',
          bio:initialData?.bio || '',
          category:initialData?.category || '',
          address:initialData?.address || '',
          opening_hours:initialData?.opening_hours || '',
          website:initialData?.website || '' 
      });
      onCancel(); // Call the prop function to switch tab/view
  }

   


  // Form styling integrated into the main content area
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> 
        <h3 className="text-xl font-semibold text-white mb-6 border-b border-slate-800 pb-4">
            Edit Shop Information
        </h3>
       
       {/* Input field divs */}
       <div>
          <label htmlFor="edit-name" className='block text-sm font-medium text-slate-300 mb-1'>Name</label>
          <input 
            type="text" 
            id="edit-name" // Use unique IDs if needed
            placeholder='Enter your shop name' 
            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                       text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50' 
            {...register("name", { required: "Name is required" })}
            disabled={isLoading || updateShopMutation.isPending}
          />
          {errors.name && <p className='text-red-500 text-xs mt-1'> {String(errors.name.message)} </p>}
        </div>

        <div>
          <label htmlFor="edit-bio" className='block text-sm font-medium text-slate-300 mb-1'>Bio</label>
          <textarea 
            id="edit-bio"
            rows={4}
            placeholder='Tell us about your shop...' 
            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                       text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50' 
            {...register("bio", { required: "Bio is required" })}
            disabled={isLoading || updateShopMutation.isPending}
          />
          {errors.bio && <p className='text-red-500 text-xs mt-1'> {String(errors.bio.message)} </p>}
        </div>

        <div>
          <label htmlFor="edit-category" className='block text-sm font-medium text-slate-300 mb-1'>Category</label>
          <input 
            type="text" 
            id="edit-category"
            placeholder='e.g., Electronics, Fashion, Home Goods' 
            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                       text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50' 
            {...register("category", { required: "Category is required" })}
            disabled={isLoading || updateShopMutation.isPending}
          />
          {errors.category && <p className='text-red-500 text-xs mt-1'> {String(errors.category.message)} </p>}
        </div>

        <div>
          <label htmlFor="edit-address" className='block text-sm font-medium text-slate-300 mb-1'>Address</label>
          <textarea 
            id="edit-address"
            rows={3}
            placeholder='Enter your shop address' 
            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                       text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50' 
            {...register("address", { required: "Address is required" })}
            disabled={isLoading || updateShopMutation.isPending}
          />
          {errors.address && <p className='text-red-500 text-xs mt-1'> {String(errors.address.message)} </p>}
        </div>

        <div>
          <label htmlFor="edit-opening_hours" className='block text-sm font-medium text-slate-300 mb-1'>Opening Hours</label>
          <input 
            type="text" 
            id="edit-opening_hours"
            placeholder='e.g., Mon-Fri, 9am - 5pm' 
            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                       text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50' 
            {...register("opening_hours", { required: "Opening hours are required" })}
            disabled={isLoading || updateShopMutation.isPending}
          />
          {errors.opening_hours && <p className='text-red-500 text-xs mt-1'> {String(errors.opening_hours.message)} </p>}
        </div>

        <div>
          <label htmlFor="edit-website" className='block text-sm font-medium text-slate-300 mb-1'>Website</label>
          <input 
            type="url" 
            id="edit-website"
            placeholder='https://your-shop.com' 
            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                       text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50' 
            {...register("website", { 
              validate: (value) => {
                if (!value) return true;
                const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                return pattern.test(value) || "Please enter a valid URL";
              }
            })}
            disabled={isLoading || updateShopMutation.isPending}
          />
          {errors.website && <p className='text-red-500 text-xs mt-1'> {String(errors.website.message)} </p>}
        </div>


        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel} 
            className="px-5 py-2 rounded-lg text-slate-300 border border-slate-700
                       hover:bg-slate-800 transition-colors"
            disabled={isLoading || updateShopMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold
                       hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || updateShopMutation.isPending} 
          >
            {isLoading || updateShopMutation.isPending ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
        {updateShopMutation.isError && (
             <p className="text-red-500 text-sm mt-3 text-right">Update failed. Please try again.</p>
        )}
         {/* Success message can be handled via toast notification library */}
    </form>
  );
};


// --- Helper Components (StarRating, ProductCard, ReviewCard, InfoCard) ---
const StarRating = ({ rating = 0, size = 16 }: { rating: number, size?: number }) => {
    const safeRating = Math.max(0, Math.min(5, rating || 0)); // Ensure rating is between 0-5
    const fullStars = Math.floor(safeRating);
    const halfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} size={size} className="text-yellow-400 fill-yellow-400" />
            ))}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} size={size} className="text-slate-600 fill-slate-600" />
            ))}
        </div>
    );
};

const ProductCard = ({ product }: { product: any }) => (
    <a 
        href={`/product/${product.slug}`} 
        className="group block bg-slate-900 rounded-xl border border-slate-800
                   overflow-hidden transition-all duration-300 transform 
                   hover:-translate-y-1 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/25"
    >
        <div className="overflow-hidden">
            <img 
                src={product.images?.[0]?.url || "https://placehold.co/300x300/1e293b/94a3b8?text=No+Image"} 
                alt={product.title || 'Product Image'}
                className="w-full h-auto aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
            />
        </div>
        <div className="p-4">
            <h3 className="text-base font-semibold text-white truncate">{product.title || 'Untitled Product'}</h3>
            <div className="flex items-center justify-between mt-2">
                <p className="text-lg font-bold text-blue-400">₹{(product.sale_price || 0).toFixed(2)}</p>
                <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400" />
                    <span className="text-sm text-slate-300">{(product.ratings || 0).toFixed(1)}</span>
                </div>
            </div>
        </div>
    </a>
);

const ReviewCard = ({ review }: { review: any }) => (
    <div className="flex gap-4 py-5 border-b border-slate-800">
        <img 
            src={review.user?.avatar[0].url || "https://placehold.co/40x40/71717a/ffffff?text=U"} 
            alt={review.user?.name || 'User'} 
            className="w-10 h-10 rounded-full bg-slate-700 object-cover" // Added object-cover
        />
        <div className="flex-1">
            <h4 className="text-base font-semibold text-white">{review.user?.name || 'Anonymous'}</h4>
            <div className="flex items-center gap-2 my-1.5">
                <StarRating rating={review.rating || 0} size={14} />
                <span className="text-xs text-slate-500">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                </span>
            </div>
            <p className="text-sm text-slate-300">{review.reviews || 'No comment provided.'}</p>
        </div>
    </div>
);

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`p-6 bg-slate-900 rounded-xl border border-slate-800 ${className}`}>
        <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider mb-4">
            {title}
        </h3>
        {children}
    </div>
);

// Seller Admin Card - simplified
const SellerAdminCard = () => (
    <div className="p-6 bg-slate-900 rounded-xl border-2 border-blue-800/60 shadow-xl shadow-blue-900/20">
        <h3 className="text-sm font-semibold uppercase text-blue-400 tracking-wider mb-4">
            Seller Admin
        </h3>
        <div className="space-y-3">
            <a 
                href="/dashboard"
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                <LayoutDashboard size={16} /> Go to Dashboard
            </a>
        </div>
    </div>
);


// --- The Main Page Component ---
const ShopViewPage = () => {
    const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'edit'>('products'); 
    
    // Fetch seller data
    const {seller, isLoading} = useSeller();
    const shop = seller?.shop; 
    
    // State for image previews
    const [currentAvatar, setCurrentAvatar] = useState((seller?.avatar && seller?.avatar[0]?.url) || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
    const [currentBanner, setCurrentBanner] = useState(shop?.coverBanner || "https://i.imgur.com/kF2J1fJ.png");

    const queryClient = useQueryClient();

    // AUTH CHECK
    const currentSellerId = seller?.id; 
    const isOwner = shop?.sellerId === currentSellerId;
    
    // Image Upload Logic 
    const convertFileToBase64 = async (file:File)=>{ 
        return new Promise( (resolve,reject)=>{ 
             const reader = new FileReader();
             reader.readAsDataURL(file);
             reader.onload= ()=>resolve(reader.result);
             reader.onerror= (error)=>reject(error);
        }) 
     };
    const handleAvatarChange = async(e:any) =>{ 
         console.log("New Avatar:", e.target.files?.[0]);
         if (!e.target.files?.[0]) return; // Add check if file exists
         const file = await convertFileToBase64(e?.target?.files?.[0]);
    
         if(file){
             try {
                 const res:any =await  axiosInstance.put('/update-seller-profile-image',{file},{withCredentials:true});
                 if(res.data.success){
                     setCurrentAvatar(res.data.image) 
                     queryClient.invalidateQueries({ queryKey:["seller"] }); 
                 } else {
                     console.error("Avatar update API failed:", res.data.message);
                 }
             } catch (error) {
                 console.error("Error updating avatar:", error);
             }
         }
    };
    const handleBannerChange = async(e: any) =>{ 
         console.log("New Banner:", e.target.files?.[0]);
         if (!e.target.files?.[0]) return; // Add check if file exists
         const file = await convertFileToBase64(e?.target?.files?.[0]);
    
         if(file){
             try {
                 const res:any =await  axiosInstance.put(`/update-shop-cover-image/${shop?.id}`,{file},{withCredentials:true});
                 if(res.data.success){
                     setCurrentBanner(res.data.image) 
                     queryClient.invalidateQueries({ queryKey:["seller"] }); // Invalidate seller too, as shop is nested
                 } else {
                    console.error("Banner update API failed:", res.data.message);
                 }
             } catch (error) {
                 console.error("Error updating banner:", error);
             }
         }
    };
    
    // Loading and Not Found states
    if(isLoading){ return <p className='flex justify-center items-center text-center w-full h-[100vh] text-white text-5xl'>Loading...</p> } 
    if (!shop) { return <p className="text-center text-slate-400 mt-20">Shop not found or not yet created.</p> }
   
    const handleCancelEdit = () => {
        setActiveTab('products'); 
    }
   console.log(seller)
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            
            {/* --- Header: Immersive Banner --- */}
            <div className="relative h-[550px] sm:h-[400px] w-full bg-slate-800 overflow group">
                {/* Banner Img */}
                  <img 
                    src={currentBanner} 
                    alt={`${shop.name || 'Shop'} cover`}
                    className="w-full h-full object-cover opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
                
                {/* Edit Banner Button */}
                {isOwner && (
                    <>
                        <label 
                            htmlFor="banner-upload" 
                            className="absolute top-6 right-6 z-10 cursor-pointer text-xs font-medium 
                                       bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white 
                                       px-3 py-1.5 rounded-md transition-all 
                                       flex items-center gap-1.5"
                        >
                            <Pencil className="w-3 h-3" /> Change Banner
                        </label>
                        <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                    </>
                )}
                
                {/* Header Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end sm:gap-6">
                        {/* Avatar */}
                         {/* <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full 
                                        bg-slate-800 p-1 ring-4 ring-slate-900 overflow-hidden 
                                        flex-shrink-0 border-4 border-slate-900 group/avatar"> */}
                            {/* <img 
                                src={currentAvatar} 
                                alt={`${shop.name || 'Shop'} avatar`}
                                className="w-full h-full object-cover rounded-full"
                            /> */}
                            {/* Edit Avatar Button */}
                            {/* {isOwner && (
                                <>
                                    <label 
                                        htmlFor="avatar-upload" 
                                        className="absolute inset-0 flex items-center justify-center cursor-pointer 
                                                   bg-black/60 text-white text-xs font-semibold opacity-0 
                                                   group-hover/avatar:opacity-100 transition-opacity duration-300 rounded-full z-10"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </label>
                                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </>
                            )}
                             */}
                        {/* </div> */}
                        {/* Info */}
                        <div className="flex-1 mt-4 sm:mt-0">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{shop.name || 'Shop Name'}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <StarRating rating={shop.ratings || 0} size={18} />
                                <span className="text-base text-slate-400">
                                    {(shop.ratings || 0).toFixed(1)} 
                                    <span className="ml-1">({shop?.reviews?.length || 0} Reviews)</span>
                                </span>
                            </div>
                        </div>
                        {/* Customer Buttons */}
                         {!isOwner && (
                             <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors text-sm font-medium">
                                    <Rss size={16} /> Follow
                                </button>
                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                                    <MessageCircle size={16} /> Message
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Main Two-Column Layout --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- Sidebar (Left) --- */}
                    <aside className="lg:col-span-1 lg:sticky lg:top-10 self-start space-y-6">
                        
                        {isOwner && <SellerAdminCard />}
                        
                        <InfoCard title="About Shop">
                            <p className="text-sm text-slate-300">{shop.bio || 'No bio provided.'}</p>
                        </InfoCard>

                        <InfoCard title="Shop Details">
                            <ul className="space-y-3">
                                 <li className="flex items-start gap-3">
                                    <MapPin size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">{shop.address || 'No address provided.'}</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Clock size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">{shop.opening_hours || 'Not specified.'}</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Globe size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    {shop.website ? (
                                        <a href={shop.website} target="_blank" rel="noopener noreferrer" 
                                           className="text-sm text-blue-400 hover:underline">{shop.website}</a>
                                    ): (
                                        <p className="text-sm text-slate-500">No website provided.</p>
                                    )}
                                </li>
                            </ul>
                        </InfoCard>
                    </aside>

                    {/* --- Main Content (Right) --- */}
                    <main className="lg:col-span-2">
                        {/* Tab Buttons */}
                        <div className="border-b border-slate-800">
                             <nav className="-mb-px flex space-x-8">
                                <button 
                                    className={`py-4 px-2 text-lg font-medium transition-colors flex items-center gap-2
                                        ${activeTab === 'products' 
                                            ? 'text-blue-400 border-b-2 border-blue-500' 
                                            : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                                        }`}
                                    onClick={() => setActiveTab('products')}
                                >
                                    <Grid size={20} /> Products
                                </button>
                                <button 
                                    className={`py-4 px-2 text-lg font-medium transition-colors flex items-center gap-2
                                        ${activeTab === 'reviews' 
                                            ? 'text-blue-400 border-b-2 border-blue-500' 
                                            : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                                        }`}
                                    onClick={() => setActiveTab('reviews')}
                                >
                                    <MessageSquare size={20} /> Reviews ({shop?.reviews?.length || 0})
                                </button>
                                {isOwner && (
                                    <button 
                                        className={`py-4 px-2 text-lg font-medium transition-colors flex items-center gap-2
                                            ${activeTab === 'edit' 
                                                ? 'text-blue-400 border-b-2 border-blue-500' 
                                                : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                                            }`}
                                        onClick={() => setActiveTab('edit')}
                                    >
                                        <Edit size={20} /> Edit Shop
                                    </button>
                                )}
                            </nav>
                        </div>

                        {/* --- Tab Content --- */}
                        <div className="mt-8">
                            {/* Products Tab */}
                            {activeTab === 'products' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                     {(shop?.products?.length || 0) > 0 ? (
                                         shop.products.map((product:any) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))
                                     ) : (
                                        <p className="text-slate-400 sm:col-span-2 xl:col-span-3">This shop hasn't added any products yet.</p>
                                     )}
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="max-w-full">
                                   {(shop?.reviews?.length || 0) > 0 ? (
                                        shop.reviews.map((review:any) => (
                                            <ReviewCard key={review.id} review={review} />
                                        ))
                                    ) : (
                                        <p className="text-slate-400">This shop doesn't have any reviews yet.</p>
                                    )}
                                </div>
                            )}

                            {/* Edit Tab Content */}
                            {activeTab === 'edit' && isOwner && (
                                <ShopDetailsForm 
                                    initialData={shop} 
                                    onCancel={handleCancelEdit} 
                                />
                            )}
                        </div>
                    </main>

                </div>
            </div>
            
        </div>
    );
};

export default ShopViewPage;

