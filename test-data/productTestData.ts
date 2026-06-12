/**
 * Test Data for Products/Dashboard
 */

export const productTestData = {
  products: [
    {
      name: 'Sauce Labs Backpack',
      price: 29.99,
      id: 'inventory_item_1',
    },
    {
      name: 'Sauce Labs Bike Light',
      price: 9.99,
      id: 'inventory_item_2',
    },
    {
      name: 'Sauce Labs Bolt T-Shirt',
      price: 15.99,
      id: 'inventory_item_3',
    },
    {
      name: 'Sauce Labs Fleece Jacket',
      price: 49.99,
      id: 'inventory_item_4',
    },
    {
      name: 'Sauce Labs Onesie',
      price: 7.99,
      id: 'inventory_item_5',
    },
    {
      name: 'Test.allTheThings() T-Shirt (Red)',
      price: 15.99,
      id: 'inventory_item_6',
    },
  ],

  sortOptions: {
    nameAscending: 'az',
    nameDescending: 'za',
    priceAscending: 'lohi',
    priceDescending: 'hilo',
  },

  messages: {
    cartEmpty: 'Your cart is empty',
    checkoutSuccess: 'Thank you for your order',
    cartUpdated: 'Cart updated',
  },
};

export default productTestData;
