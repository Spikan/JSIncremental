// Button type configuration extracted from buttons.ts

export type ButtonTypeMeta = {
  audio: 'purchase' | 'click';
  feedback: 'purchase' | 'levelup' | 'info';
  className: string;
};

export const BUTTON_TYPES: Record<string, ButtonTypeMeta> = {
  'shop-btn': { audio: 'purchase', feedback: 'purchase', className: 'shop-btn' },
  'clicking-upgrade-btn': {
    audio: 'purchase',
    feedback: 'purchase',
    className: 'clicking-upgrade-btn',
  },
  'drink-speed-upgrade-btn': {
    audio: 'purchase',
    feedback: 'purchase',
    className: 'drink-speed-upgrade-btn',
  },
  'level-up-btn': { audio: 'purchase', feedback: 'levelup', className: 'level-up-btn' },
  'save-btn': { audio: 'click', feedback: 'info', className: 'save-btn' },
  'sound-toggle-btn': { audio: 'click', feedback: 'info', className: 'sound-toggle-btn' },
  'dev-btn': { audio: 'click', feedback: 'info', className: 'dev-btn' },
  // Additional button type classes used across the UI
  'dev-toggle-btn': { audio: 'click', feedback: 'info', className: 'dev-toggle-btn' },
  'god-toggle-btn': { audio: 'click', feedback: 'info', className: 'god-toggle-btn' },
  'chat-send-btn': { audio: 'click', feedback: 'info', className: 'chat-send-btn' },
  'audio-btn': { audio: 'click', feedback: 'info', className: 'audio-btn' },
  'settings-modal-btn': { audio: 'click', feedback: 'info', className: 'settings-modal-btn' },
  'switch-dropdown-btn': {
    audio: 'click',
    feedback: 'info',
    className: 'switch-dropdown-btn',
  },
  'unlock-btn': { audio: 'click', feedback: 'levelup', className: 'unlock-btn' },
  'offline-modal-btn': {
    audio: 'click',
    feedback: 'info',
    className: 'offline-modal-btn',
  },
  // Environment system replaced by hybrid level system
  'level-btn': { audio: 'click', feedback: 'info', className: 'level-btn' },
};
