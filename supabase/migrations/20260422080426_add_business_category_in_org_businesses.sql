-- 1. Add the column (if not exists) with a default that matches the constraint
ALTER TABLE org_businesses 
ADD COLUMN IF NOT EXISTS business_category TEXT DEFAULT 'Other';

-- 2. Update existing rows: set NULL or invalid values to 'Other'
UPDATE org_businesses 
SET business_category = 'Other'
WHERE business_category IS NULL 
   OR business_category NOT IN (
    'Restaurant', 'Cafe', 'Bakery', 'Bar', 'Nightclub', 'Food Truck', 'Catering',
    'Retail', 'Grocery', 'Supermarket', 'Convenience Store', 'Clothing', 'Footwear',
    'Jewelry', 'Electronics', 'Bookstore', 'Pet Store', 'Toy Store', 'Sporting Goods',
    'Furniture', 'Hardware', 'Garden Center', 'Florist', 'Gift Shop',
    'Pharmacy', 'Salon', 'Barbershop', 'Spa', 'Clinic', 'Dental', 'Veterinary',
    'Optical', 'Cosmetics',
    'Gym', 'Yoga Studio', 'Car Wash', 'Auto Repair', 'Laundry', 'Dry Cleaning',
    'Hotel', 'Motel', 'Event Venue', 'Coworking Space',
    'Legal', 'Accounting', 'Consulting', 'Real Estate', 'Insurance',
    'School', 'Tutoring', 'Training Center',
    'Other'
);

-- 3. Now add the check constraint safely
ALTER TABLE org_businesses 
DROP CONSTRAINT IF EXISTS valid_business_category;

ALTER TABLE org_businesses 
ADD CONSTRAINT valid_business_category CHECK (
  business_category IN (
    'Restaurant', 'Cafe', 'Bakery', 'Bar', 'Nightclub', 'Food Truck', 'Catering',
    'Retail', 'Grocery', 'Supermarket', 'Convenience Store', 'Clothing', 'Footwear',
    'Jewelry', 'Electronics', 'Bookstore', 'Pet Store', 'Toy Store', 'Sporting Goods',
    'Furniture', 'Hardware', 'Garden Center', 'Florist', 'Gift Shop',
    'Pharmacy', 'Salon', 'Barbershop', 'Spa', 'Clinic', 'Dental', 'Veterinary',
    'Optical', 'Cosmetics',
    'Gym', 'Yoga Studio', 'Car Wash', 'Auto Repair', 'Laundry', 'Dry Cleaning',
    'Hotel', 'Motel', 'Event Venue', 'Coworking Space',
    'Legal', 'Accounting', 'Consulting', 'Real Estate', 'Insurance',
    'School', 'Tutoring', 'Training Center',
    'Other'
  )
);