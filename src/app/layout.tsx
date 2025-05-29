// app/layout.tsx
import "./globals.css"; // ensure Tailwind is loaded
import Providers from "@/components/Providers";
import React from "react";

export const metadata = {
  title: "Islamic Da'wa Academy",
  description: "Even Semester Examination Results 2025 May",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
