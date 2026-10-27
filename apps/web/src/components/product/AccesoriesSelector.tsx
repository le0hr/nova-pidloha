"use client";

import { useState, useId } from "react";
import type { ProductAddon } from "@/types/product";
import { groupAddons } from "@/lib/catalog/addons";

export default function AccessoriesSection({ addons, selected, onChange }: {
  addons: ProductAddon[];
  selected: Record<string, string>;
  onChange: (selection: Record<string, string>) => void;
}) {
  const instanceId = useId();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ addons: true });
  const sections = [{
    id: "addons", title: "Доповнення", groups: groupAddons(addons).map((group) => ({
      id: group.id, title: group.title,
      options: [{ id: "", label: "Не вибрано", price: 0 }, ...group.addons.map((addon) => ({
        id: addon.id, label: addon.name, price: addon.price,
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
                    <div key={group.id} className="flex flex-col gap-2.5">
                      <h4 className="font-['Outfit',sans-serif] font-semibold text-[#1a1a1a] text-[14px]">
                        {group.title}
                      </h4>

                      <div className="flex flex-col gap-2">
                        {group.options.map((option) => {
                          const isActive = (selected[group.id] ?? "") === option.id;

                          return (
                            <label
                              key={option.id}
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
                                  className={`block w-[18px] h-[18px] rounded-full border-2 transition-colors ${
                                    isActive
                                      ? "border-[#e53935]"
                                      : "border-[#cfcfcf] group-hover:border-[#aaa]"
                                  }`}
                                />
                                {isActive && (
                                  <span className="absolute inset-0 m-auto w-[10px] h-[10px] rounded-full bg-[#e53935]" />
                                )}
                              </span>

                              <span className="font-['Outfit',sans-serif] text-[13px] leading-snug text-[#1a1a1a]">
                                {option.label}
                                {option.price !== 0 && (
                                  <span className="text-[#666]">
                                    {" "}
                                    ({option.price > 0 ? "+" : ""}{option.price.toLocaleString("uk-UA")} грн)
                                  </span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}