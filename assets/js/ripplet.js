import ripplet from 'ripplet.js';

// Prepend space to prevent CSS variable computing
ripplet.defaultOptions.color = ' var(--color)';
ripplet.defaultOptions.spreadingTimingFunction = 'ease-out';

export default ripplet;
