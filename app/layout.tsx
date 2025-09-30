import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Risk Engine - Crypto Loan Portfolio Management',
  description: 'World-class crypto loan risk management and portfolio optimization',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}