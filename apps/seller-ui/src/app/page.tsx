'use client'; 

import React, { useState } from 'react';

import { 
    ArrowRight, LayoutDashboard, LogOut, User, 
    Pencil, ShoppingBag, Package, 
    IndianRupee, Eye, Settings, Store, PlusCircle,
    Mail, Phone, Globe, Calendar // --- ICONS ADDED ---
} from 'lucide-react';
import useSeller from './hooks/useSeller';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from './utils/axiosInstance';
import EditProfileModal from './shared/components/EditDetailsModel';
import { useRouter } from 'next/navigation';

// --- Reusable Components for the New Bento Grid Layout ---

/**
 * BentoCard: A versatile card for the new grid layout.
 */
interface BentoCardProps {
    href?: string;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    isDestructive?: boolean;
}

const BentoCard: React.FC<BentoCardProps> = ({
    href,
    onClick,
    children,
    className = '',
    isDestructive = false,
}) => {
    // Base classes for the card
    const baseClasses = `
        group relative block w-full h-full p-6
        bg-slate-900 rounded-xl border border-slate-800
        transition-all duration-300 ease-in-out
        transform hover:-translate-y-1
    `;
    
    // Conditional styles for standard vs. destructive actions
    const standardClasses = `
        ${baseClasses} 
        hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/25
    `;
    const destructiveClasses = `
        ${baseClasses} 
        text-left hover:border-red-600 hover:shadow-xl hover:shadow-red-900/25
    `;

    const cardStyles = isDestructive ? destructiveClasses : standardClasses;

    if (href) {
        return <a href={href} className={`${cardStyles} ${className}`}>{children}</a>;
    }
    return <button onClick={onClick} className={`${cardStyles} ${className} text-left`}>{children}</button>;
};

// --- Main component for the Seller Home Page UI and Logic ---
const SellerHomePage = () => {
    // Mock Data
   
      const queryClient=useQueryClient(); 
    const {seller,isLoading} = useSeller();
    const [profilePic,setProfilePic]= useState<string>((seller?.avatar && seller?.avatar[0]?.url) || 'https://ik.imagekit.io/sbanujsingh/products/product-1759752532938_5xZEInFAX?updatedAt=1759752534342' )
    const [coverBanner,setCoverBanner]= useState<string>((seller?.shop &&seller?.shop?.coverBanner) || 'https://ik.imagekit.io/sbanujsingh/products/product-1759752532938_5xZEInFAX?updatedAt=1759752534342' )
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    // console.log(seller)
    const shop=seller?.shop
 console.log(seller)
    // Function to call after successful update to refresh page data
    const handleUpdateSuccess = () => {
        console.log("Data updated, refreshing seller/shop data...");
        // You would typically refetch seller and shop data here
        // e.g., fetchSellerData(); fetchShopData();
        queryClient.invalidateQueries({ queryKey:["seller"] });
    };
    const handleLogout = async() => {
        console.log("Logging out...");
        await axiosInstance.get("/logout-seller").then((res)=>{
            if(res.data.success){
     
             queryClient.setQueryData(['seller'], null);
             // setLoggedIn(false)
             router.push('/login'); 
            }
         })
    }

    const handleAvatarChange = async(e:any) =>{
         console.log("New Avatar:", e.target.files?.[0]);
         const file = await convertFileToBase64(e?.target?.files?.[0]);
    
         if(file){
             const res:any =await  axiosInstance.put('/update-seller-profile-image',{file},{withCredentials:true});
             if(res.data.success){
                 
                 setProfilePic(res.data.image) 
                 
             }
         }

           
        }
    const handleBannerChange = async(e: any) =>{
         console.log("New Banner:", e.target.files?.[0]);
        
        
         const file = await convertFileToBase64(e?.target?.files?.[0]);
    
         if(file){
             const res:any =await  axiosInstance.put('/update-shop-cover-image/'+seller?.shop?.id,{file},{withCredentials:true});
             if(res.data.success){
                 queryClient.invalidateQueries({ queryKey:["seller"] });
                 setCoverBanner(res.data.image) 
                 
             }
         }
        }

    const convertFileToBase64 = async (file:File)=>{
        return new Promise( (resolve,reject)=>{
                 const reader = new FileReader();
                 reader.readAsDataURL(file);
                 reader.onload= ()=>resolve(reader.result);
                 reader.onerror= (error)=>reject(error);
        })
     }
     if(isLoading){
        return <p className='flex justify-center items-center text-center w-full h-[100vh] text-white text-5xl'>Loading...</p>
     }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            
            {/* --- Cover Banner Section --- */}
            <div className="relative w-full h-48 sm:h-56 bg-slate-800 overflow-hidden group">
                <img
                    src={coverBanner}
                    alt={` Cover Banner`}
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-100" 
                />
                <label 
                    htmlFor="banner-upload" 
                    className="absolute bottom-4 right-4 z-10 cursor-pointer text-xs font-medium 
                               bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white 
                               px-3 py-1.5 rounded-md transition-all 
                               opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                >
                    <Pencil className="w-3 h-3" /> Change Banner
                </label>
                <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
            </div>

            {/* --- Main Content Section --- */}
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                
                {/* --- HEADER SECTION [UI REDESIGNED] --- */}
                <div className="relative -mt-20 md:-mt-24 flex flex-col items-center">
                    {/* Avatar */}
                    <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full 
                                    bg-slate-800 p-2 shadow-xl ring-4 ring-slate-950 overflow-hidden group">
                        <img
                            src={profilePic}
                            alt={`${seller?.name} Avatar`}
                            className="absolute inset-0 w-full h-full object-cover rounded-full"
                        />
                        <label 
                            htmlFor="avatar-upload" 
                            className="absolute inset-0 flex items-center justify-center cursor-pointer 
                                       bg-black/60 text-white text-xs font-semibold opacity-0 
                                       group-hover:opacity-100 transition-opacity duration-300 rounded-full z-10"
                        >
                            <Pencil className="w-4 h-4" />
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>

                    {/* Shop Name */}
                    <h1 className="text-3xl font-bold text-white mt-4 text-center">
                        {seller?.name || "Your Seller Name"}
                    </h1>
                    
                    {/* Shop Bio */}
                    {seller?.shop?.bio && (
                        <p className="mt-1 text-base text-slate-400 text-center max-w-lg">
                            {seller.shop.bio}
                        </p>
                    )}

                    <hr className="w-1/3 my-4 border-slate-700/60" />

                    {/* Seller Details */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5" title="Seller Name">
                            <User size={14} className="text-blue-400" /> 
                            <span className="font-medium text-slate-300">{seller?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Email">
                            <Mail size={14} className="text-blue-400" /> 
                            <span>{seller?.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Phone">
                            <Phone size={14} className="text-blue-400" /> 
                            <span>{seller?.phone_number}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Country">
                            <Globe size={14} className="text-blue-400" /> 
                            <span>{seller?.country}</span>
                        </div>
                        {seller?.createdAt && (
                            <div className="flex items-center gap-1.5" title="Joined Date">
                                <Calendar size={14} className="text-blue-400" /> 
                                <span>Joined: {new Date(seller.createdAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- New Bento Grid Layout --- */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* --- CTA (Large) --- */}
                    <BentoCard 
                        href="/dashboard"
                        className="md:col-span-3 flex flex-col sm:flex-row sm:items-center sm:justify-between
                                   p-8 bg-blue-600 border-blue-500 text-white
                                   hover:bg-blue-700 hover:border-blue-500"
                    >
                        <div>
                            <h2 className="text-2xl font-bold">Go to Main Dashboard</h2>
                            <p className="text-sm text-blue-200 font-normal mt-1">View analytics, charts, and detailed reports.</p>
                        </div>
                        <ArrowRight className="w-8 h-8 mt-4 sm:mt-0 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                    </BentoCard>

                    {/* --- Primary Actions (Medium) --- */}
                    <BentoCard 
                        href="/dashboard/all-products"
                        className="md:col-span-2"
                    >
                        <div className="flex items-center justify-between">
                            <Package className="w-7 h-7 text-purple-400" />
                            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-all group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mt-3">Manage Products</h3>
                        <p className="text-sm text-slate-500 mt-1">Add, edit, or remove your listings.</p>
                    </BentoCard>

                    <BentoCard 
                        href="/dashboard/orders"
                    >
                        <div className="flex items-center justify-between">
                            <ShoppingBag className="w-7 h-7 text-cyan-400" />
                            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-all group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mt-3">View Orders</h3>
                        <p className="text-sm text-slate-500 mt-1">Check status and fulfill.</p>
                    </BentoCard>

                    <BentoCard 
                        href="/dashboard/create-product"
                    >
                        <div className="flex items-center justify-between">
                            <PlusCircle className="w-7 h-7 text-emerald-400" />
                            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-all group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mt-3">Create Product</h3>
                        <p className="text-sm text-slate-500 mt-1">Add a new item to your shop.</p>
                    </BentoCard>

                    {/* --- Quick Links (Small) --- */}
                    <BentoCard 
                        // href="/dashboard/settings/profile"
                        className="flex items-center justify-between"
                        onClick={()=>setIsModalOpen(true)}
                        
                    >
                        <div className="flex items-center gap-3"  >
                            <Store className="w-5 h-5 text-slate-400" />
                            <h3 className="text-base font-medium text-white">Edit Seller Details </h3>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white" />
                    </BentoCard>

                    <BentoCard 
                        href={`/shop/${shop?.id}`}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Eye className="w-5 h-5 text-slate-400" />
                            <h3 className="text-base font-medium text-white">View Shop</h3>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white" />
                    </BentoCard>
                    
                    <BentoCard 
                        onClick={handleLogout}
                        className="flex items-center justify-between"
                        isDestructive={true}
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-red-500" />
                            <h3 className="text-base font-medium text-red-500 group-hover:text-red-400">Logout</h3>
                        </div>
                    </BentoCard>

                </div>
            </div>
            <EditProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialUserData={seller} // Pass actual user data
            initialShopData={seller?.shop} // Pass actual shop data
            onUpdateSuccess={handleUpdateSuccess}
        />
        </div>
    );
};

// Standard App wrapper
const App = () => {
    return <SellerHomePage />;
}

export default App;