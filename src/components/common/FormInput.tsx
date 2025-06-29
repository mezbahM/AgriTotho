import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, error, ...props }) => {
  return (
    <label className="flex flex-col min-w-40 flex-1">
      <p className="text-[#111b0e] text-base font-medium leading-normal pb-2">{label}</p>
      <input
        {...props}
        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111b0e] focus:outline-0 focus:ring-0 border border-[#d6e7d0] bg-[#f9fcf8] focus:border-[#d6e7d0] h-14 placeholder:text-[#111b0e] p-[15px] text-base font-normal leading-normal"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </label>
  );
};

export default FormInput; 