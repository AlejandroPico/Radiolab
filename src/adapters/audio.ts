import { sampleAudio } from './demo.ts';
import type { RadioState } from '../core/types.ts';
import { demoTime } from '../core/clock.ts';
// Scheduled PCM buffers keep synthesis independent of UI rendering, with explicit user activation.
export class DemoAudio {
  private context: AudioContext | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private next = 0;
  private output: GainNode | null = null;
  private nodes = new Set<AudioBufferSourceNode>();
  private state: RadioState;
  private simulationOffset = 0;
  constructor(state: RadioState) { this.state = state; }
  update(state: RadioState) {
    if(this.context&&state.paused!==this.state.paused)this.simulationOffset=demoTime()-this.context.currentTime;
    this.state = state;
    // Muting/pausing is immediate, including already scheduled buffers.
    if (this.context && this.output) this.output.gain.setTargetAtTime(state.muted || state.paused ? 0 : 1, this.context.currentTime, .01);
  }
  async start() {
    this.context ??= new AudioContext({ sampleRate: 48000 });
    await this.context.resume();
    this.simulationOffset=demoTime()-this.context.currentTime;
    this.output ??= this.context.createGain();
    this.output.connect(this.context.destination);
    this.output.gain.value = this.state.muted || this.state.paused ? 0 : 1;
    this.next = this.context.currentTime + .02;
    this.fill();
    this.timer ??= setInterval(() => this.fill(), 40);
  }
  private fill() {
    if (!this.context || !this.output || this.context.state !== 'running') return;
    if (this.next < this.context.currentTime) this.next = this.context.currentTime + .01;
    while (this.next < this.context.currentTime + .15) {
      const length = Math.round(this.context.sampleRate * .08);
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = sampleAudio(this.state, this.simulationOffset + this.next + i / this.context.sampleRate);
      const node = this.context.createBufferSource(); node.buffer = buffer; node.connect(this.output);
      this.nodes.add(node); node.onended = () => { this.nodes.delete(node); node.disconnect(); };
      node.start(this.next); this.next += length / this.context.sampleRate;
    }
  }
  async close() {
    if (this.timer) clearInterval(this.timer); this.timer = null;
    this.nodes.forEach(n => { n.stop(); n.disconnect(); }); this.nodes.clear();
    this.output?.disconnect(); this.output = null;
    await this.context?.close(); this.context = null;
  }
}
