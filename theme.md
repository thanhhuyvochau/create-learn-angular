```copy
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  // ✅ CTA/primary brand color
  primaryColor: 'brand-teal',

  fontFamily:
    'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',

  // (tuỳ chọn) bạn có thể giữ hoặc đổi black, nhưng body text tốt hơn để set ở Text component/global css
  black: 'rgba(0, 0, 0, 0.87)',

  breakpoints: {
    xs: '30em', // 480px
    xssm: '35rem', // 560px
    sm: '48em', // 768px
    smmd: '70em', // 1120px
    md: '64em', // 1024px
    lg: '74em', // 1184px
    xl: '90em', // 1440px
    xxl: '123.75rem', //1980px
    xxxl: '152.5rem',
  },

  colors: {
    // ✅ Brand Teal (Accent & CTA) — index 6 = #00A896
    'brand-teal': [
      '#E6F7F4',
      '#CFF1EC',
      '#A3E5DA',
      '#74D9C8',
      '#47CDB6',
      '#1BC1A5',
      '#00A896',
      '#008A7B',
      '#006D61',
      '#004F46',
    ],

    // ✅ Brand Navy (Primary) — index 6 = #002B5B
    'brand-navy': [
      '#E7EEF7',
      '#CFE0F2',
      '#A6C0E6',
      '#7EA0DA',
      '#5680CE',
      '#2E60C2',
      '#002B5B',
      '#022449',
      '#031D38',
      '#041627',
    ],

    // ✅ Text slate (Body text) — index 6 ~= #4A5568
    slate: [
      '#F7FAFC',
      '#EDF2F7',
      '#E2E8F0',
      '#CBD5E0',
      '#A0AEC0',
      '#718096',
      '#4A5568',
      '#2D3748',
      '#1A202C',
      '#171923',
    ],

    // ✅ Surfaces / background
    surface: [
      '#FFFFFF', // 0 pure white
      '#F8F9FA', // 1 off-white (recommended)
      '#F0F4F8', // 2 alternative off-white
      '#E9EEF5',
      '#DDE5EF',
      '#C9D4E3',
      '#B3C2D8',
      '#93A6C0',
      '#6F7F96',
      '#4B596B',
    ],

    // --- Bạn có thể GIỮ các màu cũ để tránh break UI nơi đang dùng ---
    'fresh-orange': [
      '#fff3e0',
      '#ffe0b2',
      '#ffcc80',
      '#ffb74d',
      '#ffa726',
      '#fb8c00',
      '#f57c00',
      '#ef6c00',
      '#e65100',
      '#bf360c',
    ],
    'fresh-cyan': [
      '#e1f5fe',
      '#b3e5fc',
      '#81d4fa',
      '#4fc3f7',
      '#29b6f6',
      '#03a9f4',
      '#039be5',
      '#0288d1',
      '#0277bd',
      '#01579b',
    ],
    'fresh-blue': [
      '#e1f5fe',
      '#b3e5fc',
      '#81d4fa',
      '#4fc3f7',
      '#40c4ff',
      '#00b0ff',
      '#0091ea',
      '#0288d1',
      '#0277bd',
      '#01579b',
    ],
    'fresh-green': [
      '#e8f5e9',
      '#c8e6c9',
      '#a5d6a7',
      '#81c784',
      '#66bb6a',
      '#4caf50',
      '#43a047',
      '#388e3c',
      '#2e7d32',
      '#1b5e20',
    ],
    'error-red': [
      '#ffebee',
      '#ffcdd2',
      '#ef9a9a',
      '#e57373',
      '#ef5350',
      '#d32f2f',
      '#c62828',
      '#b71c1c',
      '#8e0000',
      '#6d0000',
    ],
    'warning-orange': [
      '#fff3e0',
      '#ffe0b2',
      '#ffcc80',
      '#ffb74d',
      '#ff9800',
      '#ed6c02',
      '#e65100',
      '#d84315',
      '#bf360c',
      '#a02f0b',
    ],
  },

  // ✅ Brand gradient (Teal -> Navy)
  defaultGradient: {
    from: '#00A896', // brand-teal.6
    to: '#002B5B', // brand-navy.6
    deg: 45,
  },

  shadows: {
    xs: '0px 1px 1px 0px rgba(36, 24, 24, 0.14), 0px 1px 2px 0px rgba(0, 0, 0, 0.12)',
    sm: '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
    md: '0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12)',
    lg: '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
    xl: '0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12)',
  },

  radius: {
    xs: '2px',
    sm: '4px',
    md: '4px',
    lg: '6px',
    xl: '8px',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  headings: {
    fontFamily:
      'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    sizes: {
      h1: { fontSize: '6rem', lineHeight: '1.167', fontWeight: '700' },
      h2: { fontSize: '3.75rem', lineHeight: '1.2', fontWeight: '700' },
      h3: { fontSize: '3rem', lineHeight: '1.167', fontWeight: '500' },
      h4: { fontSize: '2.125rem', lineHeight: '1.235', fontWeight: '500' },
      h5: { fontSize: '1.5rem', lineHeight: '1.334', fontWeight: '500' },
      h6: { fontSize: '1.25rem', lineHeight: '1.6', fontWeight: '500' },
    },
  },

  components: {
    Button: {
      defaultProps: {
        radius: 'sm',
        // ✅ nếu muốn mọi Button mặc định ra Teal
        color: 'brand-teal',
      },
      styles: {
        root: {
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: '1.75',
          textTransform: 'none',
          transition:
            'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
      },
    },

    Card: {
      defaultProps: {
        radius: 'sm',
        shadow: 'sm',
      },
      styles: {
        root: {
          transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
      },
    },

    Input: {
      styles: {
        input: {
          borderColor: 'rgba(0, 0, 0, 0.23)',
          transition: 'border-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          '&:focus': {
            // ✅ đổi focus từ orange sang teal
            borderColor: '#00A896',
          },
        },
      },
    },

    Paper: {
      defaultProps: {
        shadow: 'md',
        radius: 'sm',
      },
    },

    // (tuỳ chọn) muốn Text mặc định màu body dễ đọc
    // Text: {
    //   styles: { root: { color: '#4A5568' } },
    // },
  },

  other: {
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  },
});
```