try {
  console.log('Attempting to require lightningcss...');
  const lightningcss = require('lightningcss');
  console.log('Success! LightningCSS loaded.');
  console.log('Version:', lightningcss.version);
} catch (e) {
  console.error('Failed to load lightningcss:', e);
  console.error('Code:', e.code);
  try {
     console.log('Attempting to require specific binary...');
     require('lightningcss-darwin-arm64');
     console.log('Binary loaded directly.');
  } catch (e2) {
      console.error('Failed to load binary directly:', e2);
  }
}
