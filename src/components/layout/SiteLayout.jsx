import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function SiteLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-linen-50">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
