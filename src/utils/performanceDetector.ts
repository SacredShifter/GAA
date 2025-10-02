export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

export interface DeviceCapabilities {
  gpu: 'low' | 'medium' | 'high';
  memory: number;
  cores: number;
  isMobile: boolean;
  pixelRatio: number;
  maxTextureSize: number;
}

export interface QualitySettings {
  particleCount: number;
  bloomEnabled: boolean;
  glowEnabled: boolean;
  chromaticAberration: boolean;
  motionBlur: boolean;
  antialias: boolean;
  shadowsEnabled: boolean;
  pixelRatio: number;
  maxLights: number;
  postProcessing: boolean;
}

export class PerformanceDetector {
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private capabilities: DeviceCapabilities | null = null;
  private fpsHistory: number[] = [];
  private lastFrameTime: number = performance.now();

  detectCapabilities(): DeviceCapabilities {
    if (this.capabilities) return this.capabilities;

    const canvas = document.createElement('canvas');
    this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;

    let gpuTier: 'low' | 'medium' | 'high' = 'medium';

    if (this.gl) {
      const debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = this.gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = this.gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);

        if (
          renderer.includes('Apple') ||
          renderer.includes('AMD') ||
          renderer.includes('NVIDIA') ||
          renderer.includes('Radeon') ||
          renderer.includes('GeForce')
        ) {
          if (renderer.includes('RTX') || renderer.includes('RX 6') || renderer.includes('M1') || renderer.includes('M2')) {
            gpuTier = 'high';
          } else if (renderer.includes('GTX') || renderer.includes('RX 5')) {
            gpuTier = 'medium';
          } else {
            gpuTier = 'low';
          }
        }
      }

      const maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);

      if (isMobile) {
        gpuTier = memory > 4 ? 'medium' : 'low';
      } else {
        if (cores >= 8 && memory >= 8) {
          gpuTier = gpuTier === 'low' ? 'medium' : 'high';
        }
      }

      this.capabilities = {
        gpu: gpuTier,
        memory,
        cores,
        isMobile,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        maxTextureSize,
      };
    } else {
      this.capabilities = {
        gpu: 'low',
        memory,
        cores,
        isMobile,
        pixelRatio: 1,
        maxTextureSize: 2048,
      };
    }

    return this.capabilities;
  }

  getRecommendedQuality(): QualityLevel {
    const caps = this.detectCapabilities();

    if (caps.isMobile) {
      return caps.memory > 4 ? 'medium' : 'low';
    }

    if (caps.gpu === 'high' && caps.memory >= 8 && caps.cores >= 8) {
      return 'ultra';
    } else if (caps.gpu === 'high' || (caps.gpu === 'medium' && caps.memory >= 8)) {
      return 'high';
    } else if (caps.gpu === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  getQualitySettings(quality: QualityLevel): QualitySettings {
    const caps = this.detectCapabilities();

    const presets: Record<QualityLevel, QualitySettings> = {
      low: {
        particleCount: 1000,
        bloomEnabled: false,
        glowEnabled: true,
        chromaticAberration: false,
        motionBlur: false,
        antialias: false,
        shadowsEnabled: false,
        pixelRatio: 1,
        maxLights: 2,
        postProcessing: false,
      },
      medium: {
        particleCount: 3000,
        bloomEnabled: true,
        glowEnabled: true,
        chromaticAberration: false,
        motionBlur: false,
        antialias: true,
        shadowsEnabled: false,
        pixelRatio: Math.min(caps.pixelRatio, 1.5),
        maxLights: 4,
        postProcessing: true,
      },
      high: {
        particleCount: 5000,
        bloomEnabled: true,
        glowEnabled: true,
        chromaticAberration: true,
        motionBlur: false,
        antialias: true,
        shadowsEnabled: true,
        pixelRatio: Math.min(caps.pixelRatio, 2),
        maxLights: 6,
        postProcessing: true,
      },
      ultra: {
        particleCount: 10000,
        bloomEnabled: true,
        glowEnabled: true,
        chromaticAberration: true,
        motionBlur: true,
        antialias: true,
        shadowsEnabled: true,
        pixelRatio: caps.pixelRatio,
        maxLights: 8,
        postProcessing: true,
      },
    };

    return presets[quality];
  }

  recordFrame(): number {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    const fps = 1000 / delta;

    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    this.lastFrameTime = now;
    return fps;
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  shouldDowngradeQuality(currentQuality: QualityLevel): QualityLevel | null {
    const avgFps = this.getAverageFPS();

    if (avgFps < 30 && currentQuality !== 'low') {
      const levels: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];
      const currentIndex = levels.indexOf(currentQuality);
      return levels[Math.max(0, currentIndex - 1)];
    }

    if (avgFps < 45 && currentQuality === 'ultra') {
      return 'high';
    }

    return null;
  }

  shouldUpgradeQuality(currentQuality: QualityLevel): QualityLevel | null {
    const avgFps = this.getAverageFPS();

    if (avgFps > 55 && currentQuality !== 'ultra') {
      const levels: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];
      const currentIndex = levels.indexOf(currentQuality);
      const recommended = this.getRecommendedQuality();
      const recommendedIndex = levels.indexOf(recommended);
      const nextIndex = currentIndex + 1;

      if (nextIndex <= recommendedIndex) {
        return levels[nextIndex];
      }
    }

    return null;
  }

  reset() {
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
  }
}

export const performanceDetector = new PerformanceDetector();
