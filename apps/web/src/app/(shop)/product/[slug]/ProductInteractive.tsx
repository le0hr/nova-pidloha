"use client";

import { useMemo, useState } from "react";
import { selectedAddons } from "@/lib/catalog/addons";
import AccessoriesSection from "@/components/product/AccesoriesSelector";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductGallery from "@/components/product/ProductGallery";
import VariationSelector from "@/components/product/DoorVariationSelector";
import type { VariationState } from "@/types/product";
import TableVariationSelector from "@/components/product/TableVariationSelector";
import { extraFields, attributeValue, visibleExtraFields } from "@/lib/catalog/variations";
import FloorConfigurator from "@/components/product/FloorConfigurator";
import type { ProductVariation } from "@/types/product";
import { ProductReturnData } from "@/types/product";

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
  const category = product.category.slug;

  const isFloor = category === "pidloha" || category.startsWith("pidloha-");
  const isMizhkimnatni = !isFloor;

  const [selection, setSelection] = useState<VariationState>(() => toState(variations[0]));
  const [selectedSlug, setSelectedSlug] = useState(variations[0].slug);
  const selectedVariation = variations.find((variation) => variation.slug === selectedSlug) ?? variations[0];
  const addons = selectedVariation.addons ?? product.addons ?? [];
  const chosenAddons = selectedAddons(addons, addonSelection);
  const activeIndex = Math.max(0, variations.indexOf(selectedVariation));
  const options = useMemo(() => buildOptions(variations, selection), [variations, selection]);
  const productName = product.name;
  const additionalCount = visibleExtraFields(variations, selectedVariation).length;
  const hasExtraAttributes = additionalCount > 0;
  const baseCount = Object.values(options).filter((values) => values.length > 0).length;

  const selectVariation = (variation: ProductVariation) => {
    if (variation.slug !== selectedSlug) setAddonSelection({});
    setSelectedSlug(variation.slug);
    setSelection((current) => toState(variation, current));
  };

  const updateSelection = (partial: Partial<VariationState>) => {
    const requested = { ...selection, ...partial };
    const exact = variations.filter((row) => variationKey(toState(row)) === variationKey(requested));
    const candidates = exact.length ? exact : variations.filter((row) => {
      const state = toState(row);
      return state.decor === requested.decor &&
        (Object.hasOwn(partial, "decor") || state.decor_color === requested.decor_color);
    });
    const fields = extraFields(variations);
    const next = candidates.find((row) => row.slug === selectedSlug) ??
      candidates.find((row) => fields.every((field) =>
        attributeValue(row, field.key) === attributeValue(selectedVariation, field.key))) ??
      candidates[0] ?? selectedVariation;
    if (next.slug !== selectedSlug) setAddonSelection({});
    setSelectedSlug(next.slug);
    setSelection(toState(next, requested));
  };

  const [floorQtyM2, setFloorQtyM2] = useState(4.334);
  const [floorUnit, setFloorUnit] = useState<"m2" | "pack">("m2");

  const PACK_AREA = 2.167; 
  const STOCK_M2 = 342;
  const PRICE_PER_M2 = selectedVariation?.price ?? 589;
  const OLD_PRICE_PER_M2 = 720;
  const DISCOUNT = Math.round(((OLD_PRICE_PER_M2 - PRICE_PER_M2) / OLD_PRICE_PER_M2) * 100);

  const packsApprox = Math.ceil(floorQtyM2 / PACK_AREA);
  const totalPrice = Math.round(floorQtyM2 * PRICE_PER_M2);

  return (
    <div className="product-detail-layout grid grid-cols-1 gap-8 lg:grid-cols-2 md:gap-10 lg:gap-12 items-start">
      <div className="product-detail-media min-w-0 w-full animate-slide-left" style={{ animationDelay: "0.18s" }}>
        <ProductGallery
          edgeBadge={undefined}
          variations={variations}
          activeIndex={activeIndex}
          onSelectVariation={selectVariation}
        />
      </div>

      {/* Configurator */}
      <div className="min-w-0 w-full flex flex-col animate-slide-right" style={{ animationDelay: "0.20s" }}>
        {isMizhkimnatni && (
          <div className="flex flex-col gap-6">
            <VariationSelector value={selection} onChange={updateSelection} options={options}
              additionalCount={additionalCount}
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
            oldPricePerM2={OLD_PRICE_PER_M2}
            discount={DISCOUNT}
            totalPrice={totalPrice}
            packsApprox={packsApprox}
          />
        )}

        {isFloor && hasExtraAttributes && (
          <div className="mt-6">
            <TableVariationSelector variations={variations} selected={selectedVariation} onSelect={selectVariation} />
          </div>
        )}

        <div className="mt-6 md:mt-8">
          <AccessoriesSection addons={addons} selected={addonSelection} onChange={setAddonSelection} />
        </div>
        <div className="mt-6 md:mt-8">
          <AddToCartButton
            variation={selectedVariation}
            productName={productName}
            addons={chosenAddons}
          />
        </div>
      </div>
    </div>
  );
}
