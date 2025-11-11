'use client'
import React, { useMemo, useState } from 'react'
import { ChevronRight, Wand, X, Plus, PlusCircle } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import ImagePlaceHolder from '../../../shared/components/image-placeholder';
import Input from '../../../../../../../packages/components/input/index'
import ColorSelector from '../../../../../../../packages/components/color-selector/index'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../utils/axiosInstance';
import Image from 'next/image';
import { enhancements } from '../../../utils/Ai.enhancement';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CustomSpecifications from '../../../../../../../packages/components/custom-specification';
import CustomProperties from '../../../../../../../packages/components/custom-properties';
// import RichTextEditor from '../../../../../../../packages/components/rich-text-editor';
import SizeSelector from '../../../../../../../packages/components/size-selector';
import Link from 'next/link';
// @ts-ignore
import { AxiosError } from 'axios'
import dynamic from 'next/dynamic';



type FormData = {
    email:string,
    password:string
    name:string,
    phone_number:number
    country:string
    
}

interface UploadedImage {fileId:string,file_url:string}

const page = () => {
    const RichTextEditor = useMemo(
        () =>
          dynamic(
            () => import('../../../../../../../packages/components/rich-text-editor'),
            {
              ssr: false, // This prevents it from running on the server
              loading: () => <p>Loading editor...</p>,
            }
          ),
        []
      );
    
    const [openImageModal,setOpenImageModal]= useState(false);
    const [isChanged,setIsChanged]= useState(true);
    const [selectedImage,setSelectedImage]= useState('');
    const [images,setImages]= useState<(UploadedImage| null)[]>([null]);
    const [loading,setLoading]= useState(false);
    const [pictureUploadingLoader,setPictureUploadingLoader]= useState(false)
    const [activeEffect,setActiveEffect]= useState<string>()
    const [processing,setProcessing]= useState(false);
    
    

   const router = useRouter();
    const {data,isLoading,isError}= useQuery({
        queryKey:['categories'],
        queryFn:async ()=>{
               try {
              const res = await axiosInstance.get('/product/get-categories');
              return res.data;
               } catch (error) {
                  console.log(error)
               }
        },
        staleTime:1000 *60 *50,
        retry:2
    })

    const queryClient = useQueryClient()

    const {data:discountCodes=[],isLoading:discountLoading}= useQuery({
     queryKey:["shop-discounts"],
     queryFn:async ()=>{
         const res = await axiosInstance.get("/product/get-discount-code")
         // @ts-ignore
         return res?.data?.discount_code || [];
     }
    })

    const {
        register,
        control,
        watch,
        setValue,
        handleSubmit,
        formState:{errors},
     } = useForm<any>();

      //   @ts-ignore
      const categories = data?.categories || [];
      //   @ts-ignore
      const subCategoriesData = data?.subCategories || {};


      const selectedCategory =  watch('category');
      const regularPrice = watch("regular_price");

      const subCategories= useMemo(()=>{
        return selectedCategory? subCategoriesData[selectedCategory] || [] :[]
      },[selectedCategory,subCategoriesData])

     const onSubmit = async (data:any)=>{
        try {
            setLoading(true);
          const res:any=  await axiosInstance.post("/product/create-product",data);

          if(res){
              router.push('/dashboard/all-products')
              toast.success('Product created successfully');   
            }
        } catch (error:any) {

            // console.log(error?.response?.data?.message);
           toast.error(error?.response?.data?.message || "some error occured while creating product! ")   
        } finally{
            setLoading(false)
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

    //  const handleImageChange= async ( fileBlob:File, file:(File| null| string),index:number)=>{
    //        if(!fileBlob)return;
    //        try {
    //            const fileName = await convertFileToBase64(fileBlob)
    //            const response:any = await axiosInstance.post("/product/upload-product-image",{fileName})
    //        startLoading("Uploading Image...!");
    //            setPictureUploadingLoader(true);
               
              
    //            const updatedImages = [...images];
    //            const uploadedImage= {
    //             fileId:response.data.fileId,
    //             file_url:response.data.file_url,
    //            }
    //            updatedImages[index]= uploadedImage;
    //            if(index === images.length-1 && images.length <8){
    //             updatedImages.push(null);
    //         }
    //         setImages(updatedImages);
    //         setValue("images",updatedImages);
           
    //        } catch (error) {
    //            console.log(error);
    //            toast.error("Image Upload failed")
    //        } finally{
    //         setPictureUploadingLoader(false)
    //         stopLoading();
    //         toast.success("Image uploaded successfully")

    //        }
    //  }
    const handleImageChange = async (fileBlob: File, file: (File | null | string), index: number) => {
        if (!fileBlob) return;
    
        // Define the async function that toast.promise will track.
        // It must return a promise.
        const uploadPromise = async () => {
            const fileName = await convertFileToBase64(fileBlob);
            // Return the axios promise directly
            return axiosInstance.post("/product/upload-product-image", { fileName });
        };
    
        setPictureUploadingLoader(true); // This is for your local placeholder UI, which is fine.
    
        try {
            // Wrap the entire async operation in toast.promise.
            // It will automatically handle showing the correct toast.
            const response: any = await toast.promise(
                uploadPromise(),
                {
                    loading: 'Uploading image...',
                    success: 'Image uploaded successfully!',
                    error: 'Image upload failed. Please try again.',
                }
            );
    
            // This code now ONLY runs on success, after the success toast has appeared.
            const updatedImages = [...images];
            const uploadedImage = {
                fileId: response.data.fileId,
                file_url: response.data.file_url,
            };
            updatedImages[index] = uploadedImage;
            if (index === images.length - 1 && images.length < 8) {
                updatedImages.push(null);
            }
            setImages(updatedImages);
            setValue("images", updatedImages);
    
        } catch (error) {
            // toast.promise automatically handles showing the error toast.
            // You can still log the detailed error for debugging if you want.
            console.error("Upload failed:", error);
            toast.error("Upload failed:  "+error)
        } finally {
            // The local placeholder loader can still be turned off here.
            setPictureUploadingLoader(false);
        }
    };

     const handleRemoveImage= async (index:number)=>{ 
        try {
         const updatedImages = [...images];
         const imageToDelete =updatedImages[index]?.fileId;
         if(imageToDelete && typeof imageToDelete === 'string'){
                const res =   await axiosInstance.delete("/product/delete-product-image/"+imageToDelete);
         }
         updatedImages.splice(index,1);
         if(!updatedImages.includes(null)&& updatedImages.length <8){
            updatedImages.push(null);
        }
        setImages(updatedImages);
        setValue("images",updatedImages)
        } catch (error) {
              console.log(error);
        }
   }
    
   const applyTransformation = async (transformation:string)=>{
    if(!selectedImage || processing){
        setProcessing(true);
        setActiveEffect(transformation)
        try {
              const transformUrl = `${selectedImage}?tr=${transformation}`;
              setSelectedImage(transformUrl);
        } catch (error) {
            console.log(error);
        }finally{
            setProcessing(false)
        }
    }
   }

     const handleSaveDraft = ()=>{} 
 
     
      
  return (
    <form className='w-full space-y-6' onSubmit={handleSubmit(onSubmit)} >
     
{/* Heading and Breadcrums */}
<div>
    <h2 className='text-3xl font-bold text-white' >Create Product</h2>
    <div className="flex items-center text-sm mt-2">
        <Link href="/dashboard" className='cursor-pointer text-blue-400 hover:text-blue-300' >
            Dashboard
        </Link>
        <ChevronRight size={16} className='text-slate-500 mx-1' />
        <span className="text-slate-400">Create Product</span>
    </div>
</div>

   {/* content Layout */}
   <div className="w-full flex flex-col lg:flex-row gap-8">
    {/* left side - Image upload section */}
    <div className="w-full lg:w-[35%] lg:flex-shrink-0 space-y-4">    
        <ImagePlaceHolder  size='765 x 850' small={false} defaultImage={images} index={0} onImageChange={handleImageChange}  setOpenImageModal={setOpenImageModal} onRemove={handleRemoveImage} setSelectedImage={setSelectedImage} pictureUploadingLoader={pictureUploadingLoader} />
        <div className="grid grid-cols-2 gap-4">
        {images?.slice(1).map((file:any,index)=>{ return <ImagePlaceHolder key={index} size='765 x 850' defaultImage={images} small={true} index={index+1} onImageChange={handleImageChange} setOpenImageModal={setOpenImageModal} onRemove={handleRemoveImage} setSelectedImage={setSelectedImage} pictureUploadingLoader={pictureUploadingLoader} />})}
    </div>
    </div>
    
    {/* Right side - form inputs */}
   <div className="flex-grow">
<div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
    {/* Column 1 */}
    <div className='w-full flex flex-col gap-y-6' >
<Input label='Product Title *' placeholder='Enter product title' {...register('title',{required:"Title is required"})} />
{errors.title && (<p className='text-red-500 text-xs mt-1' >{errors?.title?.message as string}</p>)}
  {/* textarea */}
  <div >
<Input type='textarea' rows={7 } cols={10} label='Short Description * (Max 150 words)'  placeholder='Enter product description for quick view' {...register('short_description',{required:"Description is required",validate:(value)=>{
    const wordCount = value.trim().split(/\s+/).length
    return (wordCount<=150) || `Description cannot exceed 150 words (Current: ${wordCount})`
    }})} />
{errors.short_description && (<p className='text-red-500 text-xs mt-1' >{errors?.short_description?.message as string}</p>)}
    </div>
    <div >
<Input  label='Tags *'  placeholder='e.g., apple, flagship, phone' {...register('tags',{required:"Separate related products tags with a comma"})} />
{errors.tags && (<p className='text-red-500 text-xs mt-1' >{errors?.tags?.message as string}</p>)}
    </div>
    <div >
<Input  label='Warranty *'  placeholder='e.g., 1 year, No Warranty' {...register('warranty',{required:"Warranty is required!"})} />
{errors.warranty && (<p className='text-red-500 text-xs mt-1' >{errors?.warranty?.message as string}</p>)}
    </div>

    <div >
<Input  label='Slug *'  placeholder='e.g., my-awesome-product' {...register('slug',{required:"Slug is required!",pattern:{value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,message:'Invalid slug format! Use lowercase letters, numbers, and hyphens.'},minLength:{value:3,message:'Slug must be at least 3 characters long.'},maxLength:{value:50,message:'Slug cannot be longer than 50 characters.'}})} />
{errors.slug && (<p className='text-red-500 text-xs mt-1' >{errors?.slug?.message as string}</p>)}
    </div>
    <div >
<Input  label='Brand (optional)'  placeholder='e.g., Apple' {...register('brand')} />
{errors.brand && (<p className='text-red-500 text-xs mt-1' >{errors?.brand?.message as string}</p>)}
    </div>

<div >
   <ColorSelector  control = {control} errors={errors} /> 
</div>
<div >
   <CustomSpecifications control={control} errors={errors} />
</div>

<div >
   <CustomProperties control={control} errors={errors} />
</div>
<div >
    <label className='block text-sm font-semibold text-slate-300 mb-1.5'>Cash on Delivery*</label>
    <select {...register("cash_on_delivery",{required:"Cash on Delivery is required"})} defaultValue="yes" className='w-full border border-slate-700 bg-slate-800/50 px-4 py-2.5 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' >
        <option value={'yes'} className='bg-slate-900 text-white'>Yes</option>
        <option value={'no'} className='bg-slate-900 text-white'>No</option>
    </select>
    {errors.cash_on_delivery && (<p className='text-red-500 text-xs mt-1' >{errors?.cash_on_delivery?.message as string}</p>)}
</div>

    </div>
    {/* Column 2 */}
    <div className='w-full flex flex-col gap-y-6' >
    <div >
      <label className='block text-sm font-semibold text-slate-300 mb-1.5'>Category *</label>
      {isLoading ?(<p className='text-slate-400'>Loading categories...</p>):(isError?(<p className='text-red-500' >Failed to load categories</p>):(<Controller name='category' control={control} rules={{required:"Category is required"}} render= {({field})=>(<select {...field} className='w-full border border-slate-700 bg-slate-800/50 px-4 py-2.5 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition' >
          <option value="" className='bg-slate-900 text-white'>Select Category</option>
          {categories.map((category:string)=><option value={category} key={category} className='bg-slate-900 text-white'> {category}</option>)}
      </select>)}  />))}
      {errors.category && (<p className='text-red-500 text-xs mt-1' >{errors?.category?.message as string}</p>)}
    </div>
{/* sub-categories */}
 <div >
    <label className='block text-sm font-semibold text-slate-300 mb-1.5'>Sub Category *</label>
    {isLoading ?(<p className='text-slate-400'>Loading subcategories...</p>):(isError?(<p className='text-red-500' >Failed to load subcategories</p>):(<Controller name='subcategory' control={control} rules={{required:"Subcategory is required"}} render= {({field})=>(<select {...field} disabled={!selectedCategory || subCategories.length === 0} className='w-full border border-slate-700 bg-slate-800/50 px-4 py-2.5 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed' >
        <option value="" className='bg-slate-900 text-white'>Select Subcategory</option>
        {subCategories.map((subcategory:string)=><option value={subcategory} key={subcategory} className='bg-slate-900 text-white'> {subcategory}</option>)}
    </select>)}  />))}
    {errors.subcategory && (<p className='text-red-500 text-xs mt-1' >{errors?.subcategory?.message as string}</p>)}
    </div>

<div >
<label className='block text-sm font-semibold text-slate-300 mb-1.5'>Detailed Description * (Min 100 words)</label>
<Controller name='detailed_description' control={control}  rules={{required:'Detailed description is required',validate:(value)=>{
    const wordCount = value.trim().split(/\s+/).length
    return (wordCount>=100) || `Description must be at least 100 words (Current: ${wordCount})`
    }}}  render={({field})=>{  return <><RichTextEditor value={field.value} onChange={field.onChange} /></>}}  />
    {errors.detailed_description && (<p className='text-red-500 text-xs mt-1' >{errors?.detailed_description?.message as string}</p>)}
</div>

<div >
   <Input label='Video URL (optional)' placeholder='https://www.youtube.com/embed/...' {...register('video_url',{
    pattern:{
        value:/^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
        message:"Invalid YouTube embed URL! Use format: https://www.youtube.com/embed/VIDEO_ID"
    }
   })}  /> 
   {errors.video_url && (<p className='text-red-500 text-xs mt-1' >{errors?.video_url?.message as string}</p>)}
</div>


<div >
   <Input label='Regular Price *' type="number" placeholder='$15' {...register('regularPrice',{
   required:"Regular price is required",
   valueAsNumber:true,
   min:{value:1,message:"Regular Price must be at least 1"},
   validate:(value)=>{
    if(isNaN(value)) return "Only numbers are allowed";
    return true;
   }
   })}  /> 
   {errors.regularPrice && (<p className='text-red-500 text-xs mt-1' >{errors?.regularPrice?.message as string}</p>)}
</div>

<div >
   <Input label='Sale Price *' type="number" placeholder='$12' {...register('sale_price',{
   required:"Sale price is required",
   valueAsNumber:true,
   min:{value:1,message:"Sale Price must be at least 1"},
   validate:(value)=>{
    if(isNaN(value)) return "Only numbers are allowed";
    if(regularPrice && value >= regularPrice){
        return "Sale Price must be less than Regular Price";
    }
    return true;
   }
   })}  /> 
   {errors.sale_price && (<p className='text-red-500 text-xs mt-1' >{errors?.sale_price?.message as string}</p>)}
</div>

<div >
    <Input
  label="Stock *"
  type="number"
  placeholder="100"
  {...register("stock", {
    required: "Stock is required!",
    valueAsNumber: true,
    min: { value: 0, message: "Stock cannot be negative" },
    max: {
      value: 10000,
      message: "Stock cannot exceed 10,000",
    },
    validate: (value) => {
      if (isNaN(value)) return "Only numbers are allowed!";
      if (!Number.isInteger(value))
        return "Stock must be a whole number!";
      return true;
    },
  })}
/>
{errors.stock && (<p className='text-red-500 text-xs mt-1' >{errors?.stock?.message as string}</p>)}
</div>

<div >
    <SizeSelector control={control} errors={errors}  />
</div>
<div >
{discountLoading?"":discountCodes.length==0?<label className='block text-sm font-semibold text-slate-300 mb-2'>No dicount code available (optional)</label>:<label className='block text-sm font-semibold text-slate-300 mb-2'>Select Discount Codes (optional)</label>}
{discountLoading?(<p className='text-slate-400' >Loading discount codes...</p>):(<div className='flex flex-wrap gap-2' >  
  {discountCodes?.length>0?discountCodes?.map((code:any)=>{  return <button key={code.id} type='button' className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${watch('discountCodes')?.includes(code.id) ?"bg-blue-600 text-white border-transparent" :"bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-slate-500" }`}  onClick={()=>{
    const currentSelection = watch("discountCodes") || [] ; 
    const updatedSelection = currentSelection?.includes(code.id) ? currentSelection.filter((id:string)=>id!==code.id):[...currentSelection,code.id] ;
        setValue("discountCodes",updatedSelection);
}} >
   
   {code?.public_name} ({code.discountValue}{code.discountType === "percentage" ? "%" : "$"})

</button> }):<button
          type='button'
          className='flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors mt-2'
          onClick={() => router.push('/dashboard/discount-codes')}
        >
          <PlusCircle size={20} /> Add discount codes
        </button>}
</div>)}
</div>




    </div>
   
</div>
   </div>
 
   </div>
   {openImageModal && (<div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4' >
    <div className='bg-slate-800 p-6 rounded-xl w-full max-w-lg shadow-2xl shadow-black/20 border border-slate-700' >
        <div className='flex justify-between items-center pb-3 mb-4 border-b border-slate-700' >
            <h2 className='text-lg font-semibold text-slate-100' >Enhance Product Image</h2>
            <X size={20} className='cursor-pointer text-slate-400 hover:text-white' onClick={()=>setOpenImageModal(!openImageModal)} />
        </div>
        <div className='w-full aspect-video rounded-lg overflow-hidden border border-slate-600 relative' > <Image 
    src={selectedImage} 
    alt='product-image' 
    fill // 2. Use the `fill` prop instead of width/height
    className='object-cover' // 3. Add `object-cover` for the desired fit
  /></div>
        {selectedImage && (<div className='mt-4 space-y-3' >
            <h3 className='text-slate-200 text-sm font-semibold' >AI Enhancements</h3>
            <div className='grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto' >
                {enhancements?.map(({label,effect})=>{  
                    return <button key={effect} className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${activeEffect===effect?"bg-blue-600 text-white":"bg-slate-700 text-slate-200 hover:bg-slate-600"}`}  onClick={()=>{ applyTransformation(effect) }} disabled={processing} ><Wand size={16}/>{label} </button>
                })}
            </div>
        </div>)}
    </div>
    </div>)}

   <div className="mt-8 flex justify-end gap-4">
    {isChanged && (<button type='button' onClick={handleSaveDraft} className='px-5 py-2.5 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors' >Save Draft</button>)}
    {isChanged && (<button type='submit' disabled={loading} className='px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed' >{loading? "Creating...":"Create Product"}</button>)}
    </div>

    </form>
  )
}

export default page