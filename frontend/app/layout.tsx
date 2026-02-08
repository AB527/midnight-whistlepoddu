import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Whistle Poddu - Anonymous Workplace Reviews',
  description: 'Share authentic workplace reviews anonymously with Zero-Knowledge proof verification. Your identity stays protected while your voice is heard.',
  keywords: ['anonymous reviews', 'workplace reviews', 'zero-knowledge proof', 'whistleblower', 'employee feedback'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
