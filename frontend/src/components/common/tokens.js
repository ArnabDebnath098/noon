// Design tokens — web adaptation of the @field-ds/tokens API.
// Single source of truth for colour + spacing, kept in sync with tailwind.config.

export const colour = {
  brand: '#FEEE00', // noon yellow
  dark: '#404553',
  gray: '#7E859B',
  success: '#1ABC66',
  danger: '#E5293E',
  white: '#FFFFFF',
  black: '#000000',
};

// 4px base scale, addressed by step (space[2] === 8px).
export const space = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
};
