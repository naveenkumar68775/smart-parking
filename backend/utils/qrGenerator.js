const QRCode = require('qrcode');

/**
 * Generates a base64 PNG data URL for the given payload object/string.
 */
const generateQRCode = async (payload) => {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
  try {
    return await QRCode.toDataURL(text, { errorCorrectionLevel: 'H', margin: 2, width: 300 });
  } catch (err) {
    throw new Error('Failed to generate QR code: ' + err.message);
  }
};

module.exports = generateQRCode;
