"use client";

import { useState, useId } from "react";
import type { ProductAddon } from "@/types/product";
import { ADDON_PRESETS, SKIRTING_MAX, addonQuantityKind, addonTotal, formatQty, groupAddons, selectedAddons } from "@/lib/catalog/addons";

/** Pieces of the chosen moulding: 1 / 2,5 / 5 buttons, or a counter for skirting. */
function QuantityControl({ addon, qty, onChange, indent = true }: { addon: ProductAddon; qty: number; onChange: (qty: number) => void; indent?: boolean }) {
  const kind = addonQuantityKind(addon);
  if (kind === "single") return null;
  return (
    <div className={`${indent ? "ml-[28px] mt-1" : ""} flex flex-col gap-1.5`}>
      <span className="font-['Outfit',sans-serif] text-[12px] text-[#888]">{kind === "count" ? "Кількість, шт" : "Кількість"}</span>
      {kind === "preset" ? (
        <div role="radiogroup" aria-label={`Кількість: ${addon.group ?? addon.name}`} className="inline-flex self-start border border-[#e0e0e0]">
          {ADDON_PRESETS.map((value) => (
            <button key={value} type="button" role="radio" aria-checked={qty === value} onClick={() => onChange(value)}
              className={`min-h-9 border-r border-[#e0e0e0] px-3.5 font-['Outfit',sans-serif] text-[13px] transition-colors last:border-r-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e53935] ${
                qty === value ? "bg-[#e53935] font-semibold text-white" : "bg-white text-[#1a1a1a] hover:bg-[#fff5f5]"}`}>
              {formatQty(value)}
            </button>
          ))}
        </div>
      ) : (
        <div className="inline-flex h-9 items-center self-start bg-black text-white">
          <button type="button" aria-label="Менше на 1 шт" disabled={qty <= 1} onClick={() => onChange(Math.max(1, qty - 1))}
            className="flex size-9 items-center justify-center text-[18px] leading-none transition-colors hover:text-[#e53935] disabled:opacity-40 disabled:hover:text-white">−</button>
          <input type="number" inputMode="numeric" min={1} max={SKIRTING_MAX} value={qty} aria-label={`Кількість: ${addon.group ?? addon.name}`}
            onChange={(event) => { const value = Math.round(Number(event.target.value)); if (value >= 1 && value <= SKIRTING_MAX) onChange(value); }}
            className="h-full w-12 bg-transparent text-center font-['Outfit',sans-serif] text-[14px] font-medium [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          <button type="button" aria-label="Більше на 1 шт" disabled={qty >= SKIRTING_MAX} onClick={() => onChange(Math.min(SKIRTING_MAX, qty + 1))}
            className="flex size-9 items-center justify-center text-[18px] leading-none transition-colors hover:text-[#e53935] disabled:opacity-40 disabled:hover:text-white">+</button>
        </div>
      )}
    </div>
  );
}

/** "Плінтус ТІС ПВХ 55 мм, Дуб шервуд" → line "Плінтус ТІС ПВХ 55 мм", colour "Дуб шервуд". */
const splitName = (name: string) => {
  const at = name.indexOf(", ");
  return at < 0 ? { line: name, colour: "" } : { line: name.slice(0, at), colour: name.slice(at + 2) };
};
/** Above this many choices a group is picked as line → colour instead of one long radio list. */
const LONG_LIST = 12;

/** Long add-on groups (floor skirting): line buttons, then the colour of that line, then the quantity. */
function LinePicker({ addons, value, onSelect, qty, onQty }: {
  addons: ProductAddon[]; value: string; onSelect: (id: string) => void; qty: number; onQty: (qty: number) => void;
}) {
  const lines = new Map<string, ProductAddon[]>();
  for (const addon of addons) {
    const { line } = splitName(addon.name);
    if (!lines.has(line)) lines.set(line, []);
    lines.get(line)!.push(addon);
  }
  // A board made for this exact floor first, then the brand's own lines, the universal TIS last.
  const rank = (line: string) => (/у колір/.test(line) ? 0 : /ТІС/.test(line) ? 2 : 1);
  const order = [...lines.keys()].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, "uk"));
  const chosen = addons.find((addon) => addon.id === value);
  const chosenLine = chosen ? splitName(chosen.name).line : "";
  const options = chosenLine ? lines.get(chosenLine)! : [];
  const button = (active: boolean) => `min-h-10 border px-3 py-2 text-left font-['Outfit',sans-serif] text-[13px] leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e53935] ${
    active ? "border-[#e53935] bg-[#fff5f5] font-semibold text-[#e53935]" : "border-[#e0e0e0] bg-white text-[#1a1a1a] hover:border-[#e53935]/50"}`;
  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Лінійка" className="flex flex-wrap gap-2">
        <button type="button" role="radio" aria-checked={!value} onClick={() => onSelect("")} className={button(!value)}>Не потрібен</button>
        {order.map((line) => {
          const items = lines.get(line)!;
          const from = Math.min(...items.map((addon) => addon.price));
          return (
            <button key={line} type="button" role="radio" aria-checked={line === chosenLine}
              onClick={() => onSelect(line === chosenLine ? value : items[0].id)} className={button(line === chosenLine)}>
              {line.replace(/^Плінтус\s+/, "")}
              <span className="block text-[12px] font-normal text-[#888]">{items.length > 1 ? "від " : ""}{from.toLocaleString("uk-UA")} грн/шт</span>
            </button>
          );
        })}
      </div>
      {chosen && options.length > 1 && (
        <label className="flex flex-col gap-1.5">
          <span className="font-['Outfit',sans-serif] text-[12px] text-[#888]">Колір</span>
          <select value={value} onChange={(event) => onSelect(event.target.value)}
            className="h-10 border border-[#e0e0e0] bg-white px-3 font-['Outfit',sans-serif] text-[14px] text-[#1a1a1a] focus:border-[#e53935] focus:outline-none">
            {[...options].sort((a, b) => splitName(a.name).colour.localeCompare(splitName(b.name).colour, "uk")).map((addon) => (
              <option key={addon.id} value={addon.id}>{splitName(addon.name).colour || addon.name} — {addon.price.toLocaleString("uk-UA")} грн/шт</option>
            ))}
          </select>
        </label>
      )}
      {chosen && options.length === 1 && splitName(chosen.name).colour && (
        <p className="font-['Outfit',sans-serif] text-[13px] text-[#1a1a1a]">{splitName(chosen.name).colour} <span className="text-[#666]">({chosen.price.toLocaleString("uk-UA")} грн/шт)</span></p>
      )}
      {chosen && <QuantityControl addon={chosen} qty={qty} onChange={onQty} indent={false} />}
    </div>
  );
}

export default function AccessoriesSection({ addons, selected, onChange, quantities = {}, onQuantityChange }: {
  addons: ProductAddon[];
  selected: Record<string, string>;
  onChange: (selection: Record<string, string>) => void;
  /** Pieces per add-on group (missing = 1). */
  quantities?: Record<string, number>;
  onQuantityChange?: (quantities: Record<string, number>) => void;
}) {
  const instanceId = useId();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ addons: true });
  const sections = [{
    id: "addons", title: "Доповнення", groups: groupAddons(addons).map((group) => ({
      id: group.id, title: group.title,
      options: [{ id: "", label: "Не вибрано", price: 0, addon: null as ProductAddon | null }, ...group.addons.map((addon) => ({
        id: addon.id, label: addon.name, price: addon.price, addon: addon as ProductAddon | null,
      }))],
    })),
  }];
  if (!addons.length) return null;

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectOption = (groupTitle: string, optionId: string) => {
    onChange({ ...selected, [groupTitle]: optionId });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {sections.map((section) => {
        const isOpen = Boolean(openSections[section.id]);
        const panelId = `${instanceId}-${section.id}-panel`;

        return (
          <div key={section.id} className="border border-[#e8e8e8] overflow-hidden">
            {/* Header */}
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full flex items-center justify-between bg-[#e53935] px-4 py-3 text-left"
            >
              <span className="font-['Outfit',sans-serif] font-semibold text-white text-[15px]">
                {section.title}
              </span>
              <span className="relative size-5 shrink-0 text-white" aria-hidden="true">
                <span className="absolute left-1 top-1/2 h-0.5 w-3 -translate-y-1/2 bg-current" />
                <span className={`absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 bg-current transition-transform duration-300 motion-reduce:transition-none ${isOpen ? "scale-y-0" : "scale-y-100"}`} />
              </span>
            </button>

            {/* Content */}
            <div
              id={panelId}
              aria-hidden={!isOpen}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="bg-white px-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  {section.groups.map((group) => (
                    <div key={group.id} className={`flex flex-col gap-2.5 ${group.options.length - 1 > LONG_LIST ? "sm:col-span-2" : ""}`}>
                      <h4 className="font-['Outfit',sans-serif] font-semibold text-[#1a1a1a] text-[14px]">
                        {group.title}
                      </h4>

                      {group.options.length - 1 > LONG_LIST ? (
                        <LinePicker addons={group.options.flatMap((option) => (option.addon ? [option.addon] : []))}
                          value={selected[group.id] ?? ""} onSelect={(id) => selectOption(group.id, id)}
                          qty={quantities[group.id] ?? 1} onQty={(qty) => onQuantityChange?.({ ...quantities, [group.id]: qty })} />
                      ) : (
                      <div className="flex flex-col gap-2">
                        {group.options.map((option) => {
                          const isActive = (selected[group.id] ?? "") === option.id;
                          const kind = option.addon ? addonQuantityKind(option.addon) : "single";

                          return (
                            <div key={option.id} className="flex flex-col gap-1">
                            <label
                              className="flex items-start gap-2.5 cursor-pointer group"
                            >
                              <span className="relative mt-[3px] shrink-0">
                                <input
                                  type="radio"
                                  name={`${instanceId}-${group.id}`}
                                  checked={isActive}
                                  onChange={() => selectOption(group.id, option.id)}
                                  className="peer sr-only"
                                />
                                <span
                                  className={`block w-[18px] h-[18px] border-2 transition-colors ${
                                    isActive
                                      ? "border-[#e53935]"
                                      : "border-[#cfcfcf] group-hover:border-[#aaa]"
                                  }`}
                                />
                                {isActive && (
                                  <span className="absolute inset-0 m-auto w-[10px] h-[10px] bg-[#e53935]" />
                                )}
                              </span>

                              <span className="font-['Outfit',sans-serif] text-[13px] leading-snug text-[#1a1a1a]">
                                {option.label}
                                {option.price !== 0 && (
                                  <span className="text-[#666]">
                                    {" "}
                                    ({option.price > 0 ? "+" : ""}{option.price.toLocaleString("uk-UA")} грн{kind === "single" ? "" : "/шт"})
                                  </span>
                                )}
                              </span>
                            </label>
                            {isActive && option.addon && (
                              <QuantityControl addon={option.addon} qty={quantities[group.id] ?? 1}
                                onChange={(qty) => onQuantityChange?.({ ...quantities, [group.id]: qty })} />
                            )}
                            </div>
                          );
                        })}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
                {selectedAddons(addons, selected, quantities).length > 0 && (
                  <div className="mt-5 flex items-center justify-between border-t border-[#eeeeee] pt-3 font-['Outfit',sans-serif] text-[13px] text-[#666]">
                    <span>Доповнення разом</span>
                    <span className="text-[15px] font-semibold text-[#1a1a1a]">{addonTotal(selectedAddons(addons, selected, quantities)).toLocaleString("uk-UA")} грн</span>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}