import os
import json
import uuid
import requests
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

from supplier_config import require_env

# --- Config ---
TG_BOT_TOKEN = require_env("TG_BOT_TOKEN")
TG_CHAT_ID = os.getenv("TG_CHAT_ID", "1064660178")
STRAPI_GRAPHQL_URL = os.getenv("STRAPI_GQL_URL", "http://localhost:1337/graphql")
STRAPI_TOKEN = require_env("STRAPI_TOKEN")

TASKS_DIR = "pending_tasks"
os.makedirs(TASKS_DIR, exist_ok=True)

bot = telebot.TeleBot(TG_BOT_TOKEN, parse_mode="HTML")

def format_slug(name: str) -> str:
    """Транслітерує назву та створює валідний slug для Strapi за стандартом /^[A-Za-z0-9-_.~]*$/."""
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
        'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
        'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '',
        'ю': 'yu', 'я': 'ya'
    }
    
    name_lower = name.lower()
    slug_chars = []
    for char in name_lower:
        if char in translit_map:
            slug_chars.append(translit_map[char])
        elif char.isascii() and (char.isalnum() or char in "-_.~"):
            slug_chars.append(char)
        elif char.isspace() or char in "/\\":
            slug_chars.append("-")
            
    base = "".join(slug_chars)
    while "--" in base:
        base = base.replace("--", "-")
    base = base.strip("-")
    
    if not base:
        base = "product"
        
    return f"{base}-{str(uuid.uuid4())[:6]}"

# ==========================================
# 1. HELPER: FIND OR CREATE RELATED ENTITIES
# ==========================================

def get_or_create_decor(name: str) -> str | None:
    """Знаходить або створює Decor (покриття / тип декору) за назвою."""
    if not name:
        return None
    
    query = 'query GetDecor($name: String!) { decors(filters: { name: { eq: $name } }) { documentId } }'
    resp = requests.post(STRAPI_GRAPHQL_URL, headers={"Authorization": f"Bearer {STRAPI_TOKEN}", "Content-Type": "application/json"},
                         json={"query": query, "variables": {"name": name}})
    items = resp.json().get("data", {}).get("decors", [])
    if items:
        return items[0]["documentId"]
    
    mutation = 'mutation CreateDecor($data: DecorInput!) { createDecor(data: $data) { documentId } }'
    resp = requests.post(STRAPI_GRAPHQL_URL, headers={"Authorization": f"Bearer {STRAPI_TOKEN}", "Content-Type": "application/json"},
                         json={"query": mutation, "variables": {"data": {"name": name}}})
    result = resp.json()
    if "errors" in result:
        print(f"❌ Помилка створення Decor ({name}):", result["errors"])
        return None
    return result.get("data", {}).get("createDecor", {}).get("documentId")


def get_or_create_decor_color(color_name: str, decor_id: str = None) -> str | None:
    """Знаходить або створює DecorColor (конкретний колір декору)."""
    if not color_name:
        return None
        
    query = 'query GetDecorColor($name: String!) { decorColors(filters: { name: { eq: $name } }) { documentId } }'
    resp = requests.post(STRAPI_GRAPHQL_URL, headers={"Authorization": f"Bearer {STRAPI_TOKEN}", "Content-Type": "application/json"},
                         json={"query": query, "variables": {"name": color_name}})
    items = resp.json().get("data", {}).get("decorColors", [])
    if items:
        return items[0]["documentId"]
        
    color_input = {"name": color_name}
    if decor_id:
        color_input["decor"] = decor_id
        
    mutation = 'mutation CreateDecorColor($data: DecorColorInput!) { createDecorColor(data: $data) { documentId } }'
    resp = requests.post(STRAPI_GRAPHQL_URL, headers={"Authorization": f"Bearer {STRAPI_TOKEN}", "Content-Type": "application/json"},
                         json={"query": mutation, "variables": {"data": color_input}})
    result = resp.json()
    if "errors" in result:
        print(f"❌ Помилка створення DecorColor ({color_name}):", result["errors"])
        return None
    return result.get("data", {}).get("createDecorColor", {}).get("documentId")


def get_or_create_architrave(name: str) -> str | None:
    """Знаходить або створює ArchitraveType (наприклад, кромку)."""
    if not name:
        return None
        
    query = 'query GetArchitrave($name: String!) { architraveTypes(filters: { name: { eq: $name } }) { documentId } }'
    resp = requests.post(STRAPI_GRAPHQL_URL, headers={"Authorization": f"Bearer {STRAPI_TOKEN}", "Content-Type": "application/json"},
                         json={"query": query, "variables": {"name": name}})
    items = resp.json().get("data", {}).get("architraveTypes", [])
    if items:
        return items[0]["documentId"]
        
    mutation = 'mutation CreateArchitrave($data: ArchitraveTypeInput!) { createArchitraveType(data: $data) { documentId } }'
    resp = requests.post(STRAPI_GRAPHQL_URL, headers={"Authorization": f"Bearer {STRAPI_TOKEN}", "Content-Type": "application/json"},
                         json={"query": mutation, "variables": {"data": {"name": name, "additionalCost": 0.0}}})
    result = resp.json()
    if "errors" in result:
        return None
    return result.get("data", {}).get("createArchitraveType", {}).get("documentId")

# ==========================================
# 2. CORE MUTATIONS (Product & Variations)
# ==========================================

def create_full_product_in_strapi(extracted_data: dict) -> bool:
    """Створює Product та всі пов'язані з ним ProductVariation з урахуванням усіх полів."""
    name = extracted_data.get("model_name", "Unknown Product")
    slug = format_slug(name)
    
    desc_lines = []
    if 'collection_name' in extracted_data:
        desc_lines.append(f"Колекція: {extracted_data['collection_name']}")
    if 'coating_type' in extracted_data:
        desc_lines.append(f"Покриття: {extracted_data['coating_type']}")
    if 'standard_widths' in extracted_data:
        desc_lines.append(f"Ширина (мм): {extracted_data['standard_widths']}")
    if 'production_days' in extracted_data:
        desc_lines.append(f"Термін виготовлення: {extracted_data['production_days']}")
    if 'non_standard_height_markup' in extracted_data:
        desc_lines.append(f"Націнка за нестандартну висоту: {extracted_data['non_standard_height_markup']}%")
    if 'non_standard_notes' in extracted_data:
        desc_lines.append(f"\nНестандарт:\n{extracted_data['non_standard_notes']}")
    if 'model_notes' in extracted_data:
        desc_lines.append(f"\nПримітки:\n{extracted_data['model_notes']}")

    variants = extracted_data.get('variants', [])
    prices = [float(v.get('price', 0)) for v in variants if v.get('price') is not None and float(v.get('price', 0)) > 0]
    base_price = min(prices) if prices else 0.0

    product_input = {
        "name": name,
        "slug": slug,
        "description": "\n".join(desc_lines),
        "price": float(base_price),
        "isFeatured": False,
        "isNew": True
    }
    
    prod_mutation = 'mutation CreateProduct($data: ProductInput!) { createProduct(data: $data) { documentId } }'
    resp = requests.post(
        STRAPI_GRAPHQL_URL,
        headers={"Authorization": f"Bearer {STRAPI_TOKEN}", "Content-Type": "application/json"},
        json={"query": prod_mutation, "variables": {"data": product_input}}
    )
    
    prod_result = resp.json()
    if "errors" in prod_result:
        print("❌ Помилка створення Product:", prod_result["errors"])
        return False
        
    product_document_id = prod_result.get("data", {}).get("createProduct", {}).get("documentId")
    if not product_document_id:
        return False

    print(f"✅ Успішно створено Product [{name}] з ID: {product_document_id}")

    coating_type_name = extracted_data.get("coating_type")
    decor_id = get_or_create_decor(coating_type_name) if coating_type_name else None

    for idx, var in enumerate(variants):
        var_price = str(var.get("price", "0.0"))
        color_name = var.get("decor")       # У вашому прайсі 'decor' відповідає конкретному кольору декору
        edge_name = var.get("edge")         # Кромка / тип обробки
        
        color_id = get_or_create_decor_color(color_name, decor_id) if color_name else None
        architrave_id = get_or_create_architrave(edge_name) if edge_name else None
        
        var_input = {
            "slug": f"{slug}-var-{idx}",
            "price": var_price,
            "products": [product_document_id]
        }
        
        if decor_id:
            var_input["decor"] = decor_id
        if color_id:
            var_input["decor_color"] = color_id
        if architrave_id:
            var_input["architrave_types"] = [architrave_id]
            
        var_mutation = 'mutation CreateVar($data: ProductVariationInput!) { createProductVariation(data: $data) { documentId } }'
        var_resp = requests.post(
            STRAPI_GRAPHQL_URL,
            headers={"Authorization": f"Bearer {STRAPI_TOKEN}", "Content-Type": "application/json"},
            json={"query": var_mutation, "variables": {"data": var_input}}
        )
        
        var_result = var_resp.json()
        if "errors" in var_result:
            print(f"⚠️ Помилка створення варіації для {name}:", var_result["errors"])

    return True

# ==========================================
# 3. BOT HANDLERS & SYNC PIPELINE
# ==========================================

@bot.callback_query_handler(func=lambda call: call.data.startswith('appr_') or call.data.startswith('rej_'))
def handle_approval(call):
    action_type, task_id = call.data.split("_")[0], call.data.split("_")[1]
    task_path = os.path.join(TASKS_DIR, f"{task_id}.json")
    
    if not os.path.exists(task_path):
        bot.edit_message_text("❌ Завдання застаріло або вже виконано.", call.message.chat.id, call.message.message_id)
        return

    if action_type == "rej":
        os.remove(task_path)
        bot.edit_message_text(f"{call.message.html_text}\n\n❌ <b>ВІДХИЛЕНО</b>", call.message.chat.id, call.message.message_id)
        bot.answer_callback_query(call.id, "Відхилено")
        return

    with open(task_path, "r", encoding="utf-8") as f:
        task_data = json.load(f)

    success = create_full_product_in_strapi(task_data["payload"])

    if success:
        os.remove(task_path)
        bot.edit_message_text(f"{call.message.html_text}\n\n✅ <b>СТВОРЕНО З УСІМА ВАРІАЦІЯМИ ТА ДЕКОРАМИ</b>", call.message.chat.id, call.message.message_id)
        bot.answer_callback_query(call.id, "Успішно створено!")
    else:
        bot.answer_callback_query(call.id, "Помилка GraphQL! Див. консоль.", show_alert=True)

def sync_catalogs(catalogs: list, low_confidence: bool = False):
    for catalog in catalogs:
        for model in catalog.models:
            extracted_data = model.model_dump(exclude_none=True)
            task_id = str(uuid.uuid4())[:8]
            task_path = os.path.join(TASKS_DIR, f"{task_id}.json")
            
            markup = InlineKeyboardMarkup()
            markup.add(
                InlineKeyboardButton("✅ Approve", callback_data=f"appr_{task_id}"),
                InlineKeyboardButton("❌ Reject", callback_data=f"rej_{task_id}")
            )
            
            if low_confidence:
                with open(task_path, "w", encoding="utf-8") as f:
                    json.dump({"action": "CREATE", "payload": extracted_data}, f, ensure_ascii=False)
                    
                preview = json.dumps(extracted_data, ensure_ascii=False, indent=2)[:1500]
                text = f"⚠️ <b>Review (Full Sync)</b>\nModel: <b>{model.model_name}</b>\n\n<pre>{preview}</pre>"
                bot.send_message(TG_CHAT_ID, text, reply_markup=markup)
                print(f"[{model.model_name}] Надіслано запит на створення.")

if __name__ == "__main__":
    print("Скрипт синхронізації запущено. Очікування дій у Telegram...")
    bot.infinity_polling()