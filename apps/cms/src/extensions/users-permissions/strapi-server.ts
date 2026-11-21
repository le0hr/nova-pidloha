/**
 * The site has no customer accounts (orders go without sign-up), so the empty "User" collection is hidden from the
 * Content Manager. The plugin itself stays: its Public role is what lets the website read the catalog API.
 */
export default (plugin: any) => {
  const schema = plugin.contentTypes?.user?.schema;
  if (schema) schema.pluginOptions = { ...schema.pluginOptions, 'content-manager': { ...schema.pluginOptions?.['content-manager'], visible: false } };
  return plugin;
};
