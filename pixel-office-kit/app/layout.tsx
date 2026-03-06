import type { Metadata } from 'next';
import 'nes-ui-react/dist/nes-ui.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nintendo Office Kit',
  description: '8-bit office command center for AI agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="nes-ui nes-ui-dark-mode">
      <body className="pixel-office-app">{children}</body>
    </html>
  );
}
