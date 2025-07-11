# Astrology API

API для расчета натальной карты с использованием Swiss Ephemeris.

## Как использовать

### POST `/api/calculate_chart`

**Параметры запроса (JSON):**
```json
{
  "dob": "ДД/ММ/ГГГГ",
  "time": "ЧЧ:ММ",
  "place_of_birth": "Город, Страна",
  "latitude": 55.7558,
  "longitude": 37.6176
}
