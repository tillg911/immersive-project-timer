// Create a simple 32x32 PNG icon
const fs = require('fs');
const path = require('path');

// Minimal valid 32x32 PNG (purple gradient circle)
// This is a base64 encoded PNG
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAADMUlEQVR4nO2WW0gUURjHf7O7ruvqermklZVZSF4qK7OyMrLsYhFBPURBD0EQBD1EPfTQQ0899FIQBBFBD0FBYRFBURBkF8ooujdLrey+7q67szPT+c7srLPujmMb9NAP/rAzc+b7/uc73zkzsCY/+0mw+M0h4AhwFNgJbASSgCCwBHwFPgMfgNfA88jI0emfBUj+owQIHgHOAWeB9cAGwA0sA4vAAvAVmAZeAU+AJ5GRo7O/BGBZkPwicAE4D2wB1gHLwHdgHpgD5hQgV/l8F3gCPLYFIPFrBcgV4DKwCUgAloB5YBqYVoA81WdS+XwbeERyaX4ZQuJnL/MQgBvAFSAHCAOLyhXTCpBj+RwEHqqQE+rZ7AIQAS4B14AMIKBcMQuEFSCqDn1Akl2AYj/JpXxCb8OjHJxbLuEjuhtuK1dugqZ8bQSSmI1AHZDNiqt6NrOKT7VJLh1LHrcJEwlkRnqMRK1DJmZjVLfU8ORx7LMTpvSl0OKcmGUu/xbAspfWsswzDL2q10gsxjp2ABwubhfAAJyAmEhvVqECcEqjCAhL1VZCi7PTOlzJQoDqADxhD4Cq2AQUiGpQxcZKFGAVG6kO8LUdAKqCEqpbqmJbCa1kdWJiNQ8oc30dxgBIQRdwTU1aCWnSJKWJiT8MQLKX5P/eMwCL8wM/ALToBPxAftsAqCZT0UlCeYqJLAHIBHIBt90yBHQO59oOATWFOlLH9T0AzWG7ADqHi+z2AEhXFOqIjRr3AEjHdQFYqQ8obAeAGp0iOx4AaZ8uAAEgnR0A2r50ASgPwIN2AKQY1JUqLgdA67ddAPLVZBwGQKa1DQBVuPR6HABA1o0uALqNJO8FQKZnp7YAqEp1OQDazux4ANIenQBYy3IA1DrrApBxagPQEOh4ADQ8OgBk3dkBoCHXBiB1YAVS8gB0AEiOdAJYwXQBUPB0vAelDq0ASJ20AWj2dDwHpA+tAJJbHQCSc1sA1OM6ngNaP9YAaIS0AcjaaAOQPmkDoFHT8RzQ+rUGYK1PdgCkr3YArKhpA5C6tQJgjW92AKQfawBW0GwBUAi0AUi/VgFE/3U8B7T+rAH4AwTvIvxG6PikAAAAAElFTkSuQmCC';

const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write the PNG file
const pngBuffer = Buffer.from(pngBase64, 'base64');
fs.writeFileSync(path.join(iconsDir, 'icon.png'), pngBuffer);

console.log('Created icon.png in src-tauri/icons/');
console.log('Now run: bun tauri icon src-tauri/icons/icon.png');
