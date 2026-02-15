export const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR'
  });
  return formatter.format(Number.isFinite(value) ? value : 0);
};
