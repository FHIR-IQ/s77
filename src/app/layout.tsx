import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CQL Builder - Clinical Quality Language Code Generator',
  description:
    'Generate production-ready CQL (Clinical Quality Language) code using natural language. Based on HL7 CQL v1.5.3 specification and CQF Measures Implementation Guide.',
  keywords: [
    'CQL',
    'Clinical Quality Language',
    'HL7',
    'FHIR',
    'Healthcare',
    'Quality Measures',
    'eCQM',
    'Clinical Decision Support',
  ],
  authors: [{ name: 'CQL Builder' }],
  openGraph: {
    title: 'CQL Builder - AI-Powered Clinical Quality Language Generator',
    description:
      'Create production-ready CQL measures using natural language. Validated against HL7 specifications.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
