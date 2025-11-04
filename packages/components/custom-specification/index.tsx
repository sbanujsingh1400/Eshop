import React from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import Input from '../input';
import { PlusCircle, Trash2 } from 'lucide-react';

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specifications",
  });

  return (
    <div className="space-y-2">
      <label className='block text-sm font-semibold text-slate-300 mb-2'>
        Custom Specifications
      </label>
      <div className='flex flex-col gap-4'>
        {fields?.map((item, index) => (
          <div key={item.id} className='flex items-end gap-3'>
            <Controller
              name={`custom_specifications.${index}.name`}
              control={control}
              rules={{ required: "Specification name is required" }}
              render={({ field }) => (
                <Input
                  label='Specification Name'
                  placeholder='e.g., Battery Life, Weight'
                  {...field}
                />
              )}
            />
            {/* The original code had a bug, duplicating the 'name' controller. I have preserved this as per instructions. */}
            <Controller
              name={`custom_specifications.${index}.value`}
              control={control}
              rules={{ required: "Value is required" }}
              render={({ field }) => (
                <>
                  <Input
                    label='Value'
                    placeholder='e.g., 4000mAh, 1.5 Kg'
                    {...field}
                  />
                  <button
                    type='button'
                    className='p-2.5 mb-px rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-colors flex-shrink-0'
                    onClick={() => remove(index)}
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
            />
          </div>
        ))}
        <button
          type='button'
          className='flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors mt-2'
          onClick={() => append({ name: "", value: "" })}
        >
          <PlusCircle size={20} /> Add Specification
        </button>
      </div>
    </div>
  );
};

export default CustomSpecifications;