"use client";

import type { ProductVariation } from "@/types/product";
import { NO_VALUE, attributeValue, extraRows, visibleExtraFields } from "@/lib/catalog/variations";
import DoorDecorSelector from "./DoorDecorSelector";

export default function TableVariationSelector({ variations, selected, onSelect, startStep = 1, total }: {
  variations: ProductVariation[];
  selected: ProductVariation;
  onSelect: (variation: ProductVariation) => void;
  startStep?: number;
  total?: number;
}) {
  const fields = visibleExtraFields(variations, selected);
  if (!fields.length) return null;
  return <>
    {fields.map(({ key, display_name }, index) => {
      const candidates = extraRows(variations, selected, key);
      const label = (row: ProductVariation) => attributeValue(row, key) || NO_VALUE;
      const values = [...new Set(candidates.map(label))].sort((a, b) => Number(a === NO_VALUE) - Number(b === NO_VALUE));
      return <DoorDecorSelector key={key}
        label={display_name} step={startStep + index}
        total={total ?? startStep + fields.length - 1}
        decors={values} value={{ decor: label(selected) }}
        setValue={({ decor }: { decor: string }) => {
          const matches = candidates.filter((row) => label(row) === decor);
          const next = matches.find((row) => fields.every((field) => field.key === key ||
            attributeValue(row, field.key) === attributeValue(selected, field.key))) ?? matches[0];
          if (next) onSelect(next);
        }}
      />;
    })}
  </>;
}
