import type { Core } from "@strapi/strapi";
interface NovaPoshtaResponse<T> {
  success: boolean;
  data: T;
  errors: string[];
}
export default ({ strapi }: { strapi: Core.Strapi }) => ({

  async request(
    modelName: string,
    calledMethod: string,
    methodProperties: Record<string, any> = {}
  ) {
    const apiKey = process.env.NP_API_KEY;
    if (!apiKey){
      throw new Error('NP_API_KEY is not configured');
    }

    const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        modelName,
        calledMethod,
        methodProperties,
      }),
    });

    if (!response.ok) {
      throw new Error(`Nova Poshta request failed (HTTP ${response.status})`);
    }

    const json = (await response.json()) as NovaPoshtaResponse<unknown>;

    if (!json.success) {
      const message = Array.isArray(json.errors)
        ? json.errors.join('; ')
        : 'Nova Poshta API error';
      strapi.log.error(`[NovaPoshta] ${message}`, json.errors);
      throw new Error(message);
    }

    return json.data; 
  },

  async getCities(query: string, limit = 20) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return this.request('Address', 'getCities', {
      FindByString: query.trim(),
      Limit: limit,
    });
  },

  async getWarehouses(cityRef: string, limit = 500) {
    if (!cityRef) {
      return [];
    }

    return this.request('Address', 'getWarehouses', {
      CityRef: cityRef,
      Limit: limit,
    });
  },


});