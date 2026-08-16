const revenueRules = {
  hotel: { commissionRate: 0.1, convenienceFee: 99, label: "Hotel commission + traveler convenience fee" },
  bus: { commissionRate: 0.06, convenienceFee: 29, label: "Bus operator commission + ticketing fee" },
  train: { commissionRate: 0.04, convenienceFee: 19, label: "Train ticketing commission + booking fee" },
  guide: { commissionRate: 0.15, convenienceFee: 49, label: "Guide lead commission + booking fee" },
  package: { commissionRate: 0.12, convenienceFee: 199, label: "Package margin + service fee" }
};

export const getRevenueBreakdown = (bookingType, baseAmount) => {
  const rule = revenueRules[bookingType] || revenueRules.hotel;
  const normalizedBase = Math.max(0, Number(baseAmount) || 0);
  const commissionAmount = Math.round(normalizedBase * rule.commissionRate);
  const platformFee = rule.convenienceFee;
  const platformRevenue = commissionAmount + platformFee;
  const partnerPayout = Math.max(0, normalizedBase - commissionAmount);
  const totalPrice = normalizedBase + platformFee;

  return {
    baseAmount: normalizedBase,
    commissionRate: rule.commissionRate,
    commissionAmount,
    platformFee,
    platformRevenue,
    partnerPayout,
    totalPrice,
    revenueModel: rule.label
  };
};
