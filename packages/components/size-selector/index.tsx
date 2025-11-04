import { Controller } from "react-hook-form";

// Array of available sizes
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

// The SizeSelector component

const SizeSelector = ({ control, errors }: any) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-2">Sizes</label>
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              // Check if the current size is already in the form's value array
              const isSelected = (field.value || []).includes(size);

              return (
                <button
                  type="button"
                  key={size}
                  onClick={() => {
                    // When a button is clicked, update the form state
                    field.onChange(
                      isSelected
                        ? // If already selected, filter it out (deselect)
                          field.value.filter((s: string) => s !== size)
                        : // If not selected, add it to the array
                          [...(field.value || []), size]
                    );
                  }}
                  // Dynamically set class names based on selection status
                  className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all duration-200 border ${
                    isSelected
                      ? "bg-slate-700 text-white border-slate-600 font-semibold ring-2 ring-slate-700 ring-offset-2 ring-offset-slate-900"
                      : "bg-transparent text-slate-300 border-slate-600 hover:bg-slate-800 hover:border-slate-500"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      />
    </div>
  );
};

export default SizeSelector;