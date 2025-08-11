import { TopBar } from './TopBar';
import { Toaster } from '@/components/ui/sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground">
      <TopBar />
      <main className="flex-grow overflow-hidden">{children}</main>
      <Toaster />
    </div>
  );
}
