import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: { origin: env.array('CORS_ORIGINS', ['http://localhost:3000', 'http://localhost:1337']) },
  },
  'strapi::poweredBy',
  'strapi::query',
  { name: 'strapi::body', config: { formidable: { maxFileSize: 100 * 1024 * 1024 } } },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
