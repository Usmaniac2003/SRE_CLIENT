export const API = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },

  employees: {
    base: '/employees',
    create: '/employees',
    findAll: '/employees',
    findOne: (id: string) => `/employees/${id}`,
    update: (id: string) => `/employees/${id}`,
    toggleStatus: (id: string) => `/employees/${id}/toggle-status`,
    delete: (id: string) => `/employees/${id}`,
  },

  users: {
    base: '/users',
    create: '/users',
    findAll: '/users',
    findOne: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },

  inventory: {
    base: '/inventory',
    create: '/inventory',
    findAll: '/inventory',
    findOne: (id: number) => `/inventory/${id}`,
    update: (id: number) => `/inventory/${id}`,
    delete: (id: number) => `/inventory/${id}`,
  },

  coupons: {
    base: '/coupons',
    create: '/coupons',
    findAll: '/coupons',
    findOne: (id: string) => `/coupons/${id}`,
    update: (id: string) => `/coupons/${id}`,
    delete: (id: string) => `/coupons/${id}`,
  },

  sales: {
    base: '/sales',
    create: '/sales',
    getOne: (id: string) => `/sales/${id}`,
    addItem: (id: string) => `/sales/${id}/add-item`,
    removeItem: (saleId: string, itemId: string) => `/sales/${saleId}/items/${itemId}`,
    finalize: (id: string) => `/sales/${id}/finalize`,
    cancel: (id: string) => `/sales/${id}/cancel`,
  },

  rentals: {
    base: '/rentals',
    create: '/rentals',
    getOne: (id: string) => `/rentals/${id}`,
    addItem: (id: string) => `/rentals/${id}/add-item`,
    removeItem: (rentalId: string, itemId: string) => `/rentals/${rentalId}/items/${itemId}`,
    finalize: (id: string) => `/rentals/${id}/finalize`,
    return: (id: string) => `/rentals/${id}/return`,
    cancel: (id: string) => `/rentals/${id}/cancel`,
  },

  returns: {
    base: '/returns',
    getOne: (id: string) => `/returns/${id}`,
    returnSale: '/returns/sale',
    returnRental: '/returns/rental',
    calculateLateFee: (rentalId: string) => `/returns/calculate-late-fee/${rentalId}`,
  },

  reports: {
    sales: '/reports/sales',
    rentals: '/reports/rentals',
    inventory: '/reports/inventory',
  },
} as const;

export type ApiEndpoints = typeof API;
