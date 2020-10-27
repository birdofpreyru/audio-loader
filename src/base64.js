// DECODE UTILITIES
function b64ToUint6(nChr) {
  if (nChr > 64 && nChr < 91) return nChr - 65;
  if (nChr > 96 && nChr < 123) return nChr - 71;
  if (nChr > 47 && nChr < 58) return nChr + 4;
  if (nChr === 43) return 62;
  if (nChr === 47) return 63;
  return 0;
}

// Decode Base64 to Uint8Array
// ---------------------------
export function decode(sBase64, nBlocksSize) {
  const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, '');
  const nInLen = sB64Enc.length;
  const nOutLen = nBlocksSize
    /* eslint-disable no-bitwise */
    ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize
    : nInLen * 3 + 1 >> 2;
    /* eslint-enable no-bitwise */
  const taBytes = new Uint8Array(nOutLen);

  for (let nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    /* eslint-disable no-bitwise */
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
      }
      nUint24 = 0;
    }
    /* eslint-enable no-bitwise */
  }
  return taBytes;
}

export default undefined;
