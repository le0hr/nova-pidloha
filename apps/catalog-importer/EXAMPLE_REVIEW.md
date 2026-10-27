# Review of example.xlsx

The parser recognizes the current personnel layout without changing its headers.
Row 1 holds merged section labels; row 2 holds headers. Двері contains two products
(1020 / Loft Plato / Korfad, 1050 / Bariano / Leador) and 58 variation rows. It also
contains one short description, two characteristics, one add-on and one variation
filter. Підлога contains the incomplete product 2001 and copied door side-section data.

The workbook cannot safely be imported as-is. Fix the source values below according
to your catalog; the importer will not choose which IDs/values you intended.

| Sheet | Cells/rows | Problem |
| --- | --- | --- |
| Двері | row 8 vs 3 | Same product and all four variation attributes |
| Двері | rows 18 and 22 vs 13 | Same product and all four variation attributes |
| Двері | row 31 vs 27 | Same product and all four variation attributes |
| Двері | row 37 vs 32 | Same product and all four variation attributes |
| Двері | rows 47 and 51 vs 42 | Same product and all four variation attributes |
| Двері | row 60 vs 56 | Same product and all four variation attributes |
| Підлога | D3 | Product 2001 has no name |
| Підлога | I3, L3, L4 | ID 1020 refers to the door sheet, not floor product 2001 |
| Підлога | P2:P3 | Filter references door variation 102001; floor has no variations. If it is a product filter, change heading to ID товару and enter the intended floor ID. |
| Двері | Фото cells | Referenced local files under фото/LoftPlato and фото/Bariano are absent |
| Підлога | G3 | `підлога /фото.jpg` must exist exactly as written, including the space, or the cell needs correction |

The copied floor description/characteristic/filter text also describes a door; replace
it with the intended floor data, or clear the unwanted side-section rows. Merely changing
an ID does not make the copied text accurate.

For duplicates, either correct the missing distinguishing attribute or remove the
unintended duplicate variation. Never change IDs just to bypass combination validation.
The importer does not delete existing CMS records when rows are removed.

Place images under the workbook directory, correct paths, or clear a photo cell if
no photo is intended. Repeated paths share a single upload. Missing photos are errors.

After corrections:

```sh
.venv/bin/python main.py validate example.xlsx
STRAPI_PUBLICATION_STATUS=published .venv/bin/python main.py plan example.xlsx
STRAPI_PUBLICATION_STATUS=published .venv/bin/python main.py import example.xlsx
```
