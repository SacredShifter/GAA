import { useState, useEffect, useCallback } from 'react';
import { performanceDetector, type QualityLevel, type QualitySettings } from '../utils/performanceDetector';

export const usePerformanceQuality = (initialQuality?: QualityLevel, adaptive: boolean = true) => {
  const [quality, setQuality] = useState<QualityLevel>(
    initialQuality || performanceDetector.getRecommendedQuality()
  );
  const [settings, setSettings] = useState<QualitySettings>(
    performanceDetector.getQualitySettings(quality)
  );
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    const newSettings = performanceDetector.getQualitySettings(quality);
    setSettings(newSettings);
  }, [quality]);

  const recordFrame = useCallback(() => {
    const currentFps = performanceDetector.recordFrame();
    setFps(Math.round(currentFps));
    return currentFps;
  }, []);

  const checkAndAdjustQuality = useCallback(() => {
    if (!adaptive) return;

    const downgrade = performanceDetector.shouldDowngradeQuality(quality);
    if (downgrade && downgrade !== quality) {
      setQuality(downgrade);
      performanceDetector.reset();
      return;
    }

    const upgrade = performanceDetector.shouldUpgradeQuality(quality);
    if (upgrade && upgrade !== quality) {
      setQuality(upgrade);
      performanceDetector.reset();
    }
  }, [quality, adaptive]);

  const setQualityManually = useCallback((newQuality: QualityLevel) => {
    setQuality(newQuality);
    performanceDetector.reset();
  }, []);

  return {
    quality,
    settings,
    fps,
    recordFrame,
    checkAndAdjustQuality,
    setQuality: setQualityManually,
  };
};
