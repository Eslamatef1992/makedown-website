export default function Button({ children, variant = 'primary', className = '', loading = false, ...props }) {
  const base = 'w-full rounded-2xl py-3.5 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-carissma-600 text-white hover:bg-carissma-700',
    outline: 'border border-carissma-600 text-carissma-600 hover:bg-carissma-50',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
