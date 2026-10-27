"use client"

import { useRouter } from "next/navigation";

export default async function SuccessPage (){
    
    const router = useRouter();
    
    const handleForward = () => {
      router.push("/");
    };
  
    return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
        Дякуємо за замовлення!
      </h1>

      {/* Order Number */}
      <p className="text-gray-500 text-lg mb-4 text-center">
        Номер вашої заявки:{' '}
        <span className="text-red-600 font-semibold">№ NP-2026-9481</span>
      </p>

      {/* Description */}
      <p className="text-gray-500 text-center max-w-xl mb-10 leading-relaxed">
        Ваше замовлення успішно прийнято. Менеджер зв'яжеться з вами
        найближчим часом для підтвердження наявності товару та деталей
        доставки.
      </p>

      {/* Divider */}
      <div className="w-full max-w-3xl border-t border-gray-200 mb-10" />

      {/* What's Next Section */}
      <h2 className="text-xl font-semibold text-gray-900 mb-10">Що далі?</h2>

      {/* Steps */}
      <div className="w-full max-w-3xl flex flex-row  items-start justify-between gap-8 mb-12">
        {/* Step 1 */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold mb-4">
            1
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Підтвердження</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Дзвінок менеджера протягом
            <br />
            15 хвилин
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center pt-3 text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Step 2 */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-semibold mb-4">
            2
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Відправка</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Комплектація та передача в
            <br />
            службу доставки
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center pt-3 text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Step 3 */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-semibold mb-4">
            3
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Отримання</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            СМС із номером ТТН та
            <br />
            отримання замовлення
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-3xl border-t border-gray-200 mb-10" />

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          type="button"
          onClick={handleForward}
          className="px-8 py-3 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors">
          Продовжити покупки
        </button>
      </div>
    </div>
  );
};
