function calculateCommission(amount, isSelling = false) {
  const fixedFee = 1; // $1 fixed fee
  const percentageFee = amount * 0.005; // 0.5% of amount
  const commission = fixedFee + percentageFee;
  
  if (isSelling) {
    // For selling, commission is deducted from what user receives
    const totalAfterCommission = amount - commission;
    return { totalAfterCommission, commission };
  } else {
    // For buying, commission is added to what user pays
    const totalWithCommission = amount + commission;
    return { totalWithCommission, commission };
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-SY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

module.exports = { calculateCommission, formatCurrency };