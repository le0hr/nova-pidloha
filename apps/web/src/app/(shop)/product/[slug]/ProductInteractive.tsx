"use client";

import { useMemo, useState } from "react";
import { selectedAddons } from "@/lib/catalog/addons";
import AccessoriesSection from "@/components/product/AccesoriesSelector";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductGallery from "@/components/product/ProductGallery";
import VariationSelector from "@/components/product/DoorVariationSelector";
import type { VariationState } from "@/types/product";
import TableVariationSelector from "@/components/product/TableVariationSelector";
import { extraFields, attributeValue, visibleExtraFields, galleryLooks, lookImage } from "@/lib/catalog/variations";
import FloorConfigurator from "@/components/product/FloorConfigurator";
import type { ProductVariation } from "@/types/product";
import { ProductReturnData } from "@/types/product";
import { boardSize, packArea, packsFor } from "@/lib/catalog/floor";
import { allowedValues, nearestStandard, rulesFor, sizeKeys, sizeOf, sizePercent, sizedPrice, snapSize, standardFromCharacteristics,
  standardSizes, variationForSize, type Size } from "@/lib/catalog/sizing";

const NO_ACCENT = "Без скла";

const variationKey = (variation: Pick<VariationState, "decor" | "decor_color" | "decor_glass">) =>
  JSON.stringify([variation.decor, variation.decor_color, variation.decor_glass]);

const toState = (variation: ProductVariation, previous?: VariationState): VariationState => ({
  decor: variation.decor?.name ?? "",
  decor_color: variation.decor_color?.name ?? "",
  decor_glass: variation.decor_glass?.name ?? NO_ACCENT,
  sizeMode: previous?.sizeMode ?? "standard",
  width: previous?.width ?? 750,
  height: previous?.height ?? 2050,
  image: variation?.image ?? null,
});

function buildOptions(variations: ProductVariation[], selection: VariationState) {
  const decor = new Set<string>();
  const colors = new Set<string>();
  const glasses = new Set<string>();

  variations.forEach((variation) => {
    const decorName = variation.decor?.name ?? "";
    const colorName = variation.decor_color?.name ?? "";
    const accentName = variation.decor_glass?.name?.trim() ?? "";
    if (decorName) decor.add(decorName);
    if (decorName === selection.decor && colorName) colors.add(colorName);
    if (decorName === selection.decor && colorName === selection.decor_color && accentName) glasses.add(accentName);
  });

  const sort = (values: Set<string>) => Array.from(values).sort((a, b) => a.localeCompare(b, "uk"));
  return { decor: sort(decor), decor_color: sort(colors), decor_glass: sort(glasses) };
}

export default function DynamicField({ product }: { product: ProductReturnData }) {
  const variations = product.variations;
  const [addonSelection, setAddonSelection] = useState<Record<string, string>>({});
  const category = product.category?.slug ?? "";

  const isFloor = category === "pidloha" || category.startsWith("pidloha-");
  const isMizhkimnatni = !isFloor;
  // Hardware (locks, handles, hinges) uses the same template with colour only: no size step.
  const isHardware = category === "furnitura" || category.startsWith("furnitura-");

  // Doors with sized variations (width/height in the supplier file): standard sizes are variations.
  const keys = useMemo(() => sizeKeys(variations), [variations]);
  const hasSizes = Boolean(keys.width || keys.height);
  const withSize = (state: VariationState, variation: ProductVariation): VariationState => {
    if (!hasSizes || state.sizeMode === "custom") return state;
    const size = sizeOf(variation, keys);
    return { ...state, width: size.width ?? state.width, height: size.height ?? state.height };
  };

  // Doors priced the same in every size: standard sizes from the characteristics.
  const isDoor = !isFloor && !isHardware;
  const fallbackStandard = useMemo(() => standardFromCharacteristics(product.characteristics), [product.characteristics]);
  const [selection, setSelection] = useState<VariationState>(() => {
    const state = toState(variations[0]);
    if (hasSizes) return withSize(state, variations[0]);
    const widths = fallbackStandard.width;
    return { ...state, width: widths.includes(800) ? 800 : widths[0], height: fallbackStandard.height[0] };
  });
  const [selectedSlug, setSelectedSlug] = useState(variations[0].slug);
  const selectedVariation = variations.find((variation) => variation.slug === selectedSlug) ?? variations[0];
  const addons = selectedVariation.addons ?? product.addons ?? [];
  const chosenAddons = selectedAddons(addons, addonSelection);
  // One gallery photo per look; another edge/size/side keeps the photo of the same colour.
  const gallery = galleryLooks(variations, selectedVariation);
  const options = useMemo(() => buildOptions(variations, selection), [variations, selection]);
  // Swatch photo of every colour of the chosen decor.
  const swatches = useMemo(() => Object.fromEntries(variations
    .filter((variation) => (variation.decor?.name ?? "") === selection.decor && variation.decor_color?.image)
    .map((variation) => [variation.decor_color!.name, variation.decor_color!.image!])), [variations, selection.decor]);
  const productName = product.name;
  const additionalCount = visibleExtraFields(variations, selectedVariation).length;
  const hasExtraAttributes = additionalCount > 0;
  const baseCount = Object.values(options).filter((values) => values.length > 0).length;
  // Lowest price per colour of the current decor (sizes and glass vary the price on their own).
  const colorPrices = new Map<string, number>();
  for (const row of variations) {
    if ((row.decor?.name ?? "") !== selection.decor) continue;
    const color = row.decor_color?.name ?? "";
    colorPrices.set(color, Math.min(colorPrices.get(color) ?? Infinity, Number(row.price)));
  }
  const colorNote = new Set(colorPrices.values()).size > 1 ? undefined : "(не впливає на ціну)";

  const selectVariation = (variation: ProductVariation) => {
    if (variation.slug !== selectedSlug) setAddonSelection({});
    setSelectedSlug(variation.slug);
    setSelection((current) => withSize(toState(variation, current), variation));
  };

  const updateSelection = (partial: Partial<VariationState>) => {
    const requested = { ...selection, ...partial };
    const exact = variations.filter((row) => variationKey(toState(row)) === variationKey(requested));
    const candidates = exact.length ? exact : variations.filter((row) => {
      const state = toState(row);
      return state.decor === requested.decor &&
        (Object.hasOwn(partial, "decor") || state.decor_color === requested.decor_color);
    });
    // Keep side, size and other choices when the decor/colour/glass changes, if such a row exists.
    const fields = [...extraFields(variations).map((field) => field.key), ...[keys.width, keys.height].filter((key): key is string => !!key)];
    const next = candidates.find((row) => row.slug === selectedSlug) ??
      candidates.find((row) => fields.every((key) => attributeValue(row, key) === attributeValue(selectedVariation, key))) ??
      candidates.find((row) => extraFields(variations).every((field) =>
        attributeValue(row, field.key) === attributeValue(selectedVariation, field.key))) ??
      candidates[0] ?? selectedVariation;
    if (next.slug !== selectedSlug) setAddonSelection({});
    setSelectedSlug(next.slug);
    setSelection(withSize(toState(next, requested), next));
  };

  // Size: standard values (variations or characteristics); non-standard only where the CMS has rules for it.
  const standard = hasSizes ? standardSizes(variations, selectedVariation) : null;
  const standards = {
    width: standard ? (keys.width ? standard.widths : []) : fallbackStandard.width,
    height: standard ? (keys.height ? standard.heights : []) : fallbackStandard.height,
  };
  const rules = {
    width: isDoor ? rulesFor(product.sizeRules, "width", selection.decor, selection.decor_color) : [],
    height: isDoor ? rulesFor(product.sizeRules, "height", selection.decor, selection.decor_color) : [],
  };
  const allowed = { width: allowedValues(standards.width, rules.width), height: allowedValues(standards.height, rules.height) };
  // Another decor may allow fewer sizes: the chosen size is always shown and priced rounded to what is allowed now.
  const chosenSize: Size = { width: snapSize(selection.width, allowed.width), height: snapSize(selection.height, allowed.height) };
  const percent = (standards.width.length ? sizePercent(chosenSize.width, standards.width, rules.width) : 0) +
    (standards.height.length ? sizePercent(chosenSize.height, standards.height, rules.height) : 0);
  const isCustomSize = percent > 0 || (["width", "height"] as const).some((dimension) =>
    standards[dimension].length > 0 && !standards[dimension].includes(chosenSize[dimension]));
  const pricedVariation = percent ? { ...selectedVariation, price: sizedPrice(selectedVariation.price, 1 + percent / 100) } : selectedVariation;
  const pickSize = (next: Partial<Size>) => {
    const wanted = { ...chosenSize, ...next };
    let custom = isCustomSize;
    if (hasSizes) {
      // The price is that of the nearest standard size.
      const base = { width: keys.width ? nearestStandard(wanted.width, standards.width) : undefined,
        height: keys.height ? nearestStandard(wanted.height, standards.height) : undefined };
      const row = variationForSize(variations, selectedVariation, base);
      const rowSize = sizeOf(row, keys);
      custom = (rowSize.width !== undefined && rowSize.width !== wanted.width) || (rowSize.height !== undefined && rowSize.height !== wanted.height);
      if (row.slug !== selectedSlug) setAddonSelection({});
      setSelectedSlug(row.slug);
    }
    setSelection((current) => ({ ...current, ...wanted, sizeMode: custom ? "custom" : "standard" }));
  };
  const sizes = isDoor && (standards.width.length || standards.height.length) ? {
    widths: standards.width,
    heights: standards.height,
    value: chosenSize,
    rules,
    allowed,
    percent,
    custom: isCustomSize,
    notes: product.sizeNotes.filter((note) => chosenSize[note.dimension] === note.value).map((note) => note.text),
    onPick: pickSize,
  } : undefined;
  // Cart: the chosen size when both are known (sized variations keep their own width/height otherwise).
  const cartSize = sizes && standards.width.length && standards.height.length ? { ...chosenSize, custom: isCustomSize, percent } : undefined;

  // Floor: quantity in m², sold by whole packs (pack area comes from the variation data).
  const floorPackArea = packArea(selectedVariation);
  const PACK_AREA = floorPackArea ?? 1;
  const [floorQtyM2, setFloorQtyM2] = useState(() => 2 * PACK_AREA);
  const [floorUnit, setFloorUnit] = useState<"m2" | "pack">("m2");
  const STOCK_M2 = 0;
  const PRICE_PER_M2 = selectedVariation.price;
  const packsApprox = packsFor(floorQtyM2, PACK_AREA);
  const packPrice = Math.round(PRICE_PER_M2 * PACK_AREA * 100) / 100;
  const totalPrice = Math.round(packsApprox * packPrice);

  return (
    <div className="product-detail-layout grid grid-cols-1 gap-8 lg:grid-cols-2 md:gap-10 lg:gap-12 items-start">
      <div className="product-detail-media min-w-0 w-full animate-slide-left" style={{ animationDelay: "0.18s" }}>
        <ProductGallery
          edgeBadge={undefined}
          variations={gallery.items}
          activeIndex={gallery.activeIndex}
          onSelectVariation={(item) => selectVariation(gallery.select(item))}
        />
        {selectedVariation.note && (
          <p className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-[#666]">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-[2px] size-[14px] shrink-0 fill-none stroke-[#9e9e9e]" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5" /><path d="M8 7.2v4M8 4.8v.1" strokeLinecap="round" /></svg>
            {selectedVariation.note}
          </p>
        )}
      </div>

      {/* Configurator */}
      <div className="min-w-0 w-full flex flex-col animate-slide-right" style={{ animationDelay: "0.20s" }}>
        {isMizhkimnatni && (
          <div className="flex flex-col gap-6">
            <VariationSelector value={selection} onChange={updateSelection} options={options} swatches={swatches}
              additionalCount={additionalCount} sizes={sizes} colorNote={colorNote}
              beforeDimensions={hasExtraAttributes ? (
                <TableVariationSelector variations={variations} selected={selectedVariation} onSelect={selectVariation}
                  startStep={baseCount + 1} total={baseCount + additionalCount + (sizes ? 1 : 0)} />
              ) : null}
            />
          </div>
        )}

        {isFloor && (
          <FloorConfigurator
            variations={variations}
            value={selection}
            options={options}
            swatches={swatches}
            onChange={updateSelection}
            qtyM2={floorQtyM2}
            onQtyChange={setFloorQtyM2}
            unit={floorUnit}
            onUnitChange={setFloorUnit}
            packArea={PACK_AREA}
            stockM2={STOCK_M2}
            pricePerM2={PRICE_PER_M2}
            byPack={floorPackArea !== null}
            boardSize={boardSize(selectedVariation)}
            totalPrice={totalPrice}
            packsApprox={packsApprox}
          />
        )}

        <div className="mt-6 md:mt-8">
          <AccessoriesSection addons={addons} selected={addonSelection} onChange={setAddonSelection} />
        </div>
        <div className="mt-6 md:mt-8">
          <AddToCartButton
            variation={{ ...pricedVariation, image: lookImage(variations, selectedVariation) }}
            productName={productName}
            addons={chosenAddons}
            size={cartSize}
            pack={isFloor ? { area: floorPackArea, qty: packsApprox } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
