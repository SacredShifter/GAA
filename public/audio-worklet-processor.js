class PrecisionOscillatorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phase = 0;
    this.frequency = 432;
    this.waveType = 'sine';
    this.gain = 0.5;
    this.detuneCents = 0;
    this.isActive = false;

    this.port.onmessage = (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'start':
          this.frequency = data.frequency || 432;
          this.waveType = data.waveType || 'sine';
          this.gain = data.gain || 0.5;
          this.phase = 0;
          this.isActive = true;
          break;

        case 'stop':
          this.isActive = false;
          this.phase = 0;
          break;

        case 'updateFrequency':
          this.frequency = data.frequency;
          break;

        case 'updateGain':
          this.gain = Math.max(0, Math.min(0.5, data.gain));
          break;

        case 'updateDetune':
          this.detuneCents = data.cents;
          break;

        case 'resetPhase':
          this.phase = 0;
          break;

        case 'updateWaveType':
          this.waveType = data.waveType;
          break;
      }
    };
  }

  generateSample(phase) {
    switch (this.waveType) {
      case 'sine':
        return Math.sin(phase);
      case 'triangle':
        return 2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1;
      case 'square':
        return phase % (2 * Math.PI) < Math.PI ? 1 : -1;
      case 'sawtooth':
        return 2 * ((phase / (2 * Math.PI)) % 1) - 1;
      default:
        return Math.sin(phase);
    }
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];

    if (!this.isActive || !output || output.length === 0) {
      return true;
    }

    const detuneFactor = Math.pow(2, this.detuneCents / 1200);
    const adjustedFrequency = this.frequency * detuneFactor;
    const phaseIncrement = (2 * Math.PI * adjustedFrequency) / sampleRate;

    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];

      for (let i = 0; i < outputChannel.length; i++) {
        outputChannel[i] = this.generateSample(this.phase) * this.gain;
        this.phase += phaseIncrement;

        if (this.phase >= 2 * Math.PI) {
          this.phase -= 2 * Math.PI;
        }
      }
    }

    return true;
  }
}

registerProcessor('precision-oscillator-processor', PrecisionOscillatorProcessor);
