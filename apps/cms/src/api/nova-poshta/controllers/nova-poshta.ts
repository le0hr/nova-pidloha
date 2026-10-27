import type { Context } from "koa";

export default {

  async cities(ctx: Context) {
    try {
      const q = (ctx.query.q as string) || '';
      const limit = Math.min(Number(ctx.query.limit) || 20, 50);

      const cities = await strapi
        .service('api::nova-poshta.nova-poshta')
        .getCities(q, limit);

      ctx.body = cities.map((city: any) => ({
        ref: city.Ref,
        name: city.Description,
        nameRu: city.DescriptionRu,
        area: city.AreaDescription,
        settlementType: city.SettlementTypeDescription,
      }));
    } catch (error: any) {
      strapi.log.error('[NP cities]', error);
      ctx.throw(400, error.message || 'Failed to fetch cities');
    }
  },

  async warehouses(ctx: Context) {
    try {
      const cityRef = (ctx.query.cityRef as string) || '';
      const limit = Math.min(Number(ctx.query.limit) || 500, 1000);

      if (!cityRef) {
        return ctx.throw(400, 'cityRef is required');
      }

      const warehouses = await strapi
        .service('api::nova-poshta.nova-poshta')
        .getWarehouses(cityRef, limit);

      ctx.body = warehouses.map((w: any) => ({
        ref: w.Ref,
        description: w.Description,
        shortAddress: w.ShortAddress,
        number: w.Number,
        cityRef: w.CityRef,
        cityDescription: w.CityDescription,
        phone: w.Phone,
        schedule: w.Schedule,
      }));
    } catch (error: any) {
      strapi.log.error('[NP warehouses]', error);
      ctx.throw(400, error.message || 'Failed to fetch warehouses');
    }
  },
};