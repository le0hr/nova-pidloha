// Execute the actual TS modules without adding a test framework dependency.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function loader(mocks = {}) {
  const modules = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (modules.has(filename)) return modules.get(filename).exports;
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    }}).outputText;
    const mod = { exports: {} };
    modules.set(filename, mod);
    function localRequire(name) {
      if (name in mocks) return mocks[name];
      if (name.startsWith('@/') || name.startsWith('.')) {
        const base = name.startsWith('@/') ? path.join(__dirname, '../src', name.slice(2)) : path.resolve(path.dirname(filename), name);
        const resolved = ['.ts', '.tsx', ''].map(ext => base + ext).find(file => fs.existsSync(file));
        if (!resolved) throw new Error(`Cannot resolve ${name}`);
        return load(resolved);
      }
      return require(name);
    }
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, {filename})(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}
module.exports = { loader };
