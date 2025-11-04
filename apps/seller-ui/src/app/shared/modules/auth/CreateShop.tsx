import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react'
import { useForm } from 'react-hook-form';
import { shopCategories } from '../../../utils/categories';

const CreateShop = ({ sellerId, setActiveStep }: { sellerId: string, setActiveStep: (step: number) => void }) => {

    // setActiveStep(1)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const shopCreateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/create-shop`,data,{withCredentials:true});
            return response.data;
        },
        onSuccess: () => {
            setActiveStep(3);
        }
    })


    const onSubmit = async (data: any) => {

        const shopData = { ...data, sellerId };
        shopCreateMutation.mutate(shopData);
    }

     const countWords = (text:string)=>text.trim().split(/\s+/).length;


    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} >

                <h3 className='text-2xl font-semibold text-center mb-4' >
                    Setup new shop
                </h3>
                {/* Name */}
                <label className='block text-gray-700 mb-1'>Name*</label>
                <input
                    type="text"
                    placeholder="Shop name"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register("name", {
                        required: "Name is required",
                    })}
                />
                {errors.name && (
                    <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
                )}

                {/* Bio */}
                <label className='block text-gray-700 mb-1'>Bio (Max 100 words)</label>
                <input
                    placeholder="Shop bio"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    
                    {...register("bio",{
                        required:"Bio is required",
                        validate: (value)=>{
                                return countWords(value )<=100 || "Bio can't exceed 100 words,"
                        }
                    })}
                />
                {errors.bio && (
                    <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
                )}

                {/* Address */}
                <label className='block text-gray-700 mb-1'>Address*</label>
                <input
                    type="text"
                    placeholder="Shop address"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register("address", {
                        required: "Address is required",
                    })}
                />
                {errors.address && (
                    <p className="text-red-500 text-sm">{String(errors.address.message)}</p>
                )}

                {/* Opening Hours */}
                <label className='block text-gray-700 mb-1'>Opening Hours*</label>
                <input
                    type="text"
                    placeholder="e.g. Mon-Fri 10AM - 8PM"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register("opening_hours", {
                        required: "Opening hours is required",
                    })}
                />
                {errors.opening_hours && (
                    <p className="text-red-500 text-sm">{String(errors.opening_hours.message)}</p>
                )}

                {/* Website */}
                <label className='block text-gray-700 mb-1'>Website</label>
                <input
                    type="url"
                    placeholder="https://example.com"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register("website", {
                        pattern: {
                            value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\/\w .-]*)*\/?$/,
                            message: "Enter a valid website URL",
                        },
                    })}
                />
                {errors.website && (
                    <p className="text-red-500 text-sm">{String(errors.website.message)}</p>
                )}

                {/* Category */}
                <label className='block text-gray-700 mb-1'>Category*</label>
                <select
                    className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
                    {...register("category", {
                        required: "Category is required",
                    })}
                >
                    <option value="" >Shop category</option>
                    {shopCategories.map(val=><option key={val.value} value={val.value} >{val.label}</option>)}


                </select>
                {errors.category && (
                    <p className="text-red-500 text-sm">{String(errors.category.message)}</p>
                )}

            
<button className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg '  >Create</button>

            </form>

        </div>
    )
}

export default CreateShop