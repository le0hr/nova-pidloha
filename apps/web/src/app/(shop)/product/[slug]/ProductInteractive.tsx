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
import { sizeKeys, sizeOf, sizeSurcharge, sizedPrice, standardSizes, variationForSize } from "@/lib/catalog/sizing";

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

  // Doors with sized variations (width/height in the supplier file): standard sizes are variations.
  const keys = useMemo(() => sizeKeys(variations), [variations]);
  const hasSizes = Boolean(keys.width || keys.height);
  const withSize = (state: VariationState, variation: ProductVariation): VariationState => {
    if (!hasSizes || state.sizeMode === "custom") return state;
    const size = sizeOf(variation, keys);
    return { ...state, width: size.width ?? state.width, height: size.height ?? state.height };
  };

  const [selection, setSelection] = useState<VariationState>(() => withSize(toState(variations[0]), variations[0]));
  const [selectedSlug, setSelectedSlug] = useState(variations[0].slug);
  const selectedVariation = variations.find((variation) => variation.slug === selectedSlug) ?? variations[0];
  const addons = selectedVariation.addons ?? product.addons ?? [];
  const chosenAddons = selectedAddons(addons, addonSelection);
  // One gallery photo per look; another edge/size/side keeps the photo of the same colour.
  const gallery = galleryLooks(variations, selectedVariation);
  const options = useMemo(() => buildOptions(variations, selection), [variations, selection]);
  const productName = product.name;
  const additionalCount = visibleExtraFields(variations, selectedVariation).length;
  const hasExtraAttributes = additionalCount > 0;
  const baseCount = Object.values(options).filter((values) => values.length > 0).length;

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

  // Standard sizes for the current choice, and the custom-size price (+15% width, +20% height).
  const standard = hasSizes ? standardSizes(variations, selectedVariation) : null;
  const standardSize = sizeOf(selectedVariation, keys);
  const customSize = hasSizes && selection.sizeMode === "custom" ? { width: selection.width, height: selection.height } : null;
  const multiplier = customSize ? sizeSurcharge(standardSize, customSize) : 1;
  const pricedVariation = multiplier === 1 ? selectedVariation : { ...selectedVariation, price: sizedPrice(selectedVariation.price, multiplier) };
  const sizes = standard ? {
    widths: standard.widths,
    heights: standard.heights,
    current: standardSize,
    onPick: (size: { width?: number; height?: number }) => selectVariation(variationForSize(variations, selectedVariation, size)),
  } : undefined;

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
      </div>

      {/* Configurator */}
      <div className="min-w-0 w-full flex flex-col animate-slide-right" style={{ animationDelay: "0.20s" }}>
        {isMizhkimnatni && (
          <div className="flex flex-col gap-6">
            <VariationSelector value={selection} onChange={updateSelection} options={options}
              additionalCount={additionalCount} sizes={sizes}
              beforeDimensions={hasExtraAttributes ? (
                <TableVariationSelector variations={variations} selected={selectedVariation} onSelect={selectVariation}
                  startStep={baseCount + 1} total={baseCount + additionalCount + 1} />
              ) : null}
            />
          </div>
        )}

        {isFloor && (
          <FloorConfigurator
            variations={variations}
            value={selection}
            options={options}
            onChange={updateSelection}
            qtyM2={floorQtyM2}
            onQtyChange={setFloorQtyM2}
            unit={floorUnit}
            onUnitChange={setFloorUnit}
            packArea={PACK_AREA}
            stockM2={STOCK_M2}
            pricePerM2={PRICE_PER_M2}
            oldPricePerM2={0}
            discount={0}
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
            oldPriceSeed={product.slug}
            addons={chosenAddons}
            size={multiplier === 1 ? undefined : customSize ?? undefined}
            pack={isFloor ? { area: floorPackArea, qty: packsApprox } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
