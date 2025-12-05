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
    deactivate: (id: string) => `/employees/${id}`,
  },

  users: {
    base: '/users',
    create: '/users',
    findAll: '/users',
    findOne: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
  },

  inventory: {
    base: '/inventory',
    create: '/inventory',
    findAll: '/inventory',
    findOne: (id: number) => `/inventory/${id}`,
    update: (id: number) => `/inventory/${id}`,
  },

  coupons: {
    base: '/coupons',
    create: '/coupons',
    findAll: '/coupons',
    findOne: (id: string) => `/coupons/${id}`,
    update: (id: string) => `/coupons/${id}`,
  },

  sales: {
    base: '/sales',
    create: '/sales',
    addItem: (id: string) => `/sales/${id}/add-item`,
    finalize: (id: string) => `/sales/${id}/finalize`,
  },

  rentals: {
    base: '/rentals',
    create: '/rentals',
    addItem: (id: string) => `/rentals/${id}/add-item`,
    finalize: (id: string) => `/rentals/${id}/finalize`,
  },

  returns: {
    base: '/returns',
    returnSale: '/returns/sale',
    returnRental: '/returns/rental',
  },

  reports: {
    sales: '/reports/sales',
    rentals: '/reports/rentals',
    inventory: '/reports/inventory',
  },
} as const;

export type ApiEndpoints = typeof API;
