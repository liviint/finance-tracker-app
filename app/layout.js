import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from '@next/third-parties/google'
import ReduxProvider from '@/store/ReduxProvider';
import ScrollToTop from "@/components/common/ScrollToTop";
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthRedirect from "@/components/MobileAppRediret/AuthRedirect";

const GA_ID = process.env.NEXT_PUBLIC_REACTGA  || '';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "300"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["700"], 
});

export const metadata = {
  title: "ZeniaHub | Reflect, Grow, Thrive",
  description: "ZeniaHub helps you reflect on your thoughts, track habits, and improve your daily life with simple journaling and habit tracking tools.",
  openGraph: {
    title: "ZeniaHub | Reflect, Grow, Thrive",
    description: "ZeniaHub helps you reflect on your thoughts, track habits, and improve your daily life with simple journaling and habit tracking tools.",
    type: "website",
    url: "https://zeniahub.com",
    images: [
      {
        url: "https://liviints.sgp1.cdn.digitaloceanspaces.com/static/public/zeniahub",
        width: 1200,
        height: 630,
        alt: "ZeniaHub - Reflect, Grow, Thrive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeniaHub | Reflect, Grow, Thrive",
    description: "ZeniaHub helps you reflect on your thoughts, track habits, and improve your daily life with simple journaling and habit tracking tools.",
    images: ["https://liviints.sgp1.cdn.digitaloceanspaces.com/static/public/zeniahub"],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#FF6B6B" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        className={`${poppins.variable} ${inter.variable} antialiased bg-offwhite text-charcoal`}
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <ReduxProvider>
            <ScrollToTop />
            <AuthRedirect />
            <Header />
              {children}
            <Footer />
          </ReduxProvider>
        </GoogleOAuthProvider>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
