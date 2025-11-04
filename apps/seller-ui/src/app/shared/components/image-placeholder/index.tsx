import { Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const ImagePlaceHolder = ({
  size,
  small,
  onImageChange,
  onRemove,
  defaultImage = [null],
  index = null,
  setOpenImageModal,
  setSelectedImage,
  pictureUploadingLoader,
}: {
  size: string;
  small?: boolean;
  onImageChange: (fileBlob: File, file: File | null | string, index: number) => void;
  onRemove: (index: number) => void;
  defaultImage?: ({ fileId: string; file_url: string } | null)[];
  index?: number | null;
  setOpenImageModal: (openImageModal: boolean) => void;
  setSelectedImage: (e: string) => void;
  pictureUploadingLoader: boolean;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultImage[index!]?.file_url as string
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file as File, URL.createObjectURL(file), index!);
    }
  };

  return (
    <div
      className={`relative w-full cursor-pointer bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl flex flex-col justify-center items-center transition-colors duration-300 hover:border-blue-500 hover:bg-slate-800 ${
        small ? 'h-44' : 'h-[450px]'
      }`}
    >
      <input
        type='file'
        accept='image/*'
        className='hidden'
        id={`image-upload-${index}`}
        onChange={handleFileChange}
       disabled={pictureUploadingLoader}
      />
      {defaultImage[index!] ? (
        <>
          <button
            type='button'
            disabled={pictureUploadingLoader}
            onClick={() => {
              onRemove?.(index!);
            }}
            className='absolute top-3 right-3 p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 shadow-lg transition-all duration-200 transform hover:scale-110 z-10'
          >
            <X size={16} />
          </button>
          <button
            type='button'
            disabled={pictureUploadingLoader}
            className='absolute top-3 right-14 p-2 rounded-full bg-blue-500/80 text-white hover:bg-blue-500 shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-110 z-10'
            onClick={() => {
              setSelectedImage(defaultImage[index!]?.file_url!);
              setOpenImageModal(true);
            }}
          >
            <WandSparkles size='16' />
          </button>
        </>
      ) : (
        <>
          <label
            htmlFor={`image-upload-${index}`}
            className='absolute top-3 right-3 p-2 rounded-full bg-slate-700/80 text-slate-200 hover:bg-slate-700 shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-110 z-10'
            >
            <Pencil  size={16} />
          </label>
        </>
      )}

      {defaultImage[index!] ? (
        <Image
          width={400}
          height={300}
          src={defaultImage[index!]?.file_url as string}
          alt='Uploaded'
          className='w-full h-full object-cover rounded-xl'
        />
      ) : (
        <>
          {/* NOTE: Preserving the user's original debug text as per the instructions. */}
          
          <p
            className={`font-semibold text-slate-400 ${
              small ? 'text-lg' : 'text-2xl'
            }`}
          >
            {size}
          </p>
          <p
            className={`text-slate-500 text-center ${
              small ? 'text-xs' : 'text-sm'
            } pt-2`}
          >
            Please choose an image <br /> according to the expected ratio{' '}
          </p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceHolder;