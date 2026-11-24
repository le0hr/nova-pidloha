import type { Core } from '@strapi/strapi';
import { configureCheckoutAdmin } from './checkout/admin';
import { cancelOrder, confirmOrder, reconcilePending, remindHolds } from './checkout/orders';
import { startPolling } from './checkout/telegram';
import { syncManagerRole } from './manager-role';
import { seedAboutPage } from './about-page';
import { applyAdminLabels } from './admin-labels';
import { registerKind, seedCategoryKinds } from './kind';
import { registerIdentity, seedTitles } from './identity';
import { registerPrice } from './price';
import { applyAdminLayout } from './admin-layout';

let stopTelegram = () => {};

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    registerKind(strapi);
    registerPrice(strapi);
    registerIdentity(strapi);
    // Checkout data is never exposed through the catalog GraphQL API.
    const extension = strapi.plugin('graphql')?.service('extension');
    for (const uid of ['api::order.order', 'api::payment-attempt.payment-attempt']) extension?.shadowCRUD(uid).disable();
  },

  destroy() {
    stopTelegram();
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await configureCheckoutAdmin(strapi);
    await syncManagerRole(strapi);
    await seedAboutPage(strapi);
    await seedCategoryKinds(strapi);
    await seedTitles(strapi);
    await applyAdminLabels(strapi);
    await applyAdminLayout(strapi);
    // One-off maintenance scripts (STRAPI_SCRIPT=1, scripts/*.js) load Strapi next to the running CMS:
    // no second payment cron and no second Telegram poller (one bot token can be polled only once).
    const script = process.env.STRAPI_SCRIPT === '1';
    if (!script) strapi.cron.add({ checkoutPayments: { task: async () => { await reconcilePending(strapi); await remindHolds(strapi); }, options: { rule: '*/5 * * * *' } } });
    // Manager buttons in Telegram: confirm (captures the card hold) / cancel (releases it). Not in tests: no token there.
    if (process.env.NODE_ENV !== 'test' && !script) stopTelegram = startPolling(strapi, {
      confirm: (number, who) => confirmOrder(strapi, number, who),
      cancel: (number, who) => cancelOrder(strapi, number, who),
    });
    const role = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });
    if (!role) return;

    const permissions = strapi.db.query('plugin::users-permissions.permission');
    // Homepage settings, add-ons and door parameters follow the existing public catalog access.
    const productRead = await permissions.findOne({
      where: { role: role.id, action: 'api::product.product.find' },
    });
    if (!productRead) return;

    for (const action of ['api::edge.edge.find', 'api::opening-side.opening-side.find', 'api::construction.construction.find',
      'api::architrave-type.architrave-type.find', 'api::global.global.find', 'api::about-page.about-page.find']) {
      const existing = await permissions.findOne({ where: { role: role.id, action } });
      if (!existing) {
        await permissions.create({ data: { role: role.id, action } });
      }
    }
  },
};
