'use client';

import DashboardLayout from '@/components/DashboardLayout';
import InteractiveResumeTailor from '@/components/atsenseguard/InteractiveResumeTailor';

export default function TailorStudioPage() {
  return (
    <DashboardLayout fullWidth>
      <div className="py-1">
        <InteractiveResumeTailor />
      </div>
    </DashboardLayout>
  );
}
