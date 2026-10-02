-- Products whose best price dropped by 5% or more since the previous check
WITH daily AS (
    SELECT product_id,
           checked_on,
           MIN(unit_price) AS best_price
    FROM offers
    GROUP BY product_id, checked_on
),
changes AS (
    SELECT product_id,
           checked_on,
           best_price,
           LAG(best_price) OVER (PARTITION BY product_id ORDER BY checked_on) AS previous
    FROM daily
)
SELECT product_id,
       previous,
       best_price,
       ROUND(100.0 * (best_price - previous) / previous, 1) AS change_pct
FROM changes
WHERE checked_on = CURRENT_DATE
  AND best_price <= previous * ⟨0.5|0.95⟩
ORDER BY change_pct;
