'use client';

// Example Path: app/dashboard/products/[productId]/page.tsx
// This page fetches data based on the productId param

import React, { useEffect, useState } from 'react';
import { 
    Star, 
    Edit, 
    Trash2, 
    Tag, 
    Palette, 
    Ruler, 
    ShieldCheck, 
    Calendar,
    PackageCheck,
    IndianRupee,
    BarChart2, // For Sales
    AlertTriangle, // For Low Stock
    CheckCircle, // For Active Status
    XCircle, // For Inactive Status
    Pencil
} from 'lucide-react';
import useSeller from '@/app/hooks/useSeller';
import axiosInstance from '@/app/utils/axiosInstance';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteConfirmationModel from '@/app/shared/components/modals/DeleteConfirmationModel';
// Assume fetchProductData is a function to get product details by ID
// import { fetchProductData } from '@/app/lib/data'; 
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axiosInstance from '@/app/utils/axiosInstance';


// --- Mock Data (Replace with actual data fetch) ---
// Based *exactly* on your 'products' model, including reviews

async function fetchProductData(slug:any) {
      const res:any = await axiosInstance('/product/get-product/'+slug);
    //   console.log(res)
      return res.data.product;
}
const deleteProducts = async (productId:any) => {

    const res: any = await axiosInstance.delete('/product/delete-product/'+productId);
    // console.log(res?.data);
     return res?.data?.products;
  
  }
  
  
  const restoreProducts = async (productId:any) => {
  
    const res: any = await axiosInstance.put('/product/restore-product/'+productId);
    // console.log(res?.data);
    return res?.data?.products;
  
  }



// --- Helper Components ---

const StarRatingDisplay = ({ rating = 0, size = 16 }: { rating: number, size?: number }) => {
    // ... (same as previous StarRating component) ...
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

// Seller Review Item with Delete Button
const SellerReviewItem = ({ review, onDelete }: { review: any, onDelete: (reviewId: string) => void }) => (
    <div className="flex gap-4 py-5 border-b border-slate-800">
        <img 
            src={review.users?.avatar[0]?.url || "https://placehold.co/40x40/71717a/ffffff?text=U"} 
            alt={review.users?.name || 'User'} 
            className="w-10 h-10 rounded-full bg-slate-700 object-cover"
        />
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white">{review.users?.name || 'Anonymous'}</h4>
                <span className="text-xs text-slate-500">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                </span>
            </div>
            <div className="flex items-center gap-2 my-1.5">
                <StarRatingDisplay rating={review?.rating || 0} size={14} />
            </div>
            <p className="text-sm text-slate-300 mb-3">{review?.comment || 'No comment provided.'}</p>
             {/* Delete Button */}
             <button 
                onClick={() => onDelete(review?.id)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
             >
                <Trash2 size={14} /> Delete Review
             </button>
        </div>
    </div>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: "Active" | "Inactive" | "Draft" }) => {
    const styles = {
        Active: 'bg-green-600/20 text-green-400 ring-green-600/30',
        Inactive: 'bg-red-600/20 text-red-400 ring-red-600/30',
        Draft: 'bg-yellow-600/20 text-yellow-400 ring-yellow-600/30',
    };
    const icons = {
        Active: <CheckCircle size={14} />,
        Inactive: <XCircle size={14} />,
        Draft: <Pencil size={14} />,
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${styles[status] || styles.Draft}`}>
            {icons[status] || icons.Draft}
            {status}
        </span>
    );
};

// --- The Main Page Component ---
const SellerProductDetailsPage = () => {
    
    // In a real app, you'd fetch based on params
    const { productId } = useParams<any>(); 
    
    const { data: product, isLoading } = useQuery({queryKey:['product', productId],queryFn: () => fetchProductData(productId)});
    
    
   
    // console.log(product);
    // const product = mockProduct; // Using mock data
    // const isLoading = false; // Mock loading state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(product?.images?.[0]?.url || '');
    const queryClient = useQueryClient();

    // --- Placeholder Mutations (Implement with your API) ---
    const deleteReviewMutation = useMutation({
        mutationFn: (reviewId: string) => axiosInstance.delete(`/product/reviews/${reviewId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product'] });
            // Show success toast/message
        },
        onError: () => {
            // Show error toast/message
        }
    });

     const deleteProductMutation = useMutation({
        mutationFn:deleteProducts,
        onSuccess:()=>{
          queryClient.invalidateQueries({queryKey:["product"]});
          setShowDeleteModal(false)
        }
      })
    
      const restoreMutation = useMutation({
        mutationFn:restoreProducts,
        onSuccess:()=>{
          queryClient.invalidateQueries({queryKey:["product"]});
          setShowDeleteModal(false)
        }
      })
    
    // const deleteProductMutation = useMutation({ /* ... */ });

    const handleDeleteReview = (reviewId: string) => {
            deleteReviewMutation.mutate(reviewId);
       
    };
   

     const handleDeleteProduct = () => {
       
            
            setShowDeleteModal(true);
            // Redirect or show confirmation
        
    };

    if (isLoading) { return <p className='text-center text-white mt-20'>Loading product details...</p>; }
    if (!product) { return <p className="text-center text-slate-400 mt-20">Product not found.</p>; }

    const isLowStock = product.stock < 10; // Example threshold
    
 
   

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* --- Main Product Section (Two Columns) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    
                    {/* --- Left Column: Image Gallery --- */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                            <img 
                                src={selectedImage || product.images?.[0]?.url || "https://placehold.co/600x600/1e293b/94a3b8?text=No+Image"} 
                                alt={product.title || 'Product Image'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.map((img:any, index:any) => (
                                    <button 
                                        key={index}
                                        onClick={() => setSelectedImage(img.url)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all
                                                    ${selectedImage === img.url ? 'border-blue-500 scale-105' : 'border-slate-800 hover:border-slate-600'}`}
                                    >
                                        <img src={img.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- Right Column: Product Info & Actions --- */}
                    <div className="space-y-6">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white">{product.title}</h1>
                        
                        <div className="flex items-center gap-4 text-sm">
                            <StatusBadge status={product.status} />
                            <div className={`flex items-center gap-1 ${isLowStock ? 'text-red-400' : 'text-slate-400'}`}>
                                {isLowStock ? <AlertTriangle size={16} /> : <PackageCheck size={16} />}
                                <span>{product.stock} in Stock</span> 
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <StarRatingDisplay rating={product.ratings} size={20} />
                            <span className="text-base text-slate-400">
                                {product.ratings.toFixed(1)} 
                                <span className="ml-1">({product?.reviews?.length || 0} Reviews)</span>
                            </span>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-blue-400">₹{product.sale_price.toFixed(2)}</span>
                            <span className="text-xl text-slate-500 line-through">₹{product.regular_price.toFixed(2)}</span>
                            <span className="text-sm font-medium text-green-400 bg-green-600/20 px-2 py-0.5 rounded">
                                {Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)}% off
                            </span>
                        </div>

                        {/* Key Details Card */}
                        <div className="p-5 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                           <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Category:</span>
                                <span className="text-white font-medium">{product.category} / {product.subCategory}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Brand:</span>
                                <span className="text-white font-medium">{product.brand || 'N/A'}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Total Sales:</span>
                                <span className="text-white font-medium flex items-center gap-1">
                                    <BarChart2 size={14} /> {product.totalSales || 0} units
                                </span>
                           </div>
                        </div>

                         {/* Seller Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                           {/* <a 
                                href={`/dashboard/products/edit/${product.id}`} // Link to your edit page
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold
                                           hover:bg-blue-700 transition-colors"
                           >
                                <Edit size={18} /> Edit Product
                            </a> */}
                           <button
                                onClick={handleDeleteProduct}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600/20 text-red-400 border border-red-600/50
                                           hover:bg-red-600/30 hover:text-red-300 transition-colors"
                           >
                                <Trash2 size={18} /> Delete Product
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Details Sections --- */}
                <div className="mt-12 lg:mt-16 space-y-10">
                    
                    {/* Detailed Description */}
                    <section>
                         <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-800 pb-3">Product Description</h2>
                         {/* Render HTML safely */}
                         <div 
                            className="prose prose-invert prose-sm text-slate-300 max-w-none" 
                            dangerouslySetInnerHTML={{ __html: product.detailed_description || '<p>No description provided.</p>' }}
                         />
                    </section>

                    {/* Specifications & Properties */}
                    {(product.custom_specifications?.length > 0 || product.custom_properties?.length > 0) && (
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-800 pb-3">Specifications</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                {product.custom_specifications?.map((spec: any, i: number) => (
                                    <div key={`spec-${i}`} className="flex justify-between border-b border-slate-800 py-2">
                                        <span className="text-slate-400">{spec.key}:</span>
                                        <span className="text-white font-medium">{spec.value}</span>
                                    </div>
                                ))}
                                {product.custom_properties?.map((prop: any, i: number) => (
                                    <div key={`prop-${i}`} className="flex justify-between border-b border-slate-800 py-2">
                                        <span className="text-slate-400">{prop.name}:</span>
                                        <span className="text-white font-medium">{prop.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Tags, Colors, Sizes */}
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                        <div>
                            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5"><Tag size={16} /> Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.tags?.map((tag: string) => (
                                    <span key={tag} className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full text-xs">{tag}</span>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5"><Palette size={16} /> Colors</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.colors?.map((color: string) => (
                                    <span key={color} style={{backgroundColor:color}} className={` w-[30px] h-[30px] border border-slate-300  rounded-full `}></span>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5"><Ruler size={16} /> Sizes</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes?.map((size: string) => (
                                    <span key={size} className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full text-xs">{size}</span>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* Warranty & Dates */}
                     <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                        <div>
                           <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5"><ShieldCheck size={16} /> Warranty</h3>
                           <p className="text-slate-400">{product.warranty || 'Not specified'}</p>
                        </div>
                         <div>
                           <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5"><Calendar size={16} /> Availability</h3>
                           <p className="text-slate-400">
                                {product.starting_date ? `Starts: ${new Date(product.starting_date).toLocaleDateString()}` : ''}
                                {product.ending_date ? ` Ends: ${new Date(product.ending_date).toLocaleDateString()}` : ''}
                                {!product.starting_date && !product.ending_date && 'Always available'}
                            </p>
                        </div>
                         <div>
                           <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-1.5"><IndianRupee size={16} /> COD</h3>
                           <p className="text-slate-400">{product.cashOnDelivery === 'yes' ? 'Available' : 'Not Available'}</p>
                        </div>
                    </section>

                    {/* --- Review Management Section --- */}
                    <section>
                         <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-800 pb-3">Customer Reviews ({product?.reviews?.length || 0})</h2>
                         <div className="max-w-3xl">
                             {(product?.reviews?.length || 0) > 0 ? (
                                product.reviews.map((review:any) => (
                                    <SellerReviewItem 
                                        key={review.id} 
                                        review={review} 
                                        onDelete={handleDeleteReview} 
                                    />
                                ))
                            ) : (
                                <p className="text-slate-400">This product doesn't have any reviews yet.</p>
                            )}
                         </div>
                    </section>
                </div>

            </div>
            {showDeleteModal && (<DeleteConfirmationModel product={product} onClose={()=>setShowDeleteModal(false)} onConfirm={()=>deleteProductMutation.mutate(product?.id)} onRestore={()=>restoreMutation.mutate(product?.id)} />)}
        </div>
    );
};

export default SellerProductDetailsPage;
