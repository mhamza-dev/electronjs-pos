import { UOMOption } from "./type";

export const timezoneOptions = [
  { label: "UTC", value: "UTC" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "America/Chicago", value: "America/Chicago" },
  { label: "America/Denver", value: "America/Denver" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Europe/Paris", value: "Europe/Paris" },
  { label: "Asia/Karachi", value: "Asia/Karachi" },
  { label: "Asia/Dubai", value: "Asia/Dubai" },
  { label: "Asia/Singapore", value: "Asia/Singapore" },
  { label: "Australia/Sydney", value: "Australia/Sydney" },
  // Add more as needed
];

export const businessCategoryOptions = [
  // Food & Beverage
  { label: "Restaurant", value: "Restaurant" },
  { label: "Cafe", value: "Cafe" },
  { label: "Bakery", value: "Bakery" },
  { label: "Bar", value: "Bar" },
  { label: "Nightclub", value: "Nightclub" },
  { label: "Food Truck", value: "Food Truck" },
  { label: "Catering", value: "Catering" },
  // Retail
  { label: "Retail (General)", value: "Retail" },
  { label: "Grocery", value: "Grocery" },
  { label: "Supermarket", value: "Supermarket" },
  { label: "Convenience Store", value: "Convenience Store" },
  { label: "Clothing", value: "Clothing" },
  { label: "Footwear", value: "Footwear" },
  { label: "Jewelry", value: "Jewelry" },
  { label: "Electronics", value: "Electronics" },
  { label: "Bookstore", value: "Bookstore" },
  { label: "Pet Store", value: "Pet Store" },
  { label: "Toy Store", value: "Toy Store" },
  { label: "Sporting Goods", value: "Sporting Goods" },
  { label: "Furniture", value: "Furniture" },
  { label: "Hardware", value: "Hardware" },
  { label: "Garden Center", value: "Garden Center" },
  { label: "Florist", value: "Florist" },
  { label: "Gift Shop", value: "Gift Shop" },
  // Health & Beauty
  { label: "Pharmacy", value: "Pharmacy" },
  { label: "Salon", value: "Salon" },
  { label: "Barbershop", value: "Barbershop" },
  { label: "Spa", value: "Spa" },
  { label: "Clinic", value: "Clinic" },
  { label: "Dental", value: "Dental" },
  { label: "Veterinary", value: "Veterinary" },
  { label: "Optical", value: "Optical" },
  { label: "Cosmetics", value: "Cosmetics" },
  // Services
  { label: "Gym", value: "Gym" },
  { label: "Yoga Studio", value: "Yoga Studio" },
  { label: "Car Wash", value: "Car Wash" },
  { label: "Auto Repair", value: "Auto Repair" },
  { label: "Laundry", value: "Laundry" },
  { label: "Dry Cleaning", value: "Dry Cleaning" },
  { label: "Hotel", value: "Hotel" },
  { label: "Motel", value: "Motel" },
  { label: "Event Venue", value: "Event Venue" },
  { label: "Coworking Space", value: "Coworking Space" },
  // Professional
  { label: "Legal", value: "Legal" },
  { label: "Accounting", value: "Accounting" },
  { label: "Consulting", value: "Consulting" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Insurance", value: "Insurance" },
  // Education
  { label: "School", value: "School" },
  { label: "Tutoring", value: "Tutoring" },
  { label: "Training Center", value: "Training Center" },
  // Other
  { label: "Other", value: "Other" },
];

export const uomOptions: UOMOption[] = [
  // Countable (nearly all)
  { label: "Each (ea)", value: "ea", categories: ["all"] },
  { label: "Piece", value: "pc", categories: ["all"] },
  {
    label: "Pair",
    value: "pair",
    categories: ["Clothing", "Footwear", "Retail"],
  },
  {
    label: "Dozen",
    value: "dozen",
    categories: ["Restaurant", "Cafe", "Bakery", "Grocery", "Supermarket"],
  },
  {
    label: "Box",
    value: "box",
    categories: ["Retail", "Grocery", "Electronics", "Hardware"],
  },
  {
    label: "Pack",
    value: "pack",
    categories: ["Retail", "Grocery", "Pharmacy", "Cosmetics"],
  },
  {
    label: "Set",
    value: "set",
    categories: ["Retail", "Hardware", "Furniture"],
  },
  {
    label: "Kit",
    value: "kit",
    categories: ["Hardware", "Electronics", "Auto Repair"],
  },
  {
    label: "Bundle",
    value: "bundle",
    categories: ["Retail", "Grocery", "Clothing"],
  },
  {
    label: "Roll",
    value: "roll",
    categories: ["Hardware", "Retail", "Garden Center"],
  },
  { label: "Sheet", value: "sheet", categories: ["Hardware", "Retail"] },
  { label: "Carton", value: "carton", categories: ["Retail", "Grocery"] },
  { label: "Case", value: "case", categories: ["Retail", "Grocery"] },

  // Weight
  {
    label: "Kilogram (kg)",
    value: "kg",
    categories: ["Grocery", "Supermarket", "Restaurant", "Bakery"],
  },
  {
    label: "Gram (g)",
    value: "g",
    categories: ["Grocery", "Pharmacy", "Jewelry", "Cosmetics"],
  },
  {
    label: "Milligram (mg)",
    value: "mg",
    categories: ["Pharmacy", "Veterinary"],
  },
  {
    label: "Pound (lb)",
    value: "lb",
    categories: ["Grocery", "Supermarket", "Restaurant"],
  },
  {
    label: "Ounce (oz)",
    value: "oz",
    categories: ["Grocery", "Restaurant", "Cafe"],
  },

  // Volume
  {
    label: "Liter (L)",
    value: "L",
    categories: ["Restaurant", "Cafe", "Bar", "Grocery"],
  },
  {
    label: "Milliliter (mL)",
    value: "mL",
    categories: ["Pharmacy", "Cosmetics", "Restaurant"],
  },
  {
    label: "Gallon (gal)",
    value: "gal",
    categories: ["Grocery", "Restaurant"],
  },
  {
    label: "Fluid Ounce (fl oz)",
    value: "fl_oz",
    categories: ["Restaurant", "Cafe", "Bar"],
  },
  { label: "Cup", value: "cup", categories: ["Restaurant", "Cafe", "Bakery"] },
  {
    label: "Tablespoon",
    value: "tbsp",
    categories: ["Restaurant", "Cafe", "Bakery"],
  },
  {
    label: "Teaspoon",
    value: "tsp",
    categories: ["Restaurant", "Cafe", "Bakery"],
  },

  // Length
  {
    label: "Meter (m)",
    value: "m",
    categories: ["Hardware", "Retail", "Clothing"],
  },
  {
    label: "Centimeter (cm)",
    value: "cm",
    categories: ["Hardware", "Clothing", "Retail"],
  },
  {
    label: "Inch (in)",
    value: "in",
    categories: ["Hardware", "Retail", "Furniture"],
  },
  { label: "Foot (ft)", value: "ft", categories: ["Hardware", "Retail"] },
  { label: "Yard (yd)", value: "yd", categories: ["Clothing", "Hardware"] },

  // Time / Services
  {
    label: "Hour",
    value: "hour",
    categories: [
      "Salon",
      "Spa",
      "Clinic",
      "Gym",
      "Legal",
      "Consulting",
      "Auto Repair",
    ],
  },
  { label: "Minute", value: "minute", categories: ["Salon", "Spa", "Clinic"] },
  {
    label: "Day",
    value: "day",
    categories: ["Hotel", "Motel", "Event Venue", "Car Wash"],
  },
  {
    label: "Service",
    value: "service",
    categories: ["Salon", "Spa", "Auto Repair", "Consulting"],
  },
  {
    label: "Appointment",
    value: "appointment",
    categories: ["Clinic", "Dental", "Veterinary", "Salon"],
  },
  {
    label: "Session",
    value: "session",
    categories: ["Gym", "Yoga Studio", "Tutoring", "Training Center"],
  },
  {
    label: "Treatment",
    value: "treatment",
    categories: ["Spa", "Clinic", "Dental"],
  },

  // Pharmacy / Medical
  { label: "Tablet", value: "tablet", categories: ["Pharmacy", "Veterinary"] },
  {
    label: "Capsule",
    value: "capsule",
    categories: ["Pharmacy", "Veterinary"],
  },
  {
    label: "Bottle",
    value: "bottle",
    categories: ["Pharmacy", "Cosmetics", "Grocery"],
  },
  { label: "Vial", value: "vial", categories: ["Pharmacy", "Veterinary"] },
  { label: "Tube", value: "tube", categories: ["Pharmacy", "Cosmetics"] },
  { label: "Patch", value: "patch", categories: ["Pharmacy"] },
  { label: "Dose", value: "dose", categories: ["Pharmacy", "Veterinary"] },
  { label: "Unit", value: "unit", categories: ["Pharmacy"] },
  { label: "International Unit (IU)", value: "iu", categories: ["Pharmacy"] },

  // Digital / Media
  {
    label: "License Key",
    value: "license",
    categories: ["Electronics", "Consulting", "Training Center"],
  },
  {
    label: "Subscription",
    value: "subscription",
    categories: ["Gym", "Coworking Space", "Consulting"],
  },
  {
    label: "Download",
    value: "download",
    categories: ["Electronics", "Bookstore"],
  },
];

// src/data/constants.ts

// ... existing uomOptions ...

// Set of UOM values that should NOT track inventory by default
export const nonInventoryUOMs = new Set([
  "hour",
  "minute",
  "second",
  "day",
  "week",
  "month",
  "service",
  "appointment",
  "session",
  "treatment",
  "license",
  "subscription",
  "download",
  "stream",
]);
