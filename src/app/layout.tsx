import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Document from "./pages/_document";

export const metadata: Metadata = {
  title: "Dormy",
  description: "ช่วยให้การจัดการหอพักเป็นเรื่องง่าย สะดวก และปลอดภัย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Document />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
