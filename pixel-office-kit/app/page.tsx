import { PixelOffice } from '@/components/PixelOffice';
import { CrashBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <CrashBoundary>
      <PixelOffice />
    </CrashBoundary>
  );
}
