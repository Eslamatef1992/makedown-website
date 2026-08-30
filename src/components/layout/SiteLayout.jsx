import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function SiteLayout({ children }) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: 'linear-gradient(180deg, #FDEFF5 0%, #F9D9E9 45%, #F0AFD4 100%)' }}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
