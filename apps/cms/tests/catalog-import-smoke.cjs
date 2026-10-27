/** Run the real Python importer against an isolated copy of this CMS and SQLite. */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const cms = path.resolve(__dirname, '..');
  const importer = path.resolve(cms, '../catalog-importer');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-cms-smoke-'));
  for (const entry of ['config', 'src', 'tsconfig.json', 'package.json']) {
    fs.cpSync(path.join(cms, entry), path.join(temporary, entry), { recursive: true });
  }
  fs.symlinkSync(path.join(cms, 'node_modules'), path.join(temporary, 'node_modules'), 'dir');
  fs.mkdirSync(path.join(temporary, 'public', 'uploads'), { recursive: true });
  Object.assign(process.env, {
    NODE_ENV: 'test', DATABASE_CLIENT: 'sqlite', DATABASE_FILENAME: '.tmp/smoke.db',
    HOST: '127.0.0.1', PORT: '0', STRAPI_TELEMETRY_DISABLED: 'true',
    APP_KEYS: crypto.randomBytes(32).toString('hex'), ADMIN_JWT_SECRET: crypto.randomBytes(32).toString('hex'),
    JWT_SECRET: crypto.randomBytes(32).toString('hex'), API_TOKEN_SALT: crypto.randomBytes(32).toString('hex'),
    TRANSFER_TOKEN_SALT: crypto.randomBytes(32).toString('hex'), ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
  });
  process.chdir(temporary);
  const directories = await compileStrapi({ appDir: temporary });
  const app = createStrapi(directories);
  let loaded = false;
  try {
    await app.load();
    loaded = true;
    await new Promise((resolve, reject) => {
      app.server.httpServer.once("error", reject);
      app.server.listen(0, "127.0.0.1", resolve);
    });
    const token = await app.admin.services['api-token'].create({ name: 'isolated-import-test', type: 'full-access', lifespan: null });
    const address = app.server.httpServer.address();
    const code = await new Promise((resolve, reject) => {
      const child = spawn(path.join(importer, '.venv/bin/python'), [path.join(importer, 'tests/live_smoke.py'), temporary], {
        cwd: importer,
        env: { ...process.env, PYTHONPATH: importer, STRAPI_URL: `http://127.0.0.1:${address.port}`, STRAPI_TOKEN: token.accessKey, STRAPI_PUBLICATION_STATUS: 'draft' },
        stdio: 'inherit',
      });
      child.on('error', reject);
      child.on('exit', resolve);
    });
    if (code !== 0) throw new Error(`Importer smoke test failed with exit ${code}; isolated files: ${temporary}`);
    const categoryCode = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [path.resolve(cms, '../web/tests/category-live.cjs')], {
        env: { ...process.env, STRAPI_URL: `http://127.0.0.1:${address.port}`, NEXT_PUBLIC_STRAPI_URL: `http://127.0.0.1:${address.port}`, STRAPI_READ_TOKEN: token.accessKey },
        stdio: 'inherit',
      });
      child.on('error', reject);
      child.on('exit', resolve);
    });
    if (categoryCode !== 0) throw new Error(`Category navigation test failed: ${categoryCode}`);
  } finally {
    if (loaded) await app.destroy();
  }
  console.log(`Isolated test artifacts: ${temporary}`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
