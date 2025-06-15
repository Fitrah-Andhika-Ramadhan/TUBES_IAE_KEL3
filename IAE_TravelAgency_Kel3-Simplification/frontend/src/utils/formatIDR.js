// Centralized utility for formatting numbers as Indonesian Rupiah (IDR)
export default function formatIDR(value) {
  return value ? value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-';
}
