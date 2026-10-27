# Homepage banners

The first slide is always the shop map, with these two locations:
- 49.438958423807314, 32.05061177492442
- 49.42909246799387, 32.00709050070083

It uses the original full-width banner layout. Click **Знайти магазини** to pan, zoom, select a shop pin, and open directions. Automatic rotation pauses while the map is interactive.

In **Strapi → Content Manager → Single Types → Global**:

- The permanent map uses hardcoded Ukrainian text, titled **Наші магазини**.
- **heroSlides**: add and reorder additional banners using **kind: promotion**. Configure title, description, mobile text, formatted **body**, sale **badge**, desktop **image**, optional **mobileImage**, text **alignment**, and two buttons. Empty buttons are hidden.
- Disable a slide with **enabled**. **heroEnabled** controls additional banners only; it never removes the permanent map.
- Save and **Publish**, then reload the storefront. Banner settings are fetched fresh on each page request. Drafts are not displayed.

Promotional slides come only from the CMS. If the list is empty or the CMS is unavailable, only the permanent map appears. Legacy CMS map slides are ignored.

The carousel advances every 7 seconds. Visitors can use arrows, dots, left/right keyboard arrows, and horizontal swipes. A thin red progress bar tracks the seven-second banner duration and pauses with rotation. Rotation pauses on hover, keyboard focus, hidden browser tabs, or interactive map use. Reduced-motion preferences disable automatic rotation.

Map tiles are loaded directly from OpenStreetMap with visible attribution. Pin coordinates are in `src/lib/catalog/shop-locations.ts`.
