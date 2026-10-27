# XLSX → Nova Pidloha CMS

Python 3.12+ importer for the Strapi 5 schemas in `../cms`. The exact personnel
workbook is `example.xlsx`; its original contents are never changed by the importer.

## Run

Restart/rebuild CMS first so the additive schema changes are loaded:

```sh
cd /home/levhr/nova-pidloha/apps/cms
npm run develop
```

In another terminal:

```sh
cd /home/levhr/nova-pidloha/apps/catalog-importer
python3 -m venv .venv
.venv/bin/pip install -e '.[dev]'
cp .env.example .env
# Edit .env: set STRAPI_URL and STRAPI_TOKEN.
.venv/bin/python main.py inspect example.xlsx
.venv/bin/python main.py validate example.xlsx
.venv/bin/python main.py plan example.xlsx
c
```

If `.venv` and `.env` already exist, reuse them; do not overwrite your token.
Create a Strapi Content API token with find/create/update rights for categories,
brands, decors, decor-colors, decor-glasses, filter-groups, filter-codes,
architrave-types, products, product-variations, and Upload find/findPage/upload.
A Full access Content API token works. An admin login token is not a Content API token.

The default is **draft**. To import and publish all valid records:

```sh
STRAPI_PUBLICATION_STATUS=published .venv/bin/python main.py import example.xlsx
```

The entire workbook, including all sheets and photos, is validated before any
network request. The current example intentionally does **not** pass validation;
see [EXAMPLE_REVIEW.md](EXAMPLE_REVIEW.md) for exact corrections it needs. The command
will abort until those data problems are resolved. There is no force/skip-errors flag.

## Actual workbook layout

Headers are discovered by name, not by fixed columns, rows, or sheet names.
The current workbook contains:

* `Двері`: combined product/variation table, plus independent description,
  characteristics, add-ons, and variation filter tables, each with its own height.
  Repeated consistent product details are consolidated within this combined table.
* `Підлога`: product table with package area and package price, description,
  characteristics, and filters. Products do not need variations.

Merged section titles above headers provide context. For example `Назва` means
an add-on name under `Додатки`, and a filter name under `Фільтри`. `Характеристика`
is a value when paired with `Назва характеристики`. Untitled explicit English
headers (`product_id | characteristic | value`) are supported too.

`Клас` maps to category in product tables and group in add-on tables.
`Короткий опис товару` maps to shortDescription. `Ціна пачки` maps to product price;
`Площа в пачці` is retained as a dynamic product attribute. Sheet names supply root
categories, with classes/subpaths creating child categories.

## Dynamic attributes

`ID Варіації | Декор | Колір | Скло | Ціна`

**Every column between ID Варіації and Ціна is discovered dynamically.** Add
`Тип замка` or another attribute before price without changing Python or CMS code.
Zero or many attributes are supported. Empty values are omitted. Original display
names and normalized keys are both retained. Columns after price are reserved
metadata, such as Фото, SKU, Активний, note and supplier_code.

The exact workbook uses `Тип покриття | Покриття | Скло | Кромка (або назва додаткового параметру)`.
The first three also populate existing CMS decor/decor_color/decor_glass relations.
Кромка also populates variation.architrave_types. All attributes remain in catalog_attributes.
The existing storefront configurator currently uses only its three known relations;
using arbitrary new attributes in that UI is separate frontend work.

Product ID and product metadata belong before Variation ID. Repeat full consistent
product details on variation rows, or enter the name once and leave continuation
metadata blank. Repeat the product ID, or merge that ID vertically; arbitrary blank
IDs are never guessed. In combined tables active/image belong to the variation.
The product is active when at least one of its variations is active. Separate product
tables may explicitly set product active/image/price.

Headers ignore case, repeated/outer spaces and apostrophe variants. Add aliases with
`HEADER_ALIASES={"price":["Вартість"]}`. Configure normalized attribute keys with
`ATTRIBUTE_KEYS={"Колір":"color"}`. Unknown attributes generate Unicode snake_case.
`SKU_IS_VARIATION_ID=true` enables SKU as the identifier explicitly. Ambiguous or
reserved-looking typos fail with suggestions; headers are never silently corrected.

Keep Excel IDs as Text to preserve leading zeros and long IDs. Numeric 102001.0
becomes "102001". Prices use Decimal, accept decimal commas, and cannot be negative;
add-on price_delta may be signed. Formulas and Excel error values must be replaced
with verified values. Blank variation rows produce warnings. Hidden rows are included.

## Exact CMS mapping

The adapter is isolated in `app/strapi/mapping.py`. It uses existing schemas and
relations, plus the additive schema changes included in this work:

| Workbook data                                                | CMS destination                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Product ID / Variation ID                                    | unique string external_id on products/product-variations                        |
| Sheet / Клас                                             | categories hierarchy → product.category                                        |
| Бренд                                                   | brands → product.brand                                                         |
| Назва / short description                               | product.name / shortDescription                                                 |
| Ціна пачки                                          | product.price                                                                   |
| Variation price                                              | product-variation.price (existing string schema)                                |
| Product price when variations exist                          | minimum active variation price                                                  |
| Тип покриття / Декор                         | decors → variation.decor                                                       |
| Покриття / Колір                                | decor-colors, scoped to decor → variation.decor_color                          |
| Скло                                                     | decor-glasses → variation.decor_glass                                          |
| Every dynamic attribute                                      | catalog_attributes JSON + attribute_definitions JSON                            |
| Characteristics                                              | repeatable catalog.characteristic component on product                          |
| Add-on Клас / Назва / Збільшення ціни | architrave-types group/name/additionalCost                                      |
| Add-ons                                                      | product.addons and each related variation.addons                                |
| Filters                                                      | filter-groups/filter-codes → product.filter_values and variation.filter_values |
| Фото                                                     | uploaded media ID → image relation                                             |
| Активний                                             | active boolean                                                                  |

Filter groups link to the appropriate category; variation filters also reach the
parent product so the existing product catalog filtering can use them. Shared filter
groups retain other categories absent from this workbook. Existing collection names,
relations, media types, and Draft & Publish remain enabled. No legacy fields were removed.

Stable IDs are added as optional unique fields, so existing records need not have
IDs immediately. Named taxonomy records are reused only on an unambiguous name/scope
match. Existing product/variation IDs must be backfilled explicitly; Strapi internal
IDs are never interpreted as workbook IDs. An unkeyed same-name product fails planning
rather than creating a likely duplicate. Legacy variations cannot be reliably matched
from their attributes: assign their external_id before the first import. Existing
slugs are preserved; new slugs use stable catalog IDs. Renaming an Excel product does
not change its identity or URL.

## Photos

Embedded XLSX pictures are supported when their top-left corner is anchored in the
`Фото` column on a product or variation data row (one-cell and two-cell anchors).
In combined tables the picture belongs to that row's variation; it is not copied
to nearby rows even if it visually spans several rows. Use one image per photo cell.
A picture together with a text path, multiple pictures in one cell, or pictures
outside recognized photo data cells fail validation rather than being silently ignored.
Excel IMAGE formulas and rich-value in-cell images are not supported by this reader.

Images are extracted without changing the workbook into `.catalog-media/` beside
it. Keep that directory available through planning and import; it can be removed
after import and will be recreated on the next parse. Extracted images use the
same content-hash upload deduplication as local files. Offline validation may
create this cache but never uploads images.

Local paths such as `фото/LoftPlato/image.jpeg` are relative to the workbook directory
(or IMAGE_ROOT). Paths cannot escape that directory. Supply the files before import;
missing or unreadable images fail offline validation. A blank photo cell leaves an
existing media relation unchanged. To reuse media already in Strapi, use its exact
`/uploads/...` URL. External image URLs are not downloaded.

Plan fetches media metadata without uploading. Import uploads each content hash once
under a deterministic filename and assigns Strapi's numeric media ID, not a path
string. Repeated imports reuse the upload. Files are checked again before writes.
Uploads happen first and may remain orphaned if a later operation fails; the journal
identifies them. No automatic media deletion or retry is performed.

## Safety and recovery

`inspect` and `validate` are offline. `plan` sends only GET requests; uploads are writes
and never happen in plan. `import` creates the complete validated plan, then writes
media, categories and other dependencies before products/variations. Duplicate IDs,
conflicting product metadata, invalid prices,
missing references, cross-category copied references and malformed headings abort.
Variations with distinct IDs may share the same attributes and have different prices;
matching attribute combinations produce warnings and all variations are retained.

The client reads both draft and published documents by documentId, so existing drafts
are not duplicated. Publication is explicit via STRAPI_PUBLICATION_STATUS. Setting
published also updates previously imported drafts. active=false is data, not an
unpublish operation; consumers must respect the active field.

Absence never triggers DELETE or archiving. Included workbook entities are authoritative
for their mapped fields and collections, except omitted photos and preserved slugs.
Use active=false to mark a record inactive. Run one importer at a time and prevent
concurrent edits; REST cannot close the snapshot/write race.

REST cannot guarantee all-or-nothing catalog transactions. Import stops immediately
on failure, never retries a potentially committed POST, and writes an fsynced private
`import-runs/<uuid>.jsonl` plan and operation journal. After a timeout, inspect CMS and
the journal, then build a fresh plan. Do not replay old POSTs. For strict atomic
publication, a server-side transactional/staging endpoint is required. Protect journals
as business data; they contain previous values but never API tokens.

Reference: [Strapi status](https://docs.strapi.io/cms/api/rest/status),
[relations](https://docs.strapi.io/cms/api/rest/relations),
[uploads](https://docs.strapi.io/cms/api/rest/upload).

## Verification

```sh
.venv/bin/python -m pytest -q
.venv/bin/ruff check app tests main.py
.venv/bin/mypy app tests main.py
../cms/node_modules/.bin/tsc --project ../cms/tsconfig.json --noEmit --incremental false
# Real CMS in a disposable /tmp copy; never opens the deployment database:
node ../cms/tests/catalog-import-smoke.cjs
```

Tests read `example.xlsx` unchanged and assert its real validation failures. Other
tests repair only a temporary copy to exercise all fields and relations. HTTP contract
tests check payload fields against actual CMS JSON schemas. The optional live smoke
requires CMS Linux-compatible native dependencies (sharp and better-sqlite3).

Filter group and value slugs preserve Cyrillic names (for example, `колір` and
`колір-дуб-білений`). Importing updates existing filter slugs to this format;
value slugs include their group name. Restart the CMS with the updated schemas
before importing, so Cyrillic slugs are accepted.

Add-on tables can use `ID варіації` instead of `ID товару` to attach each
add-on only to that variation through its addons relation. Product-level add-ons still apply to all of the
product's variations. Adjacent add-on and filter tables are parsed independently,
including when their row counts differ.

`Кромка` (including headings with parenthesized instructions) maps to
`variation.architrave_types`; the independent add-on table maps to
`variation.addons`. Both relations target Extra records but remain separate.
