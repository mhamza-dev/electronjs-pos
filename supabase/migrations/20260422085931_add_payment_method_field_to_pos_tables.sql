-- Add cash payment columns
ALTER TABLE pos_sales_orders 
ADD COLUMN payment_method TEXT DEFAULT 'cash',
ADD COLUMN amount_tendered NUMERIC(10,2),
ADD COLUMN change_due NUMERIC(10,2);

-- Optionally add a check constraint for payment_method values
ALTER TABLE pos_sales_orders 
ADD CONSTRAINT valid_payment_method CHECK (payment_method IN ('cash', 'card', 'mobile', 'other'));