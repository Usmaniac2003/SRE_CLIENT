export const theme = {
  colors: {
    // Core brand colors
    primary: '#1B9C6F',        // Deep green
    primaryLight: '#2ECC71',   // Brighter accent green
    primaryDark: '#167A56',

    // Background palette
    background: '#F7FAF8',     // Whisper white with a green tint
    surface: '#FFFFFF',        // Pure white for cards/containers
    surfaceAlt: '#F0F5F2',     // Very subtle greenish shadow layer

    // Text
    textPrimary: '#1A1F1C',    // Almost black (safer than pure black)
    textSecondary: '#4A5A52',  // Muted green-gray text
    textMuted: '#8E9C95',      // Disabled / placeholder text

    // Borders and separators
    border: '#D9E6DF',
    borderDark: '#AAC8BA',

    // Status colors
    success: '#2ECC71',
    warning: '#F4D03F',
    danger: '#E74C3C',

    // Button states
    btnHover: '#149161',
    btnActive: '#0F6E4A'
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px'
  },

  typography: {
    fontFamily: `'Inter', sans-serif`,
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      xxl: '32px'
    },
    lineHeight: {
      normal: 1.5,
      relaxed: 1.7
    }
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '20px'
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 2px 6px rgba(0,0,0,0.08)',
    lg: '0 4px 12px rgba(0,0,0,0.12)'
  },

  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease'
  }
} as const;
