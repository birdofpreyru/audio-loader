/**
 * Mist utilities.
 */

/**
 * True when the code is executed outside of Node environment.
 */
export const IS_CLIENT_SIDE = typeof process !== 'object'
  || !process.versions || !process.versions.node;

/**
 * "Weak require". It allows to load a module in Node environment, without
 * Webpack, or another JS bundler, capturing that and bundling that module
 * into web bundle.
 * @param {string} modulePath
 * @return {object}
 */
export function requireWeak(modulePath) {
  /* eslint-disable no-eval */
  const mod = eval('require')(modulePath);
  /* eslint-enable no-eval */
  return mod.default || mod;
}
