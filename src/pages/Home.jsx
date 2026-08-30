import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-linen-50">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-carissma-600 font-bold text-white">MD</div>
        <nav className="flex items-center gap-4 text-sm font-medium text-espresso-700">
          <Link to="/products" className="hover:text-carissma-600">Shop</Link>
          <Link to="/packages" className="hover:text-carissma-600">Packages</Link>
          <Link to="/play" className="hover:text-carissma-600">Play</Link>
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

      <main className="mx-auto max-w-4xl px-8 py-24 text-center">
        <h1 className="text-4xl font-bold text-espresso-900 sm:text-5xl">Learn, play, and win with Make Down</h1>
        <p className="mx-auto mt-4 max-w-xl text-espresso-600">
          The quiz-game platform is being built module by module — auth is live, shop, packages, live
          multiplayer games, and profiles are coming up next.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register" className="rounded-2xl bg-carissma-600 px-6 py-3 font-semibold text-white hover:bg-carissma-700">
            Get started
          </Link>
          <Link to="/login" className="rounded-2xl border border-carissma-600 px-6 py-3 font-semibold text-carissma-600 hover:bg-carissma-50">
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
