import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const heading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Campus BookShare - Peer-to-Peer Novel Rentals",
  description:
    "Rent, lend, and discover fiction, thrillers, romances, and classics with students on your campus.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${heading.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-charcoal font-sans antialiased selection:bg-amber/30">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FAF6EE",
              border: "1px solid #E7DFD1",
              color: "#2B2B2B",
              fontFamily: "var(--font-sans), sans-serif",
              borderRadius: "1rem",
            },
          }}
        />
        <Navbar />
        <main className="flex-1 w-full flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
