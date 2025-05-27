/*
  # Add Pharmacy Management Features

  1. New Tables
    - `pharmacies`
      - Store pharmacy information and financial details
    - `invoices`
      - Track product assignments and billing
    - `invoice_items`
      - Individual items in each invoice
    - `payments`
      - Track payments made by pharmacies

  2. Changes
    - Update `clients` table to include pharmacy type
    - Add new columns for financial tracking

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  contact_number text,
  email text,
  address text,
  registration_number text UNIQUE,
  credit_limit decimal(12,2) DEFAULT 0,
  payment_terms integer DEFAULT 30, -- Days
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read pharmacies"
  ON pharmacies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage pharmacies"
  ON pharmacies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id),
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  subtotal decimal(12,2) NOT NULL,
  discount_percentage decimal(5,2) DEFAULT 0,
  discount_amount decimal(12,2) DEFAULT 0,
  tax_percentage decimal(5,2) DEFAULT 0,
  tax_amount decimal(12,2) DEFAULT 0,
  total_amount decimal(12,2) NOT NULL,
  paid_amount decimal(12,2) DEFAULT 0,
  status text NOT NULL CHECK (status IN ('draft', 'issued', 'partial', 'paid', 'overdue', 'cancelled')),
  notes text,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  discount_percentage decimal(5,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(12,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage invoice items"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card')),
  reference_number text,
  notes text,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add pharmacy type to clients
ALTER TABLE clients DROP CONSTRAINT IF EXISTS client_id_check;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_type_check;

ALTER TABLE clients ADD CONSTRAINT clients_type_check 
  CHECK (type IN ('patient', 'department', 'pharmacy'));

ALTER TABLE clients ADD CONSTRAINT client_id_check CHECK (
  (type = 'patient' AND patient_id IS NOT NULL AND department_id IS NULL) OR
  (type = 'department' AND department_id IS NOT NULL AND patient_id IS NULL) OR
  (type = 'pharmacy' AND patient_id IS NULL AND department_id IS NULL)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pharmacies_name ON pharmacies(name);
CREATE INDEX IF NOT EXISTS idx_invoices_pharmacy_id ON invoices(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Function to update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  WITH payment_totals AS (
    SELECT invoice_id, SUM(amount) as total_paid
    FROM payments
    WHERE invoice_id = NEW.invoice_id
    GROUP BY invoice_id
  )
  UPDATE invoices i
  SET 
    paid_amount = COALESCE(pt.total_paid, 0),
    status = 
      CASE 
        WHEN COALESCE(pt.total_paid, 0) >= i.total_amount THEN 'paid'
        WHEN COALESCE(pt.total_paid, 0) > 0 THEN 'partial'
        WHEN i.due_date < CURRENT_DATE THEN 'overdue'
        ELSE 'issued'
      END
  FROM payment_totals pt
  WHERE i.id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_status_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year text;
  month text;
  sequence int;
  invoice_number text;
BEGIN
  year := to_char(CURRENT_DATE, 'YY');
  month := to_char(CURRENT_DATE, 'MM');
  
  SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM '\d+$')::integer), 0) + 1
  INTO sequence
  FROM invoices
  WHERE invoice_number LIKE 'INV' || year || month || '%';
  
  invoice_number := 'INV' || year || month || LPAD(sequence::text, 4, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;