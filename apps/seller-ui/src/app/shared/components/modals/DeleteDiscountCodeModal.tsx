import { X } from 'lucide-react'
import React from 'react'

const DeleteDiscountCodeModal = ({discount,onClose,onConfirm}:{discount:any,onClose:()=>void,onConfirm?:any}) => {
  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4' >
    
      <div className='bg-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl shadow-black/20 border border-slate-700' >
      {/* Header */}
     <div className="flex justify-between items-center border-b border-slate-700 pb-4">
       <h3 className='text-lg font-semibold text-slate-100' >Delete Discount Code</h3>
       <button onClick={onClose} className='text-slate-400 hover:text-white transition-colors' >
        <X size={22} />
       </button>
     </div>
 {/* warning Message */}
 <p className='text-slate-300 mt-6 text-center leading-relaxed' >
    Are you sure you want to delete <span className='font-semibold text-white' >"{discount.public_name}"</span>?
    <br />
    <span className="text-sm text-slate-400">This action cannot be undone.</span>
   </p>
   {/* Action Button */}
   <div className="flex justify-end gap-4 mt-8">
   <button className='bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-slate-200 font-semibold transition-colors' onClick={onClose}  >
    Cancel
   </button>

   <button className='bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold transition-colors' onClick={onConfirm}  >
    Delete
   </button>
   </div>
        </div>
        
        </div>
  )
}

export default DeleteDiscountCodeModal;