export function buildOrder(): Order {
  const amount = Number((Math.random() * 900 + 100).toFixed(2));
  const statusOptions: Order["status"][] = [
    "pending",
    "processing",
    "fulfilled",
    "cancelled",
  ];
  const paymentMethods: Order["paymentMethod"][] = [
    "card",
    "paypal",
    "cash",
    "wire",
  ];

  return {
    orderId: generateId(),
    customerId: `cust-${generateId().slice(0, 6).toLowerCase()}`,
    amount,
    currency: "USD",
    status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
    paymentMethod:
      paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    items: Math.floor(Math.random() * 5) + 1,
    createdAt: new Date().toISOString(),
  };
}