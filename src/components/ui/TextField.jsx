import { forwardRef } from 'react';

const TextField = forwardRef(function TextField(
  { label, required = false, error, className = '', suffix, containerClassName = '', ...props },
  ref
) {
  return (
    <label className={`block ${containerClassName}`}>
      {label && (
        <span className="mb-2 block text-sm font-bold text-espresso-900">
          {label}
          {required && <span className="ms-1 text-carnation-600">*</span>}
        </span>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`w-full rounded-2xl border bg-white px-4 py-3 text-espresso-900 placeholder:text-carissma-300
            focus:outline-none focus:ring-2 focus:ring-carissma-400
            ${error ? 'border-carnation-500' : 'border-carissma-200'} ${suffix ? 'pe-11' : ''} ${className}`}
          {...props}
        />
        {suffix && <div className="absolute inset-y-0 end-3 flex items-center">{suffix}</div>}
      </div>
      {error && <span className="mt-1 block text-xs text-carnation-600">{error}</span>}
    </label>
  );
});

export default TextField;
