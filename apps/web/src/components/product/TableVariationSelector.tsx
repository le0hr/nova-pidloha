"use client";

import type { ProductVariation } from "@/types/product";
import { attributeValue, extraRows, visibleExtraFields, attributeLabel } from "@/lib/catalog/variations";
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
      const values = [...new Set(candidates.map((row) => attributeValue(row, key)).filter(Boolean))];
      return <DoorDecorSelector key={key}
        label={attributeLabel(display_name)} step={startStep + index}
        total={total ?? startStep + fields.length - 1}
        decors={values} value={{ decor: attributeValue(selected, key) }}
        setValue={({ decor }: { decor: string }) => {
          const matches = candidates.filter((row) => attributeValue(row, key) === decor);
          const next = matches.find((row) => fields.every((field) => field.key === key ||
            attributeValue(row, field.key) === attributeValue(selected, field.key))) ?? matches[0];
          if (next) onSelect(next);
        }}
      />;
    })}
  </>;
}
