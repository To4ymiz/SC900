import {
  AulaSC900ProController,
  PollingRate,
  LightingEffect,
  LightingEffectLabels,
  DpiLedEffect,
  type LightingConfig,
} from './AulaSC900ProController';

// State configuration
interface AppState {
  activeStageIndex: number; // 0-based: 0 to 5
  dpiStages: number[];
  pollingRate: PollingRate;
  lightingEffect: LightingEffect;
  dpiLedEffect: DpiLedEffect;
  brightness: number;
  debounceMs: number;
  sleepSeconds: number;
}

const STAGE_COLORS = [
  { name: 'Red', hex: '#ff453a' },
  { name: 'Green', hex: '#30d158' },
  { name: 'Blue', hex: '#0a84ff' },
  { name: 'Yellow', hex: '#ffd60a' },
  { name: 'Cyan', hex: '#64d2ff' },
  { name: 'Purple', hex: '#bf5af2' },
];

const DPI_SCALE_POINTS = [50, 400, 800, 1600, 3200, 6400, 26000];

export function sliderPosToDpi(val: number): number {
  val = Math.max(0, Math.min(600, Number(val)));
  if (val <= 0) return 50;
  if (val >= 600) return 26000;
  const segment = Math.min(5, Math.floor(val / 100));
  const fraction = (val - segment * 100) / 100;
  const startDpi = DPI_SCALE_POINTS[segment];
  const endDpi = DPI_SCALE_POINTS[segment + 1];
  let dpi = startDpi + fraction * (endDpi - startDpi);
  dpi = Math.round(dpi / 50) * 50;
  return Math.max(50, Math.min(26000, dpi));
}

export function dpiToSliderPos(dpi: number): number {
  dpi = Math.max(50, Math.min(26000, Number(dpi)));
  for (let i = 0; i < DPI_SCALE_POINTS.length - 1; i++) {
    const start = DPI_SCALE_POINTS[i];
    const end = DPI_SCALE_POINTS[i + 1];
    if (dpi <= end) {
      const fraction = (dpi - start) / (end - start);
      return Math.round((i + fraction) * 1000) / 10;
    }
  }
  return 600;
}

const LIGHTING_DESCRIPTIONS: Record<LightingEffect, string> = {
  [LightingEffect.Off]: 'All chassis RGB lighting turned off.',
  [LightingEffect.BatteryWarningOnly]: 'LEDs illuminate only when battery is critically low.',
  [LightingEffect.BatteryStatus]: 'Glow color reflects live battery level (Green/Amber/Red).',
  [LightingEffect.ConnectionAndPolling]: 'Pulse pattern indicates connection state and report rate.',
  [LightingEffect.FlowWater]: 'Smooth flowing neon wave across the chassis underglow.',
  [LightingEffect.Ambilight]: 'Dynamic RGB rainbow prism ambient illumination.',
};

class MouseStudioApp {
  private controller: AulaSC900ProController;
  private state: AppState = {
    activeStageIndex: 2, // Stage 3 (1600 DPI)
    dpiStages: [400, 800, 1600, 3200, 6400, 26000],
    pollingRate: PollingRate.Rate1000Hz,
    lightingEffect: LightingEffect.Ambilight,
    dpiLedEffect: DpiLedEffect.Steady,
    brightness: 1,
    debounceMs: 8,
    sleepSeconds: 60,
  };

  private batteryPollInterval: number | null = null;

  constructor() {
    this.controller = new AulaSC900ProController();
    this.init();
  }

  private init(): void {
    this.setupTheme();
    this.renderDpiStages();
    this.renderLightingGrid();
    this.bindEvents();
    this.updateVisualizer();

    // Default to simulation mode initially so user can test and enjoy immediately
    this.controller.enableSimulation();
    this.updateConnectionUI();
  }

  // --- Theme Management ---
  private setupTheme(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'dark'; // Dark default for pro audio/gaming tools
    document.documentElement.setAttribute('data-theme', initialTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    toggleBtn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
    });
  }

  // --- UI Renderers ---
  private renderDpiStages(): void {
    const container = document.getElementById('dpi-stages-container');
    if (!container) return;

    container.innerHTML = '';
    this.state.dpiStages.forEach((dpi, idx) => {
      const color = STAGE_COLORS[idx % STAGE_COLORS.length];
      const pill = document.createElement('div');
      pill.className = `dpi-stage-pill ${idx === this.state.activeStageIndex ? 'active' : ''}`;
      pill.style.setProperty('--stage-color', color.hex);

      pill.innerHTML = `
        <div class="stage-dot"></div>
        <div class="stage-name">Stage ${idx + 1}</div>
        <div class="stage-val">${dpi.toLocaleString()}</div>
      `;

      pill.addEventListener('click', () => this.setActiveDpiStage(idx));
      container.appendChild(pill);
    });

    this.updateDpiSliderDisplay();
  }

  private renderLightingGrid(): void {
    const container = document.getElementById('lighting-modes-container');
    if (!container) return;

    container.innerHTML = '';
    const modes = [
      LightingEffect.Ambilight,
      LightingEffect.FlowWater,
      LightingEffect.BatteryStatus,
      LightingEffect.ConnectionAndPolling,
      LightingEffect.BatteryWarningOnly,
      LightingEffect.Off,
    ];

    modes.forEach((mode) => {
      const card = document.createElement('div');
      card.className = `light-card ${mode === this.state.lightingEffect ? 'active' : ''}`;
      card.innerHTML = `
        <div class="light-card-title">${LightingEffectLabels[mode]}</div>
        <div class="light-card-desc">${LIGHTING_DESCRIPTIONS[mode]}</div>
      `;

      card.addEventListener('click', () => this.setLightingMode(mode));
      container.appendChild(card);
    });
  }

  // --- Actions & WebHID Dispatch ---
  private async setActiveDpiStage(stageIndex: number): Promise<void> {
    this.state.activeStageIndex = stageIndex;
    this.renderDpiStages();
    this.updateVisualizer();

    if (this.controller.isConnected) {
      try {
        await this.controller.setDpiStage(stageIndex, this.state.dpiStages[stageIndex]);
        await this.controller.setActiveDpiStage(stageIndex);
        this.showToast(`Active DPI switched to Stage ${stageIndex + 1} (${this.state.dpiStages[stageIndex]} DPI)`);
      } catch (err: any) {
        console.error('Error switching active DPI stage:', err);
      }
    }
  }

  private async onDpiSliderChange(newDpi: number): Promise<void> {
    const idx = this.state.activeStageIndex;
    this.state.dpiStages[idx] = newDpi;
    this.renderDpiStages();
    this.updateVisualizer();

    if (this.controller.isConnected) {
      try {
        await this.controller.setDpiStage(idx, newDpi);
      } catch (err: any) {
        console.error('Error setting DPI stage:', err);
      }
    }
  }

  private async setPollingRate(rate: PollingRate): Promise<void> {
    this.state.pollingRate = rate;

    const buttons = document.querySelectorAll('#polling-rate-group .chip-btn');
    buttons.forEach((btn) => {
      const btnRate = parseInt(btn.getAttribute('data-rate') || '3');
      btn.classList.toggle('active', btnRate === rate);
    });

    const rateLabels = ['125 Hz', '250 Hz', '500 Hz', '1000 Hz', '2000 Hz', '4000 Hz', '8000 Hz'];
    const quickRate = document.getElementById('quick-rate');
    if (quickRate) quickRate.textContent = rateLabels[rate];

    if (this.controller.isConnected) {
      try {
        await this.controller.setPollingRate(rate);
        this.showToast(`Polling Rate set to ${rateLabels[rate]}`);
      } catch (err: any) {
        console.error('Error setting polling rate:', err);
      }
    }
  }

  private async setLightingMode(mode: LightingEffect): Promise<void> {
    this.state.lightingEffect = mode;
    this.renderLightingGrid();
    this.updateVisualizer();

    if (this.controller.isConnected) {
      try {
        await this.controller.setLighting({
          activeDpiStage: this.state.activeStageIndex,
          lightEffect: mode,
          dpiLedEffect: this.state.dpiLedEffect,
          brightness: this.state.brightness,
        });
        this.showToast(`Lighting effect: ${LightingEffectLabels[mode]}`);
      } catch (err: any) {
        console.error('Error setting lighting:', err);
      }
    }
  }

  private async setDpiLedEffect(effect: DpiLedEffect): Promise<void> {
    this.state.dpiLedEffect = effect;

    const buttons = document.querySelectorAll('#dpi-led-effect-group .chip-btn');
    buttons.forEach((btn) => {
      const val = parseInt(btn.getAttribute('data-val') || '0');
      btn.classList.toggle('active', val === effect);
    });

    const labels = ['Steady', 'Breathing', 'Off'];
    const lbl = document.getElementById('dpi-led-effect-label');
    if (lbl) lbl.textContent = labels[effect];

    if (this.controller.isConnected) {
      try {
        await this.controller.setLighting({
          activeDpiStage: this.state.activeStageIndex,
          lightEffect: this.state.lightingEffect,
          dpiLedEffect: effect,
          brightness: this.state.brightness,
        });
      } catch (err: any) {
        console.error('Error setting DPI LED:', err);
      }
    }
  }

  // --- Visualizer & SVG Sync ---
  private updateVisualizer(): void {
    const activeDpi = this.state.dpiStages[this.state.activeStageIndex];
    const color = STAGE_COLORS[this.state.activeStageIndex % STAGE_COLORS.length];

    const quickDpi = document.getElementById('quick-dpi');
    if (quickDpi) quickDpi.textContent = activeDpi.toLocaleString();

    // Update DPI palm LED color
    const ledDot = document.getElementById('mouse-dpi-led');
    if (ledDot) {
      ledDot.setAttribute('fill', color.hex);
    }

    // Update Underglow Strip
    const rgbStrip = document.getElementById('mouse-rgb-strip');
    if (rgbStrip) {
      if (this.state.lightingEffect === LightingEffect.Off) {
        rgbStrip.style.opacity = '0.08';
        rgbStrip.setAttribute('stroke', '#ffffff');
      } else if (this.state.lightingEffect === LightingEffect.BatteryStatus) {
        rgbStrip.style.opacity = '1';
        rgbStrip.setAttribute('stroke', 'var(--apple-green)');
      } else {
        rgbStrip.style.opacity = '1';
        rgbStrip.setAttribute('stroke', color.hex);
      }
    }
  }

  private updateDpiSliderDisplay(): void {
    const currentVal = this.state.dpiStages[this.state.activeStageIndex];
    const slider = document.getElementById('dpi-slider') as HTMLInputElement | null;
    const label = document.getElementById('stage-adjust-label');
    const value = document.getElementById('stage-adjust-value');

    if (slider) {
      if (slider.max === '600') {
        slider.value = dpiToSliderPos(currentVal).toString();
      } else {
        slider.value = currentVal.toString();
      }
    }
    if (label) label.textContent = `Adjust Stage ${this.state.activeStageIndex + 1} Sensitivity`;
    if (value) value.textContent = `${currentVal.toLocaleString()} DPI`;
  }

  // --- Event Bindings ---
  private bindEvents(): void {
    // Navigation Tabs
    const tabs = document.querySelectorAll('.segmented-control .segment-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        tabs.forEach((t) => t.classList.remove('active'));
        const targetBtn = e.currentTarget as HTMLElement;
        targetBtn.classList.add('active');

        const tabKey = targetBtn.getAttribute('data-tab');
        document.querySelectorAll('.tab-pane').forEach((pane) => {
          (pane as HTMLElement).style.display = 'none';
        });

        const activePane = document.getElementById(`tab-${tabKey}`);
        if (activePane) activePane.style.display = 'block';
      });
    });

    // DPI Fine Tuning Slider
    const dpiSlider = document.getElementById('dpi-slider') as HTMLInputElement | null;
    dpiSlider?.addEventListener('input', (e) => {
      const rawVal = parseFloat((e.target as HTMLInputElement).value);
      const val = dpiSlider.max === '600' ? sliderPosToDpi(rawVal) : Math.round(rawVal / 50) * 50;
      const valDisplay = document.getElementById('stage-adjust-value');
      if (valDisplay) valDisplay.textContent = `${val.toLocaleString()} DPI`;
      this.onDpiSliderChange(val);
    });

    // Polling Rate Chips
    const rateChips = document.querySelectorAll('#polling-rate-group .chip-btn');
    rateChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const rate = parseInt(chip.getAttribute('data-rate') || '3');
        this.setPollingRate(rate);
      });
    });

    // DPI LED Effect Chips
    const dpiLedChips = document.querySelectorAll('#dpi-led-effect-group .chip-btn');
    dpiLedChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const val = parseInt(chip.getAttribute('data-val') || '0');
        this.setDpiLedEffect(val);
      });
    });

    // Brightness Slider
    const brightSlider = document.getElementById('brightness-slider') as HTMLInputElement | null;
    brightSlider?.addEventListener('input', (e) => {
      const b = parseInt((e.target as HTMLInputElement).value);
      this.state.brightness = b;
      const lbl = document.getElementById('brightness-val-label');
      if (lbl) lbl.textContent = `Level ${b + 1}`;
      this.setLightingMode(this.state.lightingEffect);
    });

    // Debounce Slider
    const debounceSlider = document.getElementById('debounce-slider') as HTMLInputElement | null;
    debounceSlider?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value);
      this.state.debounceMs = val;
      const lbl = document.getElementById('debounce-val');
      if (lbl) lbl.textContent = `${val} ms ${val === 8 ? '(Recommended)' : ''}`;
      if (this.controller.isConnected) {
        this.controller.setDebounceTime(val).catch(console.error);
      }
    });

    // Sleep Timeout Slider
    const sleepSlider = document.getElementById('sleep-slider') as HTMLInputElement | null;
    sleepSlider?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value);
      this.state.sleepSeconds = val;
      const lbl = document.getElementById('sleep-val');
      if (lbl) lbl.textContent = `${val} Seconds`;
      if (this.controller.isConnected) {
        this.controller.setSleepTime(val).catch(console.error);
      }
    });

    // Connect Button
    const connectBtn = document.getElementById('connect-btn');
    connectBtn?.addEventListener('click', () => this.handleConnectClick());

    // Switch Simulation Button
    const toggleSimBtn = document.getElementById('toggle-sim-btn');
    toggleSimBtn?.addEventListener('click', () => {
      if (this.controller.isSimulation) {
        this.controller.disconnect();
        this.updateConnectionUI();
        this.showToast('Demo mode disabled. Click Connect Mouse to pair via WebHID.');
      } else {
        this.controller.enableSimulation();
        this.updateConnectionUI();
        this.showToast('Demo mode active.');
      }
    });

    // Mouse Vector Click Animations
    const lmb = document.getElementById('mouse-lmb');
    const rmb = document.getElementById('mouse-rmb');
    const dpiBtn = document.getElementById('mouse-dpi-btn');

    lmb?.addEventListener('mousedown', () => lmb.setAttribute('fill', 'rgba(255,255,255,0.18)'));
    lmb?.addEventListener('mouseup', () => lmb.setAttribute('fill', 'rgba(255,255,255,0.03)'));
    rmb?.addEventListener('mousedown', () => rmb.setAttribute('fill', 'rgba(255,255,255,0.18)'));
    rmb?.addEventListener('mouseup', () => rmb.setAttribute('fill', 'rgba(255,255,255,0.03)'));
    dpiBtn?.addEventListener('click', () => {
      const nextIdx = (this.state.activeStageIndex + 1) % this.state.dpiStages.length;
      this.setActiveDpiStage(nextIdx);
    });
  }

  // --- Connection & Battery Polling ---
  private async handleConnectClick(): Promise<void> {
    if (this.controller.isConnected && !this.controller.isSimulation) {
      await this.controller.disconnect();
      this.updateConnectionUI();
      this.showToast('Disconnected from AULA SC900 Pro');
      return;
    }

    try {
      const success = await this.controller.requestDevice();
      if (success) {
        this.updateConnectionUI();
        this.showToast('Successfully paired with AULA SC900 Pro via WebHID');
        this.startBatteryPolling();
      }
    } catch (err: any) {
      alert(`WebHID Error: ${err.message}`);
    }
  }

  private updateConnectionUI(): void {
    const isConn = this.controller.isConnected;
    const isSim = this.controller.isSimulation;

    const modeTag = document.getElementById('connection-mode-tag');
    const connectBtn = document.getElementById('connect-btn');
    const btnLabel = document.getElementById('connect-btn-label');
    const simBanner = document.getElementById('sim-banner');

    if (modeTag) {
      if (isSim) {
        modeTag.textContent = 'Demo Mode';
        modeTag.style.color = 'var(--apple-orange)';
      } else if (isConn) {
        modeTag.textContent = 'Connected (2.4G/USB)';
        modeTag.style.color = 'var(--apple-green)';
      } else {
        modeTag.textContent = 'Disconnected';
        modeTag.style.color = 'var(--text-secondary)';
      }
    }

    if (connectBtn && btnLabel) {
      if (isConn && !isSim) {
        connectBtn.classList.add('connected');
        btnLabel.textContent = 'Disconnect';
      } else {
        connectBtn.classList.remove('connected');
        btnLabel.textContent = 'Connect Mouse';
      }
    }

    if (simBanner) {
      simBanner.style.display = isSim ? 'flex' : 'none';
    }

    this.pollBattery();
  }

  private startBatteryPolling(): void {
    if (this.batteryPollInterval) clearInterval(this.batteryPollInterval);
    this.batteryPollInterval = window.setInterval(() => this.pollBattery(), 15000);
  }

  private async pollBattery(): Promise<void> {
    if (!this.controller.isConnected) return;
    try {
      const batt = await this.controller.getBatteryStatus();
      const txt = document.getElementById('battery-text');
      const fill = document.getElementById('battery-fill');

      if (batt.hasReading === false && !this.controller.isSimulation) {
        if (txt) txt.textContent = '--%';
        if (fill) fill.setAttribute('width', '0');
        return;
      }

      const bars = batt.bars ?? AulaSC900ProController.computeBatteryBars(batt.percentage);
      if (txt) {
        txt.textContent = `${batt.percentage}% (${bars}/5)${batt.isCharging ? ' ⚡' : ''}`;
      }

      if (fill) {
        const width = Math.max(1, (batt.percentage / 100) * 15);
        fill.setAttribute('width', width.toString());
        if (batt.isCharging) {
          fill.setAttribute('fill', 'var(--apple-blue)');
        } else if (batt.percentage < 20) {
          fill.setAttribute('fill', 'var(--apple-red)');
        } else if (batt.percentage < 40) {
          fill.setAttribute('fill', 'var(--apple-orange)');
        } else {
          fill.setAttribute('fill', 'var(--apple-green)');
        }
      }
    } catch (e) {
      console.warn('Battery poll error:', e);
    }
  }

  private showToast(msg: string): void {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-message');
    if (!toast || !text) return;

    text.textContent = msg;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new MouseStudioApp();
});
