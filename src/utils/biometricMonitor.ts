export interface BiometricReading {
  timestamp: number;
  heartRate?: number;
  hrvRMSSD?: number;
  coherenceScore: number;
  estimatedBrainwaveState: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'unknown';
  ppgQuality: number;
  deviceType: 'bluetooth' | 'webcam' | 'manual' | 'smartwatch';
}

export interface PPGSignal {
  timestamp: number;
  value: number;
}

export class BiometricMonitor {
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private ppgBuffer: PPGSignal[] = [];
  private isMonitoring = false;
  private animationFrame: number | null = null;
  private readonly BUFFER_SIZE = 300;
  private readonly SAMPLE_RATE = 30;
  private bluetoothDevice: BluetoothDevice | null = null;

  async initializeWebcamPPG(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user',
        },
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.play();

      this.canvas = document.createElement('canvas');
      this.canvas.width = 640;
      this.canvas.height = 480;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      return true;
    } catch (error) {
      console.error('Failed to initialize webcam PPG:', error);
      return false;
    }
  }

  async initializeBluetoothHRM(): Promise<boolean> {
    try {
      if (!navigator.bluetooth) {
        console.warn('Web Bluetooth not supported');
        return false;
      }

      this.bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
      });

      const server = await this.bluetoothDevice.gatt?.connect();
      if (!server) return false;

      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (value) {
          const heartRate = value.getUint8(1);
          this.processBluetoothHR(heartRate);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Bluetooth HRM:', error);
      return false;
    }
  }

  startMonitoring(onReading: (reading: BiometricReading) => void): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    const monitor = () => {
      if (!this.isMonitoring) return;

      if (this.videoElement && this.ctx && this.canvas) {
        this.captureWebcamFrame();
      }

      const reading = this.calculateBiometrics();
      if (reading) {
        onReading(reading);
      }

      this.animationFrame = requestAnimationFrame(monitor);
    };

    monitor();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    if (this.bluetoothDevice?.gatt?.connected) {
      this.bluetoothDevice.gatt.disconnect();
    }
  }

  private captureWebcamFrame(): void {
    if (!this.videoElement || !this.ctx || !this.canvas) return;

    this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

    const foreheadRegion = this.ctx.getImageData(
      this.canvas.width * 0.4,
      this.canvas.height * 0.2,
      this.canvas.width * 0.2,
      this.canvas.height * 0.1
    );

    let redSum = 0;
    for (let i = 0; i < foreheadRegion.data.length; i += 4) {
      redSum += foreheadRegion.data[i];
    }

    const avgRed = redSum / (foreheadRegion.data.length / 4);

    this.ppgBuffer.push({
      timestamp: Date.now(),
      value: avgRed,
    });

    if (this.ppgBuffer.length > this.BUFFER_SIZE) {
      this.ppgBuffer.shift();
    }
  }

  private processBluetoothHR(heartRate: number): void {
    this.ppgBuffer.push({
      timestamp: Date.now(),
      value: heartRate,
    });

    if (this.ppgBuffer.length > this.BUFFER_SIZE) {
      this.ppgBuffer.shift();
    }
  }

  private calculateBiometrics(): BiometricReading | null {
    if (this.ppgBuffer.length < 60) return null;

    const recentData = this.ppgBuffer.slice(-60);

    const heartRate = this.estimateHeartRate(recentData);
    const hrvRMSSD = this.calculateHRV(recentData);
    const coherenceScore = this.calculateCoherence(recentData);
    const brainwaveState = this.estimateBrainwaveState(coherenceScore, heartRate);
    const ppgQuality = this.assessSignalQuality(recentData);

    return {
      timestamp: Date.now(),
      heartRate,
      hrvRMSSD,
      coherenceScore,
      estimatedBrainwaveState: brainwaveState,
      ppgQuality,
      deviceType: this.bluetoothDevice ? 'bluetooth' : 'webcam',
    };
  }

  private estimateHeartRate(data: PPGSignal[]): number {
    const values = data.map((d) => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

    const peaks: number[] = [];
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1] && values[i] > mean) {
        peaks.push(i);
      }
    }

    if (peaks.length < 2) return 70;

    const peakIntervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      const interval = (data[peaks[i]].timestamp - data[peaks[i - 1]].timestamp) / 1000;
      if (interval > 0.4 && interval < 2.0) {
        peakIntervals.push(interval);
      }
    }

    if (peakIntervals.length === 0) return 70;

    const avgInterval = peakIntervals.reduce((sum, i) => sum + i, 0) / peakIntervals.length;
    const bpm = 60 / avgInterval;

    return Math.max(40, Math.min(200, Math.round(bpm)));
  }

  private calculateHRV(data: PPGSignal[]): number {
    const values = data.map((d) => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

    const peaks: number[] = [];
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1] && values[i] > mean) {
        peaks.push(data[i].timestamp);
      }
    }

    if (peaks.length < 3) return 30;

    const rrIntervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      rrIntervals.push(peaks[i] - peaks[i - 1]);
    }

    const successiveDiffs: number[] = [];
    for (let i = 1; i < rrIntervals.length; i++) {
      successiveDiffs.push(Math.pow(rrIntervals[i] - rrIntervals[i - 1], 2));
    }

    const meanSquaredDiff =
      successiveDiffs.reduce((sum, d) => sum + d, 0) / successiveDiffs.length;
    const rmssd = Math.sqrt(meanSquaredDiff);

    return Math.max(10, Math.min(200, rmssd));
  }

  private calculateCoherence(data: PPGSignal[]): number {
    const values = data.map((d) => d.value);

    const detrended = this.detrend(values);

    const fft = this.simpleFFT(detrended);

    const lowFreqPower = this.calculateBandPower(fft, 0.04, 0.15);
    const totalPower = this.calculateTotalPower(fft);

    const coherence = totalPower > 0 ? lowFreqPower / totalPower : 0;

    return Math.max(0, Math.min(1, coherence));
  }

  private detrend(values: number[]): number[] {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, v) => sum + v, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    return values.map((v, i) => v - (slope * i + intercept));
  }

  private simpleFFT(values: number[]): number[] {
    const n = values.length;
    const spectrum: number[] = new Array(Math.floor(n / 2)).fill(0);

    for (let k = 0; k < spectrum.length; k++) {
      let real = 0;
      let imag = 0;
      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        real += values[t] * Math.cos(angle);
        imag += values[t] * Math.sin(angle);
      }
      spectrum[k] = Math.sqrt(real * real + imag * imag) / n;
    }

    return spectrum;
  }

  private calculateBandPower(spectrum: number[], minFreq: number, maxFreq: number): number {
    const samplingRate = this.SAMPLE_RATE;
    const freqResolution = samplingRate / (2 * spectrum.length);

    const minIndex = Math.floor(minFreq / freqResolution);
    const maxIndex = Math.ceil(maxFreq / freqResolution);

    let power = 0;
    for (let i = minIndex; i <= maxIndex && i < spectrum.length; i++) {
      power += spectrum[i] * spectrum[i];
    }

    return power;
  }

  private calculateTotalPower(spectrum: number[]): number {
    return spectrum.reduce((sum, val) => sum + val * val, 0);
  }

  private estimateBrainwaveState(
    coherence: number,
    heartRate: number
  ): 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'unknown' {
    if (coherence > 0.7 && heartRate < 65) return 'alpha';
    if (coherence > 0.8) return 'theta';
    if (coherence < 0.3 && heartRate > 80) return 'beta';
    if (coherence > 0.9 && heartRate < 60) return 'delta';
    if (coherence < 0.2 && heartRate > 90) return 'gamma';

    return 'alpha';
  }

  private assessSignalQuality(data: PPGSignal[]): number {
    const values = data.map((d) => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const snr = mean / (stdDev + 1);

    const quality = Math.min(1, snr / 10);

    return Math.max(0, Math.min(1, quality));
  }

  destroy(): void {
    this.stopMonitoring();
    this.ppgBuffer = [];
    this.videoElement = null;
    this.canvas = null;
    this.ctx = null;
  }
}
