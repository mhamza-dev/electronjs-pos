export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image?: string;
}

export const mockProducts: Product[] = [
  { id: 1, name: "Double Espresso", category: "Coffee", price: 3.50 },
  { id: 2, name: "Caffe Latte", category: "Coffee", price: 4.50 },
  { id: 3, name: "Cappuccino", category: "Coffee", price: 4.50 },
  { id: 4, name: "Croissant", category: "Bakery", price: 3.20 },
  { id: 5, name: "Pain au Chocolat", category: "Bakery", price: 3.80 },
  { id: 6, name: "Blueberry Muffin", category: "Bakery", price: 3.50 },
  { id: 7, name: "Fresh Orange Juice", category: "Drinks", price: 5.00 },
  { id: 8, name: "Mineral Water", category: "Drinks", price: 2.00 },
  { id: 9, name: "Green Tea", category: "Drinks", price: 3.00 },
  { id: 10, name: "Club Sandwich", category: "Food", price: 8.50 },
  { id: 11, name: "Caesar Salad", category: "Food", price: 9.00 },
  { id: 12, name: "Pasta Carbonara", category: "Food", price: 12.50 },
];
