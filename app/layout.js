import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Meter Manual DataHub | মিটার ম্যানুয়াল ডাটাহাব',
  description: 'Search and find meter manuals, specifications, display parameters and serial number information for all types of energy meters.',
  keywords: 'meter manual, energy meter, specification, display manual, serial number',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
