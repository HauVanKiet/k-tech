// Format số sang dạng có dấu chấm: 1000000 -> 1.000.000
export const formatPriceInput = (value) => {
  const num = value.replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('vi-VN');
};

// Chuyển từ string đã format về số nguyên
export const parsePriceInput = (formatted) => {
  return parseInt(formatted.replace(/\./g, '')) || 0;
};