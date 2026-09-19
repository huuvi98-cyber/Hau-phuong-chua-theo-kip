/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WaveCanvas } from './components/WaveCanvas';
import { THEMES } from './data/themes';
import { WaveTheme, WaveConfig, WaveInteractionMode } from './types';

const DEFAULT_CONFIG: WaveConfig = {
  amplitude: 28,
  speed: 1.0,
  frequency: 1.3,
  surgePower: 1.1,
  waterLevel: 0.44,
  foamIntensity: 1.0,
  turbulence: 1.0,
  steepness: 0.8,
};

export default function App() {
  const [theme] = useState<WaveTheme>(THEMES[0]);
  const [config] = useState<WaveConfig>(DEFAULT_CONFIG);
  const [mode] = useState<WaveInteractionMode>('floating-buoy');

  // Text matching the user's reference image
  const [line1] = useState<string>('“HẬU PHƯƠNG”');
  const [line2] = useState<string>('CHƯA THEO KỊP');
  const [fontSize] = useState<number>(64);
  const [letterSpacing] = useState<number>(3);
  const [showDecorations] = useState<boolean>(false);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 flex items-center justify-center select-none">
      <main className="w-full h-full">
        <WaveCanvas
          theme={theme}
          config={config}
          mode={mode}
          line1={line1}
          line2={line2}
          fontSize={fontSize}
          letterSpacing={letterSpacing}
          showDecorations={showDecorations}
        />
      </main>
    </div>
  );
}
