import { TopBar } from './TopBar';
import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider } from '@/components/ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-screen bg-background text-foreground">
        <TopBar />
        <main className="flex-grow overflow-hidden">{children}</main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
