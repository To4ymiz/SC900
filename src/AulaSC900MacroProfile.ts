/**
 * Macro binary codec, USB HID key mapping table (from Aula SC900PRO.exe 0x5a3750),
 * Key Combination DWORD encoder/decoder (0x42c320 / 0x418dc0), and Profile types.
 */

export const MACRO_BUFFER_SIZE = 0x140; // 320 bytes
export const MACRO_CHUNK_SIZE = 0x20;   // 32 bytes per chunk
export const MACRO_CHUNK_COUNT = 10;    // 10 chunks (0..9)
export const MACRO_MAX_HW_SLOTS = 71;   // 4-byte step slots 1..71 (bytes 4..287)
export const MACRO_MAX_LOOP_COUNT = 0xfffd; // 65533 max finite repeats (0x440304)

export enum MacroPlaybackMode {
  CycleUntilRelease = 0, // str_macro_cu: Repeat while button is held, stop on release
  RunUntilClick = 1,     // str_macro_ru: Toggle loop until any key/button is pressed again
  LoopTimes = 2,         // str_macro_loop: Repeat N times (1..65533, active at 0x4402e1 & 0x441781)
}

export const MacroPlaybackModeLabels: Record<MacroPlaybackMode, string> = {
  [MacroPlaybackMode.LoopTimes]: 'Loop fixed times',
  [MacroPlaybackMode.CycleUntilRelease]: 'Hold to repeat (stop on release)',
  [MacroPlaybackMode.RunUntilClick]: 'Toggle repeat (stop on next press)',
};

export type MacroStepType = 'keyDown' | 'keyUp' | 'mouseDown' | 'mouseUp' | 'delay';

export interface MacroStep {
  type: MacroStepType;
  /** USB HID Usage ID (0x04..0xE7) or Macro Mouse Code (0xF0 Left, 0xF1 Right, 0xF2 Middle) */
  hidCode?: number;
  /** Delay duration in milliseconds (1..65535) */
  durationMs?: number;
}

export interface MacroDefinition {
  id: string;
  name: string;
  playbackMode: MacroPlaybackMode;
  loopCount: number;
  steps: MacroStep[];
  macroId?: number;
  actionId?: number;
}

export interface KeyCombinationSpec {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  win?: boolean;
  /** Up to 3 USB HID key usage codes (modifiers alone when empty) */
  hidKeys: number[];
}

export interface HidKeyEntry {
  hid: number;
  vk: number;
  label: string;
  codes: string[];
  category: 'letter' | 'number' | 'function' | 'control' | 'navigation' | 'numpad' | 'modifier' | 'mouse';
}

/**
 * USB HID Usage ID table verified directly from Aula SC900PRO.exe .rdata @ 0x5a3750.
 * Includes standard US QWERTY keys (0x04..0x65), modifiers (0xE0..0xE7),
 * and macro mouse buttons (0xF0 Left, 0xF1 Right, 0xF2 Middle).
 */
export const USB_HID_KEY_TABLE: HidKeyEntry[] = [
  // Letters A..Z (HID 0x04..0x1D, VK 0x41..0x5A)
  ...Array.from({ length: 26 }, (_, i): HidKeyEntry => {
    const ch = String.fromCharCode(65 + i);
    return { hid: 0x04 + i, vk: 0x41 + i, label: ch, codes: [`Key${ch}`], category: 'letter' };
  }),
  // Digits 1..9, 0 (HID 0x1E..0x27, VK 0x31..0x39, 0x30)
  ...Array.from({ length: 9 }, (_, i): HidKeyEntry => ({
    hid: 0x1e + i,
    vk: 0x31 + i,
    label: String(i + 1),
    codes: [`Digit${i + 1}`],
    category: 'number',
  })),
  { hid: 0x27, vk: 0x30, label: '0', codes: ['Digit0'], category: 'number' },

  // Control & Whitespace
  { hid: 0x28, vk: 0x0d, label: 'Enter', codes: ['Enter'], category: 'control' },
  { hid: 0x29, vk: 0x1b, label: 'Esc', codes: ['Escape'], category: 'control' },
  { hid: 0x2a, vk: 0x08, label: 'Backspace', codes: ['Backspace'], category: 'control' },
  { hid: 0x2b, vk: 0x09, label: 'Tab', codes: ['Tab'], category: 'control' },
  { hid: 0x2c, vk: 0x20, label: 'Space', codes: ['Space'], category: 'control' },

  // Punctuation
  { hid: 0x2d, vk: 0xbd, label: '-', codes: ['Minus'], category: 'number' },
  { hid: 0x2e, vk: 0xbb, label: '=', codes: ['Equal'], category: 'number' },
  { hid: 0x2f, vk: 0xdb, label: '[', codes: ['BracketLeft'], category: 'number' },
  { hid: 0x30, vk: 0xdd, label: ']', codes: ['BracketRight'], category: 'number' },
  { hid: 0x31, vk: 0xdc, label: '\\', codes: ['Backslash', 'IntlBackslash'], category: 'number' },
  { hid: 0x33, vk: 0xba, label: ';', codes: ['Semicolon'], category: 'number' },
  { hid: 0x34, vk: 0xde, label: "'", codes: ['Quote'], category: 'number' },
  { hid: 0x35, vk: 0xc0, label: '`', codes: ['Backquote'], category: 'number' },
  { hid: 0x36, vk: 0xbc, label: ',', codes: ['Comma'], category: 'number' },
  { hid: 0x37, vk: 0xbe, label: '.', codes: ['Period'], category: 'number' },
  { hid: 0x38, vk: 0xbf, label: '/', codes: ['Slash'], category: 'number' },
  { hid: 0x39, vk: 0x14, label: 'Caps Lock', codes: ['CapsLock'], category: 'control' },

  // Function Keys F1..F12 (HID 0x3A..0x45, VK 0x70..0x7B)
  ...Array.from({ length: 12 }, (_, i): HidKeyEntry => ({
    hid: 0x3a + i,
    vk: 0x70 + i,
    label: `F${i + 1}`,
    codes: [`F${i + 1}`],
    category: 'function',
  })),

  // System & Navigation
  { hid: 0x46, vk: 0x2c, label: 'PrintScreen', codes: ['PrintScreen'], category: 'navigation' },
  { hid: 0x47, vk: 0x91, label: 'ScrollLock', codes: ['ScrollLock'], category: 'navigation' },
  { hid: 0x48, vk: 0x13, label: 'Pause', codes: ['Pause'], category: 'navigation' },
  { hid: 0x49, vk: 0x2d, label: 'Insert', codes: ['Insert'], category: 'navigation' },
  { hid: 0x4a, vk: 0x24, label: 'Home', codes: ['Home'], category: 'navigation' },
  { hid: 0x4b, vk: 0x21, label: 'PageUp', codes: ['PageUp'], category: 'navigation' },
  { hid: 0x4c, vk: 0x2e, label: 'Delete', codes: ['Delete'], category: 'navigation' },
  { hid: 0x4d, vk: 0x23, label: 'End', codes: ['End'], category: 'navigation' },
  { hid: 0x4e, vk: 0x22, label: 'PageDown', codes: ['PageDown'], category: 'navigation' },
  { hid: 0x4f, vk: 0x27, label: 'Right', codes: ['ArrowRight'], category: 'navigation' },
  { hid: 0x50, vk: 0x25, label: 'Left', codes: ['ArrowLeft'], category: 'navigation' },
  { hid: 0x51, vk: 0x28, label: 'Down', codes: ['ArrowDown'], category: 'navigation' },
  { hid: 0x52, vk: 0x26, label: 'Up', codes: ['ArrowUp'], category: 'navigation' },

  // Numpad
  { hid: 0x53, vk: 0x90, label: 'NumLock', codes: ['NumLock'], category: 'numpad' },
  { hid: 0x54, vk: 0x6f, label: 'Num /', codes: ['NumpadDivide'], category: 'numpad' },
  { hid: 0x55, vk: 0x6a, label: 'Num *', codes: ['NumpadMultiply'], category: 'numpad' },
  { hid: 0x56, vk: 0x6d, label: 'Num -', codes: ['NumpadSubtract'], category: 'numpad' },
  { hid: 0x57, vk: 0x6b, label: 'Num +', codes: ['NumpadAdd'], category: 'numpad' },
  { hid: 0x58, vk: 0x0d, label: 'Num Enter', codes: ['NumpadEnter'], category: 'numpad' },
  ...Array.from({ length: 9 }, (_, i): HidKeyEntry => ({
    hid: 0x59 + i,
    vk: 0x61 + i,
    label: `Num ${i + 1}`,
    codes: [`Numpad${i + 1}`],
    category: 'numpad',
  })),
  { hid: 0x62, vk: 0x60, label: 'Num 0', codes: ['Numpad0'], category: 'numpad' },
  { hid: 0x63, vk: 0x6e, label: 'Num .', codes: ['NumpadDecimal'], category: 'numpad' },
  { hid: 0x65, vk: 0x5d, label: 'Menu', codes: ['ContextMenu'], category: 'control' },

  // Modifiers (HID 0xE0..0xE7)
  { hid: 0xe0, vk: 0xa2, label: 'L Ctrl', codes: ['ControlLeft'], category: 'modifier' },
  { hid: 0xe1, vk: 0xa0, label: 'L Shift', codes: ['ShiftLeft'], category: 'modifier' },
  { hid: 0xe2, vk: 0xa4, label: 'L Alt', codes: ['AltLeft'], category: 'modifier' },
  { hid: 0xe3, vk: 0x5b, label: 'L Win', codes: ['MetaLeft', 'OSLeft'], category: 'modifier' },
  { hid: 0xe4, vk: 0xa3, label: 'R Ctrl', codes: ['ControlRight'], category: 'modifier' },
  { hid: 0xe5, vk: 0xa1, label: 'R Shift', codes: ['ShiftRight'], category: 'modifier' },
  { hid: 0xe6, vk: 0xa5, label: 'R Alt', codes: ['AltRight'], category: 'modifier' },
  { hid: 0xe7, vk: 0x5c, label: 'R Win', codes: ['MetaRight', 'OSRight'], category: 'modifier' },

  // Macro Mouse Button Events (HID 0xF0..0xF2 in SC900PRO table)
  { hid: 0xf0, vk: 0x01, label: 'Mouse Left', codes: ['MouseLeft'], category: 'mouse' },
  { hid: 0xf1, vk: 0x02, label: 'Mouse Right', codes: ['MouseRight'], category: 'mouse' },
  { hid: 0xf2, vk: 0x04, label: 'Mouse Middle', codes: ['MouseMiddle'], category: 'mouse' },
];

const HID_BY_USAGE = new Map<number, HidKeyEntry>();
const HID_BY_DOM_CODE = new Map<string, HidKeyEntry>();
const HID_BY_VK = new Map<number, HidKeyEntry>();

for (const entry of USB_HID_KEY_TABLE) {
  HID_BY_USAGE.set(entry.hid, entry);
  for (const c of entry.codes) {
    HID_BY_DOM_CODE.set(c, entry);
  }
  if (!HID_BY_VK.has(entry.vk)) {
    HID_BY_VK.set(entry.vk, entry);
  }
}

export function isMouseMacroHidCode(hidCode: number): boolean {
  return hidCode === 0xf0 || hidCode === 0xf1 || hidCode === 0xf2;
}

export function domCodeToHidUsage(code: string): number | null {
  return HID_BY_DOM_CODE.get(code)?.hid ?? null;
}

export function vkToHidUsage(vk: number): number | null {
  return HID_BY_VK.get(vk)?.hid ?? null;
}

export function getHidKeyLabel(hidCode: number): string {
  const found = HID_BY_USAGE.get(hidCode & 0xff);
  if (found) return found.label;
  return `Key 0x${(hidCode & 0xff).toString(16).toUpperCase().padStart(2, '0')}`;
}

export function isModifierHidCode(hidCode: number): boolean {
  return hidCode >= 0xe0 && hidCode <= 0xe7;
}

function clampInt(val: number, min: number, max: number): number {
  const n = Math.round(Number(val) || 0);
  return Math.max(min, Math.min(max, n));
}

/**
 * Coalesces adjacent delay steps before binary encoding so consecutive pauses
 * never overwrite each other in a single 4-byte hardware slot.
 */
function normalizeMacroSteps(steps: MacroStep[]): MacroStep[] {
  const out: MacroStep[] = [];
  for (const step of steps) {
    if (step.type === 'delay') {
      const ms = clampInt(step.durationMs ?? 10, 1, 0xffff);
      const prev = out[out.length - 1];
      if (prev && prev.type === 'delay') {
        prev.durationMs = Math.min(0xffff, (prev.durationMs ?? 0) + ms);
      } else {
        out.push({ type: 'delay', durationMs: ms });
      }
      continue;
    }

    const hid = (step.hidCode ?? 0) & 0xff;
    if (hid === 0) continue;
    const isDown = step.type === 'keyDown' || step.type === 'mouseDown';
    const normalizedType: MacroStepType = isMouseMacroHidCode(hid)
      ? (isDown ? 'mouseDown' : 'mouseUp')
      : (isDown ? 'keyDown' : 'keyUp');
    out.push({ type: normalizedType, hidCode: hid });
  }
  return out;
}

/**
 * Encodes a MacroDefinition into the 320-byte SC900PRO binary format (0x446460).
 *
 * Step byte[0] bit layout verified in Aula SC900PRO.exe @ 0x446460 & 0x431c10:
 * - bit 7 (0x80): 0 = Key/Mouse Down (make), 1 = Key/Mouse Up (break)
 * - bit 0 (0x01): Explicit delay follows in byte[2..3] (u16 LE ms)
 * - bit 1 (0x02): Implicit 10ms inter-event gap in byte[2..3] before next step
 * - 0x04 (slot 1): Leading delay step when macro starts with a pause
 */
export function encodeMacroPayload(hwSlotIndex: number, macro: MacroDefinition): Uint8Array {
  const buf = new Uint8Array(MACRO_BUFFER_SIZE);
  const slotIdx = clampInt(hwSlotIndex, 0, 5);
  const playbackMode = clampInt(macro.playbackMode, 0, 2);
  const loopCount = clampInt(macro.loopCount || 1, 1, MACRO_MAX_LOOP_COUNT);

  // Header (bytes 0..3)
  buf[0] = slotIdx;
  buf[1] = playbackMode;
  buf[2] = loopCount & 0xff;
  buf[3] = (loopCount >>> 8) & 0xff;

  const steps = normalizeMacroSteps(macro.steps);
  let hwSlot = 1; // Slot 1 begins at offset 4
  let lastRawTag = 0; // 0xC0 down, 0xE0 up, 0xA0 delay
  let lastWrittenSlot = 0;
  let processedSteps = 0;

  for (let i = 0; i < steps.length; i++) {
    if (hwSlot > MACRO_MAX_HW_SLOTS) {
      break;
    }

    const step = steps[i];
    if (step.type === 'delay') {
      const ms = clampInt(step.durationMs ?? 10, 1, 0xffff);
      const off = hwSlot * 4;
      if (i === 0) {
        buf[off] = 0x04;
        buf[off + 1] = 0x00;
        buf[off + 2] = ms & 0xff;
        buf[off + 3] = (ms >>> 8) & 0xff;
      } else {
        buf[off] |= 0x01;
        buf[off + 2] = ms & 0xff;
        buf[off + 3] = (ms >>> 8) & 0xff;
      }
      lastWrittenSlot = hwSlot;
      hwSlot++;
      lastRawTag = 0xa0;
      processedSteps++;
      continue;
    }

    // Close out previous key/mouse event with default 10ms gap flag (0x02) when no explicit delay preceded this step
    if (lastRawTag !== 0xa0 && i !== 0) {
      if (hwSlot >= MACRO_MAX_HW_SLOTS) {
        break;
      }
      const prevOff = hwSlot * 4;
      buf[prevOff] |= 0x02;
      buf[prevOff + 2] = 0x0a;
      buf[prevOff + 3] = 0x00;
      hwSlot++;
    }

    const isDown = step.type === 'keyDown' || step.type === 'mouseDown';
    const hid = (step.hidCode ?? 0) & 0xff;
    const off = hwSlot * 4;
    if (isDown) {
      // 0xC0 in EXE -> b0=0x00 (Down/Make), delay fields zeroed unless delay follows
      buf[off] = 0x00;
      buf[off + 1] = hid;
      buf[off + 2] = 0x00;
      buf[off + 3] = 0x00;
      lastRawTag = 0xc0;
    } else {
      // 0xE0 in EXE -> b0=0x80 (Up/Break), trailing default 0x08 (overwritten if delay follows)
      buf[off] = 0x80;
      buf[off + 1] = hid;
      buf[off + 2] = 0x08;
      buf[off + 3] = 0x00;
      lastRawTag = 0xe0;
    }
    lastWrittenSlot = hwSlot;
    processedSteps++;
  }

  // Footer (0x120..0x13F)
  const rawName = (macro.name || 'Macro').trim() || 'Macro';
  for (let i = 0; i < 16 && i < rawName.length; i++) {
    const code = rawName.charCodeAt(i);
    buf[0x120 + i] = code < 0x80 ? code : 0x5f;
  }

  const sizeField = processedSteps * 4 + 0x70;
  buf[0x130] = sizeField & 0xff;
  buf[0x131] = (sizeField >>> 8) & 0xff;
  buf[0x132] = (sizeField >>> 16) & 0xff;
  buf[0x133] = (sizeField >>> 24) & 0xff;

  // Match EXE signatures at [esi+0x4]=0xE8E8xxxx and [esi+0x8]=0x15xxxxxx (0x44158e..0x4415a8)
  const magicSig = (macro.actionId && (macro.actionId >>> 16) === 0xe8e8) ? (macro.actionId >>> 0) : 0xe8e80010;
  buf[0x134] = magicSig & 0xff;
  buf[0x135] = (magicSig >>> 8) & 0xff;
  buf[0x136] = (magicSig >>> 16) & 0xff;
  buf[0x137] = (magicSig >>> 24) & 0xff;

  const macroUid = (macro.macroId && (macro.macroId >>> 24) === 0x15)
    ? (macro.macroId >>> 0)
    : ((0x15000001 + slotIdx) >>> 0);
  buf[0x138] = macroUid & 0xff;
  buf[0x139] = (macroUid >>> 8) & 0xff;
  buf[0x13a] = (macroUid >>> 16) & 0xff;
  buf[0x13b] = (macroUid >>> 24) & 0xff;

  const rawMarker = processedSteps === 0 ? 0 : processedSteps + 1;
  buf[0x13c] = rawMarker & 0xff;
  buf[0x13d] = (rawMarker >>> 8) & 0xff;

  buf[0x13e] = lastWrittenSlot & 0xff;
  buf[0x13f] = (lastWrittenSlot >>> 8) & 0xff;

  return buf;
}

/**
 * Decodes a 320-byte hardware macro buffer (from 0x87 0x0A readback) back into a MacroDefinition.
 */
export function decodeMacroPayload(buf: Uint8Array, fallbackSlot?: number): MacroDefinition | null {
  if (!buf || buf.length < MACRO_BUFFER_SIZE) {
    return null;
  }

  const playbackRaw = buf[1];
  const playbackMode: MacroPlaybackMode =
    playbackRaw === MacroPlaybackMode.CycleUntilRelease ||
    playbackRaw === MacroPlaybackMode.RunUntilClick ||
    playbackRaw === MacroPlaybackMode.LoopTimes
      ? playbackRaw
      : MacroPlaybackMode.LoopTimes;
  const loopRaw = buf[2] | (buf[3] << 8);
  const loopCount = loopRaw === 0xfffe ? 1 : clampInt(loopRaw || 1, 1, MACRO_MAX_LOOP_COUNT);

  let name = '';
  for (let i = 0; i < 16; i++) {
    const c = buf[0x120 + i];
    if (c === 0 || c === 0xff) break;
    if (c >= 0x20 && c < 0x7f) name += String.fromCharCode(c);
  }
  const slotNum = (fallbackSlot ?? buf[0]) + 1;
  if (!name) name = `Macro (Btn ${slotNum})`;

  const encodedCountRaw = buf[0x13e] | (buf[0x13f] << 8);
  if (encodedCountRaw === 0 || encodedCountRaw === 0xffff) {
    return null;
  }
  const maxSlot = Math.min(MACRO_MAX_HW_SLOTS, encodedCountRaw);

  const steps: MacroStep[] = [];
  for (let s = 1; s <= maxSlot; s++) {
    const off = s * 4;
    const b0 = buf[off];
    const b1 = buf[off + 1];
    const b2 = buf[off + 2];
    const b3 = buf[off + 3];

    if (b0 === 0 && b1 === 0 && b2 === 0 && b3 === 0) {
      continue;
    }

    if (s === 1 && b0 === 0x04) {
      const delayMs = b2 | (b3 << 8);
      if (delayMs > 0) {
        steps.push({ type: 'delay', durationMs: delayMs });
      }
      continue;
    }

    if (b1 !== 0) {
      // Bit 7 == 0 -> Press/Down (0xC0), Bit 7 == 1 -> Release/Up (0xE0), per 0x431e36
      const isDown = (b0 & 0x80) === 0;
      const isMouse = isMouseMacroHidCode(b1);
      steps.push({
        type: isMouse ? (isDown ? 'mouseDown' : 'mouseUp') : (isDown ? 'keyDown' : 'keyUp'),
        hidCode: b1,
      });
    }

    if ((b0 & 0x7f) === 0x01) {
      const delayMs = b2 | (b3 << 8);
      if (delayMs > 0) {
        steps.push({ type: 'delay', durationMs: delayMs });
      }
    }
  }

  const actionId = (buf[0x134] | (buf[0x135] << 8) | (buf[0x136] << 16) | (buf[0x137] << 24)) >>> 0;
  const macroId = (buf[0x138] | (buf[0x139] << 8) | (buf[0x13a] << 16) | (buf[0x13b] << 24)) >>> 0;

  return {
    id: `hw-macro-slot-${fallbackSlot ?? buf[0]}`,
    name,
    playbackMode,
    loopCount,
    steps,
    macroId: macroId || undefined,
    actionId: actionId || undefined,
  };
}

/**
 * Produces a deterministic content fingerprint for detecting local macro edits
 * relative to what was last uploaded or read back from mouse flash memory.
 */
export function getMacroContentSignature(macro: MacroDefinition | null | undefined): string {
  if (!macro) return '';
  const normSteps = normalizeMacroSteps(macro.steps || []).map(s =>
    s.type === 'delay' ? `d:${clampInt(s.durationMs ?? 10, 1, 0xffff)}` : `${s.type}:${(s.hidCode ?? 0) & 0xff}`
  );
  return JSON.stringify({
    name: (macro.name || '').trim().slice(0, 16),
    playbackMode: clampInt(macro.playbackMode, 0, 2),
    loopCount: clampInt(macro.loopCount || 1, 1, MACRO_MAX_LOOP_COUNT),
    steps: normSteps,
  });
}

/**
 * Encodes a 1-3 key combination (+ optional Ctrl/Shift/Alt/Win modifiers) into the 32-bit
 * button action DWORD matching Aula SC900PRO.exe @ 0x42c320.
 */
export function encodeKeyCombination(spec: KeyCombinationSpec): number {
  const modByte =
    (spec.ctrl ? 0x01 : 0) |
    (spec.shift ? 0x02 : 0) |
    (spec.alt ? 0x04 : 0) |
    (spec.win ? 0x08 : 0);

  const keys = (spec.hidKeys || [])
    .map(k => k & 0xff)
    .filter(k => k !== 0 && !isModifierHidCode(k))
    .slice(0, 3);

  if (keys.length >= 3) {
    return (0x80 | (keys[0] << 8) | (keys[1] << 16) | (keys[2] << 24)) >>> 0;
  }

  const k1 = keys[0] ?? 0;
  const k2 = keys[1] ?? 0;
  return (((modByte & 0xff) << 8) | (k1 << 16) | (k2 << 24)) >>> 0;
}

export function isKeyCombinationAction(actionDword: number): boolean {
  const b0 = actionDword & 0xff;
  return (actionDword >>> 0) !== 0 && (b0 === 0x00 || b0 === 0x80);
}

/**
 * Decodes a 32-bit button action DWORD back into a KeyCombinationSpec (matching 0x418dc0).
 */
export function decodeKeyCombination(actionDword: number): KeyCombinationSpec | null {
  if (!isKeyCombinationAction(actionDword)) {
    return null;
  }
  const b0 = actionDword & 0xff;
  const b1 = (actionDword >>> 8) & 0xff;
  const b2 = (actionDword >>> 16) & 0xff;
  const b3 = (actionDword >>> 24) & 0xff;

  if (b0 === 0x80) {
    return {
      hidKeys: [b1, b2, b3].filter(k => k !== 0),
    };
  }

  return {
    ctrl: (b1 & 0x01) !== 0,
    shift: (b1 & 0x02) !== 0,
    alt: (b1 & 0x04) !== 0,
    win: (b1 & 0x08) !== 0,
    hidKeys: [b2, b3].filter(k => k !== 0),
  };
}

export function formatKeyCombinationLabel(spec: KeyCombinationSpec): string {
  const parts: string[] = [];
  if (spec.ctrl) parts.push('Ctrl');
  if (spec.shift) parts.push('Shift');
  if (spec.alt) parts.push('Alt');
  if (spec.win) parts.push('Win');
  for (const k of spec.hidKeys) {
    if (k) parts.push(getHidKeyLabel(k));
  }
  return parts.length > 0 ? parts.join(' + ') : 'None';
}

export function isMacroAction(actionDword: number): boolean {
  return (actionDword & 0xff) === 0x09;
}

export function getMacroSlotFromAction(actionDword: number): number {
  return (actionDword >>> 16) & 0xff;
}

export function buildMacroAction(hwSlotIndex: number): number {
  return (0x00000009 | ((clampInt(hwSlotIndex, 0, 5) & 0xff) << 16)) >>> 0;
}

export function formatMacroSummary(macro: MacroDefinition): string {
  const modeShort =
    macro.playbackMode === MacroPlaybackMode.CycleUntilRelease
      ? 'Hold'
      : macro.playbackMode === MacroPlaybackMode.RunUntilClick
        ? 'Toggle'
        : `${macro.loopCount}x`;
  return `${macro.name} (${modeShort})`;
}
