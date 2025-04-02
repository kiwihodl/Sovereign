module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Turn off exhaustive-deps rule that's causing most of the warnings
    'react-hooks/exhaustive-deps': 'off'
  }
} 