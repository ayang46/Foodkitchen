# Seeding the Database with Test Data

This guide explains how to populate your Foodkitchen database with test menu items, categories, and orders for demo purposes.

## Overview

The seeding script adds:
- **5 Categories**: Appetizers, Main Courses, Soups, Vegetables, Rice & Noodles
- **10 Dishes**: Popular Chinese home-cooked dishes with accurate descriptions and ingredients
  - Spring Rolls
  - Mapo Tofu
  - Kung Pao Chicken
  - Hot and Sour Soup
  - Egg Drop Soup
  - Stir-fried Vegetables with Garlic
  - Eggplant in Garlic Sauce
  - Fried Rice with Shrimp
  - Chow Mein
  - Orange Chicken
- **5 Sample Orders**: Various customer orders with different statuses (pending, confirmed, completed)

## How to Seed the Database

### Prerequisites
1. Must have a test admin account (visit `/setup` to create one if needed)
2. Must be logged in as admin
3. Test credentials: `test@test.com` / `test-12345`

### Method 1: Using the Admin Dashboard (Easiest)

1. Go to `/admin` and log in with your test credentials
2. Navigate to the admin dashboard
3. Look for a "Seed Database" button on the dashboard
4. Click the button to populate the database with test data
5. Verify the data appears in the menu and orders

### Method 2: Using cURL Command

Once logged in and have your auth token:

```bash
# First, get your access token by logging in
curl -X POST https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-b11e7096/auth/signin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@test.com","password":"test-12345"}'

# This returns an access_token, use it in the seed request:
curl -X POST https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-b11e7096/seed \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN_FROM_ABOVE"
```

### Method 3: Using JavaScript Console (from Browser)

1. Log in to the admin dashboard at `/admin`
2. Open your browser's developer console (F12 or right-click → Inspect → Console)
3. Run this code:

```javascript
const projectId = 'YOUR_PROJECT_ID'; // Get from admin dashboard
const accessToken = localStorage.getItem('authToken'); // Should be available after login

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b11e7096/seed`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  }
})
.then(r => r.json())
.then(data => console.log('Seeded:', data))
.catch(e => console.error('Error:', e));
```

## Test Data Details

### Dishes Included

1. **Spring Rolls** (Appetizers) - $6.99
   - Crispy fried spring rolls with shrimp and vegetables

2. **Mapo Tofu** (Main Courses) - $10.99
   - Spicy tofu with minced pork and Sichuan peppercorn

3. **Kung Pao Chicken** (Main Courses) - $12.99
   - Tender chicken with peanuts and dried chilies

4. **Hot and Sour Soup** (Soups) - $5.99
   - Tangy soup with tofu, mushrooms, and bamboo shoots

5. **Egg Drop Soup** (Soups) - $4.99
   - Silky chicken broth with egg ribbons

6. **Stir-fried Vegetables with Garlic** (Vegetables) - $7.99
   - Fresh mixed vegetables with garlic in light soy sauce

7. **Eggplant in Garlic Sauce** (Vegetables) - $8.99
   - Tender eggplant in rich garlic and spicy sauce

8. **Fried Rice with Shrimp** (Rice & Noodles) - $11.99
   - Jasmine rice with shrimp, peas, and carrots

9. **Chow Mein** (Rice & Noodles) - $10.99
   - Crispy noodles with chicken and vegetables

10. **Orange Chicken** (Main Courses) - $13.99
    - Crispy chicken in tangy orange and ginger sauce

### Sample Orders

Five sample orders are created with:
- Different customer names and contact information
- Various combinations of dishes
- Different order statuses (pending, confirmed, completed)
- Orders timestamped at different times for realistic data
- Mixed language support (English and Chinese)

## Clearing the Test Data

If you want to start fresh and clear all data:

1. The `/seed` endpoint automatically clears existing categories, dishes, and orders before adding new ones
2. Simply run the seed command again to reset all data
3. Or manually delete items through the admin interface

## Troubleshooting

- **"Unauthorized" error**: Make sure you're logged in as admin first
- **No data appears**: Wait a few seconds and refresh the page
- **Photos not loading**: The demo uses external Unsplash URLs as placeholders; they may not always load
- **"Failed to seed" error**: Check browser console for detailed error message

## Next Steps

After seeding:
1. View the menu at `/menu` to see all dishes
2. Create your own orders through the form at `/order`
3. Manage dishes and categories in the admin panel at `/admin`
4. View and respond to orders in the orders management section

