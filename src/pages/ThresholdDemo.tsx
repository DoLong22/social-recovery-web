import React, { useState } from 'react';
import { EnhancedThresholdSelector } from '../components/ui/EnhancedThresholdSelector';

export const ThresholdDemo: React.FC = () => {
  const [threshold, setThreshold] = useState(2);
  const totalGuardians = 3; // Demo with 3 guardians

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <EnhancedThresholdSelector
          totalGuardians={totalGuardians}
          threshold={threshold}
          onThresholdChange={setThreshold}
        />
      </div>
    </div>
  );
};