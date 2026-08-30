import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-6">
      <Link to="/" className="flex h-12 w-12 items-center justify-center">
        <img src="/logo-mark.png" alt="Make Down" className="h-full w-full object-contain" />
      </Link>
      <nav className="flex items-center gap-4 text-sm font-medium text-espresso-700">
        <Link to="/products" className="hover:text-carissma-600">Shop</Link>
        <Link to="/packages" className="hover:text-carissma-600">Packages</Link>
        <Link to="/play" className="hover:text-carissma-600">Play</Link>
        <Link to="/faq" className="hover:text-carissma-600">FAQ</Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="hover:text-carissma-600">{user?.fullName}</Link>
            <button onClick={logout} className="rounded-full bg-carissma-100 px-4 py-2 text-carissma-700">Log out</button>
          </>
        ) : (
          <Link to="/login" className="rounded-full bg-carissma-600 px-4 py-2 text-white">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
