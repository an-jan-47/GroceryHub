// ... existing code ...
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
// ... existing code ...