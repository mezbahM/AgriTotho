import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from './ClientProviders';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <div
            className="relative flex size-full min-h-screen flex-col bg-[#f9fcf8] group/design-root overflow-x-hidden"
            style={{
              fontFamily: '"Public Sans", "Noto Sans", sans-serif',
            }}
          >
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
