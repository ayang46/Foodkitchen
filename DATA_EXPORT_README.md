# Sample Data Export - TSV Files

This directory contains tab-separated values (TSV) files with sample data that reflects what's stored in Supabase and displayed on the Foodkitchen website.

## Files

### 1. `data_export_categories.tsv`
Contains all menu categories used to organize dishes.

**Fields:**
- `id` - Unique category identifier (UUID)
- `name_en` - English category name
- `name_zh` - Chinese category name (Simplified)
- `created_at` - ISO 8601 timestamp

**Sample Categories:**
- Appetizers / 开胃菜
- Main Courses / 主菜
- Soups / 汤
- Vegetables / 蔬菜
- Rice & Noodles / 米饭和面条

---

### 2. `data_export_dishes.tsv`
Contains all menu dishes with complete information.

**Fields:**
- `id` - Unique dish identifier (UUID)
- `name_en` - English dish name
- `name_zh` - Chinese dish name (Simplified)
- `description_en` - English description
- `description_zh` - Chinese description
- `ingredients_en` - English ingredient list (comma-separated)
- `ingredients_zh` - Chinese ingredient list (comma-separated)
- `price` - Price in USD
- `category_id` - Reference to category (foreign key)
- `available` - Boolean (true/false) - whether dish is currently available
- `photo_url` - URL to dish image (external Unsplash URLs for demo)
- `created_at` - ISO 8601 timestamp

**Sample Dishes (10 total):**
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
Contains sample customer orders.

**Fields:**
- `id` - Unique order identifier (UUID)
- `customer_name` - Full name of customer
- `customer_email` - Email address
- `customer_phone` - Phone number
- `dish_ids` - Pipe-separated list of dish IDs in the order
- `message` - Special instructions or requests (can be empty)
- `language` - Language of the order (en/zh)
- `status` - Order status: `pending`, `confirmed`, or `completed`
- `created_at` - ISO 8601 timestamp when order was placed

**Sample Orders (5 total):**
1. John Smith - 2 dishes (Spring Rolls, Kung Pao Chicken) - pending
2. Li Meili - 3 dishes (Mapo Tofu, Fried Rice, Hot & Sour Soup) - confirmed
3. Maria Garcia - 2 vegetarian dishes - pending
4. Chen Wei - 2 dishes (Orange Chicken, Chow Mein) - completed
5. Sophie Lee - 2 dishes (Egg Drop Soup, Fried Rice) - confirmed

---

## How to Use These Files

### Viewing in Spreadsheet Software
- Open any TSV file with Excel, Google Sheets, or LibreOffice Calc
- Files are tab-separated for easy column parsing
- Headers are in the first row

### Importing into Database
```bash
# Example: Import categories using psql (PostgreSQL)
psql -U username -d database_name -c "\COPY kv_store_b11e7096(key, value) FROM PROGRAM 'awk -F\"\t\" \"NR>1 {print \\\"category:\\\" \$1 \\\"\t{\\\" \$2 \\\"}\\\" }\" DELIMITER '\t' CSV"
```

### Converting to CSV
```bash
# Convert TSV to CSV (replace tabs with commas)
sed 's/\t/,/g' data_export_categories.tsv > data_export_categories.csv
```

### Using in Python
```python
import pandas as pd

# Read TSV file
categories = pd.read_csv('data_export_categories.tsv', sep='\t')
dishes = pd.read_csv('data_export_dishes.tsv', sep='\t')
orders = pd.read_csv('data_export_orders.tsv', sep='\t')

# Display data
print(categories)
print(dishes[['name_en', 'name_zh', 'price', 'category_id']])
print(orders[['customer_name', 'dish_ids', 'status']])
```

---

## Data Relationships

**Foreign Keys:**
- `dishes.category_id` → `categories.id`
- `orders.dish_ids` → `dishes.id` (pipe-separated list)

**Example Relationships:**
- Category "Main Courses" (550e8400-e29b-41d4-a716-446655440002) contains:
  - Mapo Tofu
  - Kung Pao Chicken
  - Orange Chicken

- Order by John Smith includes:
  - Spring Rolls (from Appetizers)
  - Kung Pao Chicken (from Main Courses)

---

## Database Schema Reference

All this data is stored in the `kv_store_b11e7096` table in Supabase:

```sql
CREATE TABLE kv_store_b11e7096 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

**Storage Format:**
- Categories: `category:{id}` → JSON object
- Dishes: `dish:{id}` → JSON object
- Orders: `order:{id}` → JSON object

---

## Notes

- All UUIDs in these files are sample/demo values
- Timestamps are in ISO 8601 format (UTC)
- Photo URLs point to external Unsplash images for demo purposes
- Chinese text uses Simplified Chinese (Mainland China standard)
- Headers use only alphanumeric characters, hyphens (-), and underscores (_)
- No special characters in header names for database compatibility

---

## How Data Appears on Website

**Menu Page** (`/menu`):
- Displays all dishes grouped by category
- Shows dish name, description, price, and photo
- Users can search and filter by category

**Admin Dashboard** (`/admin`):
- Manage categories, add/edit/delete dishes
- View all orders with customer details
- Update order status
- Reorder dishes via drag-and-drop

**Seeding** (via `POST /make-server-b11e7096/seed`):
- Clears existing data first
- Populates all categories, dishes, and orders
- Can be triggered from admin dashboard
