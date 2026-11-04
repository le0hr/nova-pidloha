export default {
  routes: [
    {method: 'POST', path: '/checkout/draft', handler: 'checkout.save', config: {auth: false}},
    {method: 'POST', path: '/checkout/submit', handler: 'checkout.submit', config: {auth: false}},
    {method: 'POST', path: '/checkout/retry', handler: 'checkout.retry', config: {auth: false}},
    {method: 'GET', path: '/checkout/status', handler: 'checkout.status', config: {auth: false}},
    {method: 'POST', path: '/checkout/liqpay/callback', handler: 'checkout.callback', config: {auth: false}},
  ],
};
