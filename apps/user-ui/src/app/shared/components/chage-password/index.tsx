import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../../utils/axiosInstance';

const ChangePassword = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data: any) => {
    setError('');
    setMessage('');

    try {
      await axiosInstance.post('/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      // Assuming you want to set a success message and reset the form
      setMessage('Password updated successfully!');
      reset();

    } catch (err: any) {
      // Assuming the error response has a message property
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className='max-w-lg mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl shadow-slate-200/50 space-y-6'>
        <h3 className='text-xl font-bold mb-6 text-slate-900' >
                   Change Password
                </h3>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        {/* Current Password Field */}
        <div>
          <label className='block text-sm font-semibold text-slate-700'>
            Current Password
          </label>
          <input
            placeholder='Enter your current password'
            type='password'
            {...register('currentPassword', {
              required: 'Current Password is required',
            })}
            className='mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
          />
          {errors.currentPassword?.message && (
            <p className='text-red-500 text-xs mt-1'>
              {String(errors.currentPassword.message)}
            </p>
          )}
        </div>

        {/* New Password Field */}
        <div>
          <label
            htmlFor='newPassword'
            className='block text-sm font-semibold text-slate-700'
          >
            New Password
          </label>
          <input
            id='newPassword'
            type='password'
            {...register('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 8,
                message: 'Must be at least 8 characters',
              },
              validate: {
                hasLower: (value) =>
                  /[a-z]/.test(value) || 'Must include a lowercase letter',
                hasUpper: (value) =>
                  /[A-Z]/.test(value) || 'Must include an uppercase letter',
                hasNumber: (value) =>
                  /\d/.test(value) || 'Must include a number',
              },
            })}
            className='mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
            placeholder='Enter new password'
          />
          {errors.newPassword?.message && (
            <p className='text-red-500 text-xs mt-1'>
              {String(errors.newPassword.message)}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-semibold text-slate-700'
          >
            Confirm Password
          </label>
          <input
            id='confirmPassword'
            type='password'
            {...register('confirmPassword', {
              required: 'Confirm your password',
              validate: (value) =>
                value === watch('newPassword') || 'Passwords do not match',
            })}
            className='mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
            placeholder='Re-enter new password'
          />
          {errors.confirmPassword?.message && (
            <p className='text-red-500 text-xs mt-1'>
              {String(errors.confirmPassword.message)}
            </p>
          )}
        </div>
        <button
          disabled={isSubmitting}
          className='w-full !mt-6 font-semibold bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
      {error && <p className='text-red-600 bg-red-50 text-center text-sm font-medium p-3 rounded-lg'>{error}</p>}
      {message && <p className='text-green-700 bg-green-50 text-center text-sm font-medium p-3 rounded-lg'>{message}</p>}
    </div>
  );
};

export default ChangePassword;