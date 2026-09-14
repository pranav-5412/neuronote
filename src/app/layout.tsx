import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./phase-two.css";
import "./auth.css";
export const metadata: Metadata = {
  title: {
    default: "NeuroNote — Your personal second brain",
    template: "%s · NeuroNote",
  },
  description:
    "A little curiosity. A connected mind. Your personal study workspace.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
