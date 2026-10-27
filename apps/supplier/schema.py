
from pydantic import BaseModel, Field
from typing import List, Optional

class DoorVariant(BaseModel):
    decor: str = Field(description="Назва декору: Білий Мат Кристал, Ясен Шовковий, Дуб Шервуд тощо")
    glass: Optional[str] = Field(None, description="Тип скла: Сатин, Чорне скло, Глухе, Дзеркало тощо")
    edge: Optional[str] = Field(None, description="Тип кромки: Звичайна кромка, Чорна матова кромка тощо")
    price: float = Field(description="Роздрібна ціна в грн")
    is_special_price: Optional[bool] = Field(False, description="True якщо ціна акційна")
    notes: Optional[str] = None


class DoorModel(BaseModel):
    collection_name: str = Field(description="Назва колекції: CRYSTAL, OLYMPIA, SIMPLI-LOFT, BRAVO тощо")
    model_name: str = Field(description="Назва моделі: OCTAVIA, RIVIERA, SL-03, AMADEA тощо")
    coating_type: Optional[str] = Field(None, description="PVC, PP, Екошпон, NanoFlex, Еко-touch тощо")
    thickness_mm: Optional[float] = Field(None, description="Товщина полотна в мм (38 або 40)")
    standard_widths: Optional[str] = Field(None, description="Стандартні ширини, наприклад: 400/600/700/800/900")
    standard_height: Optional[int] = Field(2000, description="Стандартна висота в мм")
    production_days: Optional[str] = Field(None, description="Термін виготовлення")
    
    # Головне — плоский список варіантів
    variants: List[DoorVariant] = Field(description="Всі комбінації декор + скло + кромка + ціна")
    
    non_standard_height_markup: Optional[float] = Field(None, description="Націнка по висоті у % (наприклад 15)")
    non_standard_notes: Optional[str] = Field(None, description="Текст правил нестандарту")
    model_notes: Optional[str] = Field(None, description="Важливі примітки по моделі")


class DoorCatalog(BaseModel):
    supplier: str = Field(description="KORFAD / LEADOR / CITY LINE тощо")
    catalog_date: Optional[str] = None
    currency: str = "UAH"
    
    models: List[DoorModel] = Field(description="Список усіх моделей з прайсу")    