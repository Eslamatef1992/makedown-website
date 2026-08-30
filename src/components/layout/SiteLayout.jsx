import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function SiteLayout({ children }) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background:
          'linear-gradient(180deg, #EFDEE8 0%, #E3C6D8 10%, #DEBBD1 20%, #DCBBD0 30%, #DFB9D0 40%, #DEB8CF 50%, #DEB8CF 60%, #DCB9CF 70%, #DDBAD0 80%, #E3C4D6 90%, #EEDDE7 100%)',
      }}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
