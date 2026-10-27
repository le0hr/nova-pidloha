"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CityAutocomplete from "./CityAutocomplete";

import { searchCities, getWarehouses, type DeliveryCity, type DeliveryWarehouse } from "@/lib/services/nova-poshta.service";
import { useCheckoutStore, type DeliveryMethod } from "@/store/checkout-store";

const cityLabel = (city: DeliveryCity) => [city.name, city.area].filter(Boolean).join(", ");

export default function DeliveryForm() {
  const router = useRouter();

  const saved = useCheckoutStore((state) => state.delivery);
  const setDelivery = useCheckoutStore((state) => state.setDelivery);
  const [method, setMethod] = useState<DeliveryMethod>(saved?.method ?? "nova");
  const [city, setCity] = useState(saved?.city ? cityLabel(saved.city) : "");
  const [selectedCity, setSelectedCity] = useState<DeliveryCity | null>(saved?.city ?? null);
  const [department, setDepartment] = useState(saved?.warehouse?.ref ?? "");
  const [warehouseQuery, setWarehouseQuery] = useState("");
  const [cities, setCities] = useState<DeliveryCity[]>([]);
  const [warehouses, setWarehouses] = useState<DeliveryWarehouse[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [warehouseLoading, setWarehouseLoading] = useState(Boolean(saved?.city));
  const [cityError, setCityError] = useState("");
  const [warehouseError, setWarehouseError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (method !== "nova" || selectedCity || city.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await searchCities(city, controller.signal);
        if (!controller.signal.aborted) setCities(result);
      } catch {
        if (!controller.signal.aborted) setCityError("Не вдалося знайти міста. Спробуйте ще раз.");
      } finally {
        if (!controller.signal.aborted) setCityLoading(false);
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [city, selectedCity, method, retry]);

  useEffect(() => {
    if (method !== "nova" || !selectedCity) return;
    const controller = new AbortController();
    getWarehouses(selectedCity.ref, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setWarehouses(result); })
      .catch(() => { if (!controller.signal.aborted) setWarehouseError("Не вдалося завантажити відділення. Спробуйте ще раз."); })
      .finally(() => { if (!controller.signal.aborted) setWarehouseLoading(false); });
    return () => controller.abort();
  }, [selectedCity, method, retry]);

  const handleCityChange = (value: string) => {
    setCity(value);
    setSelectedCity(null);
    setDepartment("");
    setWarehouseQuery("");
    setWarehouses([]);
    setCities([]);
    setCityError("");
    setWarehouseError("");
    setValidationError("");
    setCityLoading(value.trim().length >= 2);
    setWarehouseLoading(false);
  };

  const handleCitySelect = (value: DeliveryCity) => {
    setCity(cityLabel(value));
    setSelectedCity(value);
    setDepartment("");
    setWarehouseQuery("");
    setWarehouses([]);
    setCities([]);
    setCityError("");
    setWarehouseError("");
    setValidationError("");
    setCityLoading(false);
    setWarehouseLoading(true);
  };

  const searchWords = warehouseQuery.toLocaleLowerCase("uk").replace(/[№.,’'ʼ-]/g, " ").split(/\s+/).filter(Boolean);
  const filteredWarehouses = warehouses.filter((item) => {
    const description = item.description.toLocaleLowerCase("uk").replace(/[№.,’'ʼ-]/g, " ");
    return searchWords.every((word) => description.includes(word));
  });
  const selectedWarehouse = warehouses.find((item) => item.ref === department);
  const warehouseDisabled = !selectedCity || warehouseLoading || Boolean(warehouseError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const warehouse = warehouses.find((item) => item.ref === department) ?? null;
    if (method === "nova" && (!selectedCity || !warehouse || warehouse.cityRef !== selectedCity.ref)) {
      setValidationError("Оберіть місто зі списку та відділення Нової Пошти.");
      return;
    }
    setDelivery({ method, city: method === "nova" ? selectedCity : null, warehouse: method === "nova" ? warehouse : null });
    router.push("/cart/checkout/payment");
  };

  const handleBack = () => {
    router.push("/cart/checkout/contacts");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex w-full flex-col gap-3">
        <label
          className={`flex cursor-pointer items-start gap-3 border bg-white px-4 py-4 transition-colors ${
            method === "pickup"
              ? "border-[#e53935]"
              : "border-[#e0e0e0] hover:border-[#c0c0c0]"
          }`}
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                method === "pickup"
                  ? "border-[#e53935] bg-[#e53935]"
                  : "border-[#b0b0b0] bg-white"
              }`}
            >
              {method === "pickup" && (
                <div className="h-full w-full rounded-full border-2 border-white" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium leading-tight">
                  Самовивіз з магазину
                </div>
                <div className="mt-0.5 text-[13px] leading-snug text-[#777]">
                  Київ, вул. Велика Васильківська, 42 (Пн-Сб)
                </div>
              </div>

              <span className="whitespace-nowrap text-[14px] font-medium text-[#2e7d32]">
                Безкоштовно
              </span>
            </div>
          </div>

          <input
            type="radio"
            name="delivery"
            checked={method === "pickup"}
            onChange={() => setMethod("pickup")}
            className="sr-only"
          />
        </label>

        <div
          className={`border bg-white transition-colors ${
            method === "nova"
              ? "border-[#e53935]"
              : "border-[#e0e0e0] hover:border-[#c0c0c0]"
          }`}
        >
          <label className="flex cursor-pointer items-start gap-3 px-4 py-4">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              <div
                className={`h-4 w-4 rounded-full border-2 ${
                  method === "nova"
                    ? "border-[#e53935] bg-[#e53935]"
                    : "border-[#b0b0b0] bg-white"
                }`}
              >
                {method === "nova" && (
                  <div className="h-full w-full rounded-full border-2 border-white" />
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium leading-tight">
                    Нова Пошта (відділення або поштомат)
                  </div>
                  <div className="mt-0.5 text-[13px] leading-snug text-[#777]">
                    Відправка протягом 1-2 днів
                  </div>
                </div>

                <span className="whitespace-nowrap text-[14px] text-[#333]">
                  за тарифами
                </span>
              </div>
            </div>

            <input
              type="radio"
              name="delivery"
              checked={method === "nova"}
              onChange={() => setMethod("nova")}
              className="sr-only"
            />
          </label>

          {method === "nova" && (
            <div className="space-y-4 border-t border-[#f0f0f0] px-4 pb-5 pt-4">
              <CityAutocomplete
                value={city}
                cities={cities}
                loading={cityLoading}
                error={cityError}
                selected={Boolean(selectedCity)}
                onChange={handleCityChange}
                onSelect={handleCitySelect}
              />

              <fieldset>
                <legend className="mb-1.5 text-[13px] text-[#444]">Оберіть відділення або поштомат</legend>
                <label htmlFor="delivery-warehouse-search" className="sr-only">Пошук за номером або адресою</label>
                <div className="relative">
                  <input
                    id="delivery-warehouse-search"
                    type="search"
                    autoComplete="off"
                    disabled={warehouseDisabled}
                    placeholder={!selectedCity ? "Спочатку оберіть місто" : warehouseLoading ? "Завантажуємо відділення…" : "Номер відділення або адреса"}
                    value={warehouseQuery}
                    onChange={(event) => setWarehouseQuery(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }}
                    aria-controls="delivery-warehouse-results"
                    aria-describedby="delivery-warehouse-count"
                    className="w-full border border-[#d0d0d0] bg-white py-2.5 pl-10 pr-3 text-[15px] text-[#222] outline-none transition-colors placeholder:text-[#999] focus:border-[#e53935] focus:ring-1 focus:ring-[#e53935] disabled:bg-[#f5f5f5] disabled:text-[#999]"
                  />
                  <svg aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
                </div>
                <p id="delivery-warehouse-count" role="status" className="mt-2 text-[13px] text-[#777]">
                  {!warehouseDisabled && `Знайдено: ${filteredWarehouses.length} із ${warehouses.length}`}
                </p>
                <div id="delivery-warehouse-results" className="mt-2 max-h-64 overflow-y-auto overscroll-contain border border-[#e0e0e0] empty:hidden">
                  {!warehouseDisabled && filteredWarehouses.map((item) => (
                    <label key={item.ref} className={`flex cursor-pointer items-start gap-3 border-b border-l-2 border-b-[#f0f0f0] px-3 py-3 text-[14px] leading-snug last:border-b-0 hover:bg-[#fff3f2] focus-within:bg-[#fff3f2] ${department === item.ref ? "border-l-[#e53935] bg-[#fff3f2]" : "border-l-transparent bg-white"}`}>
                      <input
                        type="radio"
                        name="delivery-warehouse"
                        value={item.ref}
                        checked={department === item.ref}
                        onChange={() => { setDepartment(item.ref); setValidationError(""); }}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#e53935]"
                      />
                      <span>{item.description}</span>
                    </label>
                  ))}
                  {!warehouseDisabled && !filteredWarehouses.length && <p className="px-3 py-4 text-[13px] text-[#777]">{warehouses.length ? "Нічого не знайдено. Спробуйте інший номер або назву вулиці." : "У цьому місті відділень не знайдено."}</p>}
                </div>
                {selectedWarehouse && <p className="mt-2 text-[13px] text-[#444]"><span className="font-medium">Обрано:</span> {selectedWarehouse.description}</p>}
              </fieldset>
              {(cityError || warehouseError) && <div role="alert" className="text-sm text-red-700">
                <p>{cityError || warehouseError}</p>
                <button type="button" className="underline" onClick={() => {
                  setCityError(""); setWarehouseError("");
                  setCityLoading(!selectedCity && city.trim().length >= 2);
                  setWarehouseLoading(Boolean(selectedCity)); setRetry((value) => value + 1);
                }}>Спробувати ще раз</button>
              </div>}
              {validationError && <p role="alert" className="text-sm text-red-700">{validationError}</p>}
            </div>
          )}
        </div>

        <label
          className={`flex cursor-pointer items-start gap-3 border bg-white px-4 py-4 transition-colors ${
            method === "courier"
              ? "border-[#e53935]"
              : "border-[#e0e0e0] hover:border-[#c0c0c0]"
          }`}
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                method === "courier"
                  ? "border-[#e53935] bg-[#e53935]"
                  : "border-[#b0b0b0] bg-white"
              }`}
            >
              {method === "courier" && (
                <div className="h-full w-full rounded-full border-2 border-white" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium leading-tight">
                  Кур&apos;єрська доставка по місту
                </div>
                <div className="mt-0.5 text-[13px] leading-snug text-[#777]">
                  До дверей нашим автотранспортом
                </div>
              </div>

              <span className="whitespace-nowrap text-[14px] text-[#333]">
                від 450 ₴
              </span>
            </div>
          </div>

          <input
            type="radio"
            name="delivery"
            checked={method === "courier"}
            onChange={() => setMethod("courier")}
            className="sr-only"
          />
        </label>

        <label
          className={`flex cursor-pointer items-start gap-3 border bg-white px-4 py-4 transition-colors ${
            method === "address"
              ? "border-[#e53935]"
              : "border-[#e0e0e0] hover:border-[#c0c0c0]"
          }`}
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                method === "address"
                  ? "border-[#e53935] bg-[#e53935]"
                  : "border-[#b0b0b0] bg-white"
              }`}
            >
              {method === "address" && (
                <div className="h-full w-full rounded-full border-2 border-white" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium leading-tight">
                  Адресна доставка по Україні
                </div>
                <div className="mt-0.5 text-[13px] leading-snug text-[#777]">
                  Новою Поштою на вашу адресу
                </div>
              </div>

              <span className="whitespace-nowrap text-[14px] text-[#333]">
                за тарифами
              </span>
            </div>
          </div>

          <input
            type="radio"
            name="delivery"
            checked={method === "address"}
            onChange={() => setMethod("address")}
            className="sr-only"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="border border-[#222] bg-white px-6 py-2.5 text-[15px] font-medium text-[#222] transition hover:bg-[#f5f5f5]"
        >
          Назад
        </button>

        <button
          type="submit"
          className="bg-[#e53935] px-8 py-2.5 text-[15px] font-medium text-white transition hover:bg-[#d32f2f]"
        >
          Продовжити
        </button>
      </div>
    </form>
  );
}