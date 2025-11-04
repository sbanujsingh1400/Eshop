'use client';

import React, { useState } from 'react';
import { X, User, Store } from 'lucide-react';
import ProfileDetailsForm from './ProfileDetailsForm'; // Assuming these are in the same folder or path
import ShopDetailsForm from './ShopDetailsForm';     // as EditProfileModal.tsx

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserData: {
    id: string;
    name: string;
    email: string;
    // Add other user profile fields here
  };
  initialShopData: {
    id: string;
    name: string;
    description: string; // Assuming a description for the shop
    // Add other shop profile fields here
  };
  onUpdateSuccess: () => void; // Callback to refresh data after update
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialUserData,
  initialShopData,
  onUpdateSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'shop' >('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 w-full max-w-2xl transform transition-all duration-300 scale-95 animate-fade-in-up">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors 
                        ${activeTab === 'profile' 
                          ? 'text-blue-400 border-b-2 border-slate-500' 
                          : 'text-slate-400 hover:text-white'
                        }`}
            onClick={() => setActiveTab('profile')}
          >
            <User color='white' size={18} /> <p className='text-white' >Profile Details</p>
          </button>
          {/* <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors 
                        ${activeTab === 'shop' 
                          ? 'text-blue-400 border-b-2 border-blue-500' 
                          : 'text-slate-400 hover:text-white'
                        }`}
            onClick={() => setActiveTab('shop')}
          >
            <Store size={18} /> Shop Details
          </button> */}
        </div>

        {/* Modal Content - Forms */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileDetailsForm 
              initialData={initialUserData} 
              onClose={onClose}
              onUpdateSuccess={onUpdateSuccess}
            />
          )}
          {/* {activeTab === 'shop' && (
            <ShopDetailsForm 
              initialData={initialShopData} 
              onClose={onClose}
              onUpdateSuccess={onUpdateSuccess}
            />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;