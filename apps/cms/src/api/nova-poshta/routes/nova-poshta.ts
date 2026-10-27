export default {
  routes: [
    {
      method: 'GET',
      path: '/nova-poshta/cities',
      handler: 'nova-poshta.cities', // controller.method
      config: {
        auth: false, 
        // policies: [],
        // middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/nova-poshta/warehouses',
      handler: 'nova-poshta.warehouses',
      config: {
        auth: false,
      },
    },
  ],
};