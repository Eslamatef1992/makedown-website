export default function Button({ children, variant = 'primary', className = '', loading = false, ...props }) {
  const base = 'w-full rounded-full py-3.5 font-bold transition disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-carissma-400 text-white hover:bg-carissma-500',
    outline: 'border-2 border-carissma-400 text-carissma-500 hover:bg-carissma-50',
    soft: 'bg-carissma-100 text-carissma-400 cursor-not-allowed',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
