# Sample Data Export - TSV Files (Corrected Format)

This directory contains tab-separated values (TSV) files with sample data that can be directly imported into the Supabase `kv_store_b11e7096` table.

## Table Structure

The Supabase table has only 2 columns:
```sql
CREATE TABLE kv_store_b11e7096 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

All data is stored as:
- **key**: Prefix-based identifier (e.g., `category:uuid`, `dish:uuid`, `order:uuid`)
- **value**: Complete JSON object with all properties

---

## Files

### 1. `data_export_categories.tsv`
Categories stored in the KV store.

**Columns:** `key` | `value`

**Example:**
```
key: category:550e8400-e29b-41d4-a716-446655440001
value: {"id":"550e8400-e29b-41d4-a716-446655440001","nameEn":"Appetizers","nameZh":"开胃菜","createdAt":"2026-06-19T00:00:00Z"}
```

**Data (5 categories):**
- Appetizers / 开胃菜
- Main Courses / 主菜
- Soups / 汤
- Vegetables / 蔬菜
- Rice & Noodles / 米饭和面条

---

### 2. `data_export_dishes.tsv`
Menu dishes stored in the KV store.

**Columns:** `key` | `value`

**JSON fields in value:**
- `id` - UUID
- `nameEn`, `nameZh` - Bilingual names
- `descriptionEn`, `descriptionZh` - Bilingual descriptions
- `ingredientsEn`, `ingredientsZh` - Ingredient lists
- `price` - Numeric price
- `categoryId` - Reference to category
- `available` - Boolean
- `photoUrl` - Image URL
- `createdAt` - ISO timestamp

**Data (10 dishes):**
1. Spring Rolls / 春卷 - $6.99
2. Mapo Tofu / 麻婆豆腐 - $10.99
3. Kung Pao Chicken / 宫保鸡丁 - $12.99
4. Hot and Sour Soup / 酸辣汤 - $5.99
5. Egg Drop Soup / 蛋花汤 - $4.99
6. Stir-fried Vegetables with Garlic / 蒜炒蔬菜 - $7.99
7. Eggplant in Garlic Sauce / 蒜泥茄子 - $8.99
8. Fried Rice with Shrimp / 虾炒饭 - $11.99
9. Chow Mein / 炒面 - $10.99
10. Orange Chicken / 橙子鸡 - $13.99

---

### 3. `data_export_orders.tsv`
Customer orders stored in the KV store.

**Columns:** `key` | `value`

**JSON fields in value:**
- `id` - UUID
- `customerName` - Customer name
- `customerEmail` - Email address
- `customerPhone` - Phone number
- `dishIds` - Array of dish UUIDs
- `message` - Special instructions (can be empty)
- `language` - "en" or "zh"
- `status` - "pending", "confirmed", or "completed"
- `createdAt` - ISO timestamp

**Data (5 orders):**
1. John Smith - 2 dishes - pending
2. Li Meili - 3 dishes - confirmed
3. Maria Garcia - 2 vegetarian dishes - pending
4. Chen Wei - 2 dishes - completed
5. Sophie Lee - 2 dishes - confirmed

---

## How to Import into Supabase

### Method 1: Using Supabase Dashboard (SQL Editor)

1. Go to your Supabase project → SQL Editor
2. Create an insert query. For each row in the TSV:

```sql
INSERT INTO kv_store_b11e7096 (key, value) VALUES
  ('category:550e8400-e29b-41d4-a716-446655440001', '{"id":"550e8400-e29b-41d4-a716-446655440001","nameEn":"Appetizers","nameZh":"开胃菜","createdAt":"2026-06-19T00:00:00Z"}'),
  ('category:550e8400-e29b-41d4-a716-446655440002', '{"id":"550e8400-e29b-41d4-a716-446655440002","nameEn":"Main Courses","nameZh":"主菜","createdAt":"2026-06-19T00:00:00Z"}');
```

### Method 2: Using Python Script

```python
import pandas as pd
import json
from supabase import create_client

# Read TSV
df = pd.read_csv('data_export_categories.tsv', sep='\t')

# Connect to Supabase
url = "your_supabase_url"
key = "your_supabase_key"
supabase = create_client(url, key)

# Insert data
for _, row in df.iterrows():
    key_col = row['key']
    value_json = json.loads(row['value'])
    
    supabase.table('kv_store_b11e7096').insert({
        'key': key_col,
        'value': value_json
    }).execute()
```

### Method 3: Seed via the Web App

1. Go to `/admin` and log in
2. Click "Add Demo Data" button on the dashboard
3. This triggers the `/seed` endpoint which auto-populates all data

---

## Importing CSV Files

If you're working with CSV format instead of TSV:

### Convert TSV to CSV
```bash
sed 's/\t/,/g' data_export_categories.tsv > data_export_categories.csv
```

### Import CSV using psql
```bash
psql -U username -d database_name \
  -c "\COPY kv_store_b11e7096(key, value) FROM 'data_export_categories.csv' CSV HEADER DELIMITER ',';"
```

---

## Data Validation

Before importing, verify:
- ✅ All UUIDs are valid format (8-4-4-4-12 hex digits)
- ✅ All JSON in `value` column is valid (no unescaped quotes)
- ✅ Key prefixes match data type: `category:`, `dish:`, `order:`
- ✅ All references are valid (categoryId exists, dishIds exist)
- ✅ Timestamps are ISO 8601 format

---

## Viewing Imported Data

After import, verify data appears in:

**Website:**
- `/menu` - See all dishes grouped by category
- `/admin/dishes` - Manage dishes with drag & drop
- `/admin/orders` - View and manage orders

**Database:**
```sql
SELECT key, value FROM kv_store_b11e7096 WHERE key LIKE 'category:%';
SELECT key, value FROM kv_store_b11e7096 WHERE key LIKE 'dish:%';
SELECT key, value FROM kv_store_b11e7096 WHERE key LIKE 'order:%';
```

---

## Notes

- All data uses camelCase for JSON field names (e.g., `nameEn`, `categoryId`)
- Chinese text uses Simplified Chinese (Mainland standard)
- Photo URLs are external Unsplash links for demo purposes
- This data matches the seeding function in `supabase/functions/server/index.tsx`
