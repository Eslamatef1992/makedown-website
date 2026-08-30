import { Link } from 'react-router-dom';
import SiteLayout from '../components/layout/SiteLayout';

export default function Home() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-8 py-24 text-center">
        <h1 className="text-4xl font-bold text-espresso-900 sm:text-5xl">Learn, play, and win with Make Down</h1>
        <p className="mx-auto mt-4 max-w-xl text-espresso-600">
          The quiz-game platform is being built module by module — auth, shop, packages, and CMS content are
          live, while live multiplayer games and checkout are coming up next.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register" className="rounded-2xl bg-carissma-600 px-6 py-3 font-semibold text-white hover:bg-carissma-700">
            Get started
          </Link>
          <Link to="/login" className="rounded-2xl border border-carissma-600 px-6 py-3 font-semibold text-carissma-600 hover:bg-carissma-50">
            Sign in
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
