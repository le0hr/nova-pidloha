import os
import time
import json
from typing import Optional
from llama_cloud import LlamaCloud
from schema import DoorCatalog
from supplier_config import require_env
from update import bot, sync_catalogs

def extract_korfad_catalog(pdf_path: str, api_key: Optional[str] = None) -> dict:
    client = LlamaCloud(api_key=api_key)

    print(f"Uploading file: {pdf_path}...")
    file_obj = client.files.create(file=pdf_path, purpose="extract")
    print(f"File ID: {file_obj.id}")

    system_prompt = """
    Ти парсиш прайс-листи міжкімнатних дверей українських виробників (KORFAD, LEADOR, CITY LINE тощо).

    Структура майже завжди така:
    - Колекція (CRYSTAL, OLYMPIA, SIMPLI-LOFT, BRAVO...)
    - Модель (OCTAVIA, RIVIERA, SL-03, AMADEA...)
    - Список декорів
    - Варіанти скла / кромки
    - Ціна (іноді одна, іноді різна залежно від скла/кромки)

    Правила:
    1. Кожна унікальна комбінація (Модель + Декор + Скло + Кромка) = один DoorVariant.
    2. Якщо ціна одна на всі декори моделі — просто повтори її для кожного декору.
    3. Якщо ціна залежить від скла — створюй окремі варіанти.
    4. Товщину, стандартні розміри і термін виготовлення записуй на рівні моделі.
    5. Нестандарт (націнка +15% по висоті) — в non_standard.
    6. Ігноруй погонажні вироби (коробки, лиштви, добори, плінтуси), фурнітуру і послуги.
    7. Якщо щось незрозуміло — став null і пиши в notes.

    Повертай строго за схемою DoorCatalog.
    """

    print("Starting extraction (tier=agentic)...")
    job = client.extract.create(
        file_input=file_obj.id,
        configuration={
            "data_schema": DoorCatalog.model_json_schema(),
            "extraction_target": "per_doc",
            "tier": "agentic",
            "system_prompt": system_prompt,
            "confidence_scores": True,
        },
    )

    while job.status not in ("COMPLETED", "FAILED", "CANCELLED"):
        time.sleep(3)
        job = client.extract.get(job.id)
        print(f"  status: {job.status}")

    if job.status != "COMPLETED":
        raise RuntimeError(f"Extraction failed: {job.status}")

    return job.extract_result


def hitl_confidence_review(data: dict, threshold: float = 0.85) -> dict:
    """
    Рекурсивно шукає ключі 'confidence' у відповіді. 
    Якщо знайдено низьку впевненість – зупиняє скрипт для ручного підтвердження (HITL).
    """
    low_confidence_items = []

    def find_low_confidence(node, path="root"):
        if isinstance(node, dict):
            for k, v in node.items():
                if "confidence" in k.lower() and isinstance(v, (int, float)):
                    if v < threshold:
                        low_confidence_items.append((f"{path}/{k}", v))
                elif isinstance(v, (dict, list)):
                    find_low_confidence(v, f"{path}/{k}")
        elif isinstance(node, list):
            for idx, item in enumerate(node):
                find_low_confidence(item, f"{path}[{idx}]")

    find_low_confidence(data)

    if low_confidence_items:
        print(f"\n[HITL УВАГА] Знайдено дані з рівнем впевненості нижче {threshold}:")
        for path, score in low_confidence_items:
            print(f" ⚠️ {path}: {score:.2f}")
        
        print("\n--- Частина отриманих даних для перевірки ---")
        print(json.dumps(data, ensure_ascii=False, indent=2)[:1000] + "\n...\n")
        
        user_input = input("Чи підтверджуєте ви ці дані? (введіть 'ok' для продовження / будь-що інше для скасування): ").strip().lower()
        if user_input != 'ok':
            raise ValueError("Розбір зупинено користувачем (дані відхилено).")
        print("✅ Дані підтверджено людиною.")
    else:
        print(f"\n[HITL] Усі дані мають високий рівень впевненості (>= {threshold}). Автоматичне підтвердження.")

    return data


if __name__ == "__main__":
    API_KEY = require_env("LLAMA_CLOUD_API_KEY")
    
    BASE_DIR = "downloads/2/"
    files_to_process = [
        "Прайс Korfad/КОРФАД Щитові двері від 01.04.2026_ДИЛЕР.pdf"
    ]
    
    for index, filename in enumerate(files_to_process):
        full_path = os.path.join(BASE_DIR, filename)
        
        raw_data = extract_korfad_catalog(full_path, api_key=API_KEY)

        catalogs_to_sync = []

        validated_data = hitl_confidence_review(raw_data, threshold=0.85)
        catalog = DoorCatalog.model_validate(validated_data)
        catalogs_to_sync.append(catalog)

        output_filename = os.path.join(os.path.dirname(__file__), f"korfad_extracted_{index+3}.json")
        with open(output_filename, "w", encoding="utf-8") as f:
            json.dump(validated_data, f, ensure_ascii=False, indent=2)

        print(f"\n=== Готово ===")
        print(f"Повний результат збережено у файл → {output_filename}")

    sync_catalogs(catalogs_to_sync, low_confidence=True)
    print("\nВсі запити відправлено. Чекаю на підтвердження в Telegram...")
    bot.infinity_polling()