
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export async function getCategories(): Promise<Category[]> {
  // Mock data for now - replace with actual Supabase call when ready
  return [
    { id: '1', name: 'Fruits & Vegetables', description: 'Fresh produce', image: '/placeholder.svg' },
    { id: '2', name: 'Dairy & Eggs', description: 'Milk, cheese, eggs', image: '/placeholder.svg' },
    { id: '3', name: 'Meat & Seafood', description: 'Fresh meat and fish', image: '/placeholder.svg' },
    { id: '4', name: 'Bakery', description: 'Bread and baked goods', image: '/placeholder.svg' },
    { id: '5', name: 'Pantry', description: 'Dry goods and essentials', image: '/placeholder.svg' },
    { id: '6', name: 'Beverages', description: 'Drinks and beverages', image: '/placeholder.svg' },
  ];
}
