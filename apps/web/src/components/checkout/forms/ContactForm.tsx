"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
type ContactsForm = {
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  isCompany: boolean;
  companyName: string;
  edrpou: string;
};

export default function ContactsForm() {
  const [form, setForm] = useState<ContactsForm>({
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
    isCompany: false,
    companyName: "",
    edrpou: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactsForm, string>>>({});
  const router = useRouter();
  const handleChange = (field: keyof ContactsForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof ContactsForm, string>> = {};

    if (!form.lastName.trim()) newErrors.lastName = "Обов'язкове поле";
    if (!form.firstName.trim()) newErrors.firstName = "Обов'язкове поле";

    const phoneRegex = /^\+38\s?\(?0\d{2}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
    if (!form.phone.trim()) {
      newErrors.phone = "Обов'язкове поле";
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Невірний формат номера телефону";
    }

    if (!form.email.trim()) {
      newErrors.email = "Обов'язкове поле";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Невірний формат email";
    }

    if (form.isCompany) {
      if (!form.companyName.trim()) newErrors.companyName = "Обов'язкове поле";
      if (!form.edrpou.trim()) {
        newErrors.edrpou = "Обов'язкове поле";
      } else if (!/^\d{8}$/.test(form.edrpou)) {
        newErrors.edrpou = "ЄДРПОУ має містити 8 цифр";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      router.push("/cart/checkout/delivery");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="font-['Inter',sans-serif] text-sm text-[#1A1A1A]">
            Прізвище
          </label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className={`h-11 w-full border px-3 font-['Inter',sans-serif] text-sm outline-none transition-colors
              ${errors.lastName ? "border-[#E53935]" : "border-[#E0E0E0] focus:border-[#E53935]"}
            `}
          />
          {errors.lastName && (
            <span className="font-['Inter',sans-serif] text-xs text-[#E53935]">
              {errors.lastName}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-['Inter',sans-serif] text-sm text-[#1A1A1A]">
            Ім'я
          </label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={`h-11 w-full border px-3 font-['Inter',sans-serif] text-sm outline-none transition-colors
              ${errors.firstName ? "border-[#E53935]" : "border-[#E0E0E0] focus:border-[#E53935]"}
            `}
          />
          {errors.firstName && (
            <span className="font-['Inter',sans-serif] text-xs text-[#E53935]">
              {errors.firstName}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="font-['Inter',sans-serif] text-sm text-[#1A1A1A]">
            Телефон
          </label>
          <input
            type="tel"
            placeholder="+38 (0__) ___-__-__"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={`h-11 w-full border px-3 font-['Inter',sans-serif] text-sm outline-none transition-colors
              ${errors.phone ? "border-[#E53935]" : "border-[#E0E0E0] focus:border-[#E53935]"}
            `}
          />
          {errors.phone && (
            <span className="font-['Inter',sans-serif] text-xs text-[#E53935]">
              {errors.phone}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-['Inter',sans-serif] text-sm text-[#1A1A1A]">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`h-11 w-full border px-3 font-['Inter',sans-serif] text-sm outline-none transition-colors
              ${errors.email ? "border-[#E53935]" : "border-[#E0E0E0] focus:border-[#E53935]"}
            `}
          />
          {errors.email && (
            <span className="font-['Inter',sans-serif] text-xs text-[#E53935]">
              {errors.email}
            </span>
          )}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5">
        <div
          className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors
            ${form.isCompany ? "border-[#E53935] bg-[#E53935]" : "border-[#BDBDBD] bg-white"}
          `}
          onClick={() => handleChange("isCompany", !form.isCompany)}
        >
          {form.isCompany && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span className="font-['Inter',sans-serif] text-sm text-[#1A1A1A]">
          Я юридична особа (потрібен безготівковий розрахунок)
        </span>
      </label>

      {form.isCompany && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="font-['Inter',sans-serif] text-sm text-[#1A1A1A]">
              Назва компанії
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              className={`h-11 w-full border px-3 font-['Inter',sans-serif] text-sm outline-none transition-colors
                ${errors.companyName ? "border-[#E53935]" : "border-[#E0E0E0] focus:border-[#E53935]"}
              `}
            />
            {errors.companyName && (
              <span className="font-['Inter',sans-serif] text-xs text-[#E53935]">
                {errors.companyName}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-['Inter',sans-serif] text-sm text-[#1A1A1A]">
              ЄДРПОУ
            </label>
            <input
              type="text"
              value={form.edrpou}
              onChange={(e) => handleChange("edrpou", e.target.value)}
              className={`h-11 w-full border px-3 font-['Inter',sans-serif] text-sm outline-none transition-colors
                ${errors.edrpou ? "border-[#E53935]" : "border-[#E0E0E0] focus:border-[#E53935]"}
              `}
            />
            {errors.edrpou && (
              <span className="font-['Inter',sans-serif] text-xs text-[#E53935]">
                {errors.edrpou}
              </span>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="mt-2 w-full bg-[#E53935] py-3.5 font-['Outfit',sans-serif] text-[15px] font-bold text-white transition-colors hover:bg-[#C62828]"
      >
        Продовжити
      </button>
    </form>
  );
}