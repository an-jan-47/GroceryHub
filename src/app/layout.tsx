
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-12 flex items-center border-b">
            <SidebarTrigger className="ml-2" />
          </header>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
