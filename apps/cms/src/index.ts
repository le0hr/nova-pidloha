import type { Core } from '@strapi/strapi';
import { configureCheckoutAdmin } from './checkout/admin';
import { cancelOrder, confirmOrder, reconcilePending, remindHolds } from './checkout/orders';
import { startPolling } from './checkout/telegram';

let stopTelegram = () => {};

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Checkout data is never exposed through the catalog GraphQL API.
    const extension = strapi.plugin('graphql')?.service('extension');
    for (const uid of ['api::order.order', 'api::payment-attempt.payment-attempt']) extension?.shadowCRUD(uid).disable();
  },

  destroy() {
    stopTelegram();
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await configureCheckoutAdmin(strapi);
    strapi.cron.add({ checkoutPayments: { task: async () => { await reconcilePending(strapi); await remindHolds(strapi); }, options: { rule: '*/5 * * * *' } } });
    // Manager buttons in Telegram: confirm (captures the card hold) / cancel (releases it). Not in tests: no token there.
    if (process.env.NODE_ENV !== 'test') stopTelegram = startPolling(strapi, {
      confirm: (number, who) => confirmOrder(strapi, number, who),
      cancel: (number, who) => cancelOrder(strapi, number, who),
    });
    const role = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });
    if (!role) return;

    const permissions = strapi.db.query('plugin::users-permissions.permission');
    // Homepage settings and add-ons follow the existing public catalog access.
    const productRead = await permissions.findOne({
      where: { role: role.id, action: 'api::product.product.find' },
    });
    if (!productRead) return;

    for (const action of ['api::architrave-type.architrave-type.find', 'api::global.global.find']) {
      const existing = await permissions.findOne({ where: { role: role.id, action } });
      if (!existing) {
        await permissions.create({ data: { role: role.id, action } });
      }
    }
  },
};
