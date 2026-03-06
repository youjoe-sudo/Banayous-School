import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-muted/50 py-6 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 نظام إدارة المدرسة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
