-- Invoiced per month and currency, last 12 months, cancelled invoices excluded
SELECT date_trunc('month', i.issued_on) AS month,
       c.currency,
       SUM(i.net_amount)                AS net,
       COUNT(*)                         AS invoices
FROM invoices i
JOIN customers c ON c.id = i.customer_id
WHERE i.status ⟨= 'cancelled'|<> 'cancelled'⟩
  AND i.issued_on >= date_trunc('month', now()) - INTERVAL '11 months'
GROUP BY 1, 2
ORDER BY 1, 2;
