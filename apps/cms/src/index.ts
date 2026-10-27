import type { Core } from '@strapi/strapi';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
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
