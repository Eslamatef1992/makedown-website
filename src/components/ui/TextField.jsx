export default function TextField({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-medium text-espresso-800">{label}</span>}
      <input
        className={`w-full rounded-2xl border px-4 py-3 text-espresso-900 placeholder:text-espresso-400
          focus:outline-none focus:ring-2 focus:ring-carissma-500
          ${error ? 'border-carnation-500' : 'border-linen-300'} ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-carnation-600">{error}</span>}
    </label>
  );
}
