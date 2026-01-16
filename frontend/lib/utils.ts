
export const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getWhatsAppLink = (phone: string, title: string) => {
  const message = encodeURIComponent(`Hello, I'm interested in your property: ${title} on HomeLinka.`);
  return `https://wa.me/${phone.replace('+', '').replace(/\s/g, '')}?text=${message}`;
};
