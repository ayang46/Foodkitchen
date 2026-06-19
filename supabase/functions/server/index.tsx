import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// PUBLIC config endpoint - no auth required
app.get("/make-server-b11e7096/public-config", (c) => {
  const url = Deno.env.get('SUPABASE_URL') || '';
  const projectId = url.replace('https://', '').split('.')[0];
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  console.log('Serving public config:', { projectId, hasAnonKey: !!anonKey });

  return c.json({
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
    projectId
  });
});

// Helper to get authenticated user
const getAuthUser = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) return null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return null;
  return user;
};

// Initialize storage bucket for dish photos
const initStorage = async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const bucketName = 'make-b11e7096-dish-photos';
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false });
    console.log('Created storage bucket:', bucketName);
  }
};

initStorage();

// Health check endpoint
app.get("/make-server-b11e7096/health", (c) => {
  return c.json({ status: "ok" });
});

// Config endpoint - returns public configuration
app.get("/make-server-b11e7096/config", (c) => {
  const url = Deno.env.get('SUPABASE_URL') || '';
  const projectId = url.replace('https://', '').split('.')[0];

  return c.json({
    projectId,
    publicAnonKey: Deno.env.get('SUPABASE_ANON_KEY'),
  });
});

// AUTH ROUTES
app.post("/make-server-b11e7096/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.log('Sign up error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Sign up error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

app.post("/make-server-b11e7096/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Sign in error:', error);
      return c.json({ error: error.message }, 401);
    }

    return c.json({
      access_token: data.session.access_token,
      user: data.user
    });
  } catch (error) {
    console.log('Sign in error:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

app.post("/make-server-b11e7096/auth/signout", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    await supabase.auth.signOut();
    return c.json({ success: true });
  } catch (error) {
    console.log('Sign out error:', error);
    return c.json({ error: 'Failed to sign out' }, 500);
  }
});

app.get("/make-server-b11e7096/auth/session", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ user: null });
    }
    return c.json({ user });
  } catch (error) {
    console.log('Session error:', error);
    return c.json({ user: null });
  }
});

// CATEGORY ROUTES
app.get("/make-server-b11e7096/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix('category:');
    return c.json({ categories });
  } catch (error) {
    console.log('Failed to fetch categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

app.post("/make-server-b11e7096/categories", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const { nameEn, nameZh } = await c.req.json();
    const id = crypto.randomUUID();
    const category = {
      id,
      nameEn,
      nameZh,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`category:${id}`, category);
    return c.json({ category });
  } catch (error) {
    console.log('Failed to create category:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

app.put("/make-server-b11e7096/categories/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const id = c.req.param('id');
    const { nameEn, nameZh } = await c.req.json();

    const existing = await kv.get(`category:${id}`);
    if (!existing) {
      return c.json({ error: 'Category not found' }, 404);
    }

    const category = {
      ...existing,
      nameEn,
      nameZh,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`category:${id}`, category);
    return c.json({ category });
  } catch (error) {
    console.log('Failed to update category:', error);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

app.delete("/make-server-b11e7096/categories/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`category:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Failed to delete category:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// DISH ROUTES
app.get("/make-server-b11e7096/dishes", async (c) => {
  try {
    const search = c.req.query('search') || '';
    const category = c.req.query('category') || '';
    const availableOnly = c.req.query('available') === 'true';

    let dishes = await kv.getByPrefix('dish:');

    if (search) {
      const searchLower = search.toLowerCase();
      dishes = dishes.filter((dish: any) =>
        dish.nameEn.toLowerCase().includes(searchLower) ||
        dish.nameZh.includes(search) ||
        dish.descriptionEn.toLowerCase().includes(searchLower) ||
        dish.descriptionZh.includes(search) ||
        dish.ingredientsEn.toLowerCase().includes(searchLower) ||
        dish.ingredientsZh.includes(search)
      );
    }

    if (category) {
      dishes = dishes.filter((dish: any) => dish.categoryId === category);
    }

    if (availableOnly) {
      dishes = dishes.filter((dish: any) => dish.available);
    }

    return c.json({ dishes });
  } catch (error) {
    console.log('Failed to fetch dishes:', error);
    return c.json({ error: 'Failed to fetch dishes' }, 500);
  }
});

app.get("/make-server-b11e7096/dishes/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const dish = await kv.get(`dish:${id}`);

    if (!dish) {
      return c.json({ error: 'Dish not found' }, 404);
    }

    return c.json({ dish });
  } catch (error) {
    console.log('Failed to fetch dish:', error);
    return c.json({ error: 'Failed to fetch dish' }, 500);
  }
});

app.post("/make-server-b11e7096/dishes", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const { nameEn, nameZh, descriptionEn, descriptionZh, ingredientsEn, ingredientsZh, price, categoryId, available, photoUrl } = await c.req.json();

    const id = crypto.randomUUID();
    const dish = {
      id,
      nameEn,
      nameZh,
      descriptionEn,
      descriptionZh,
      ingredientsEn,
      ingredientsZh,
      price,
      categoryId,
      available: available ?? true,
      photoUrl: photoUrl || '',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`dish:${id}`, dish);
    return c.json({ dish });
  } catch (error) {
    console.log('Failed to create dish:', error);
    return c.json({ error: 'Failed to create dish' }, 500);
  }
});

app.put("/make-server-b11e7096/dishes/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();

    const existing = await kv.get(`dish:${id}`);
    if (!existing) {
      return c.json({ error: 'Dish not found' }, 404);
    }

    const dish = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`dish:${id}`, dish);
    return c.json({ dish });
  } catch (error) {
    console.log('Failed to update dish:', error);
    return c.json({ error: 'Failed to update dish' }, 500);
  }
});

app.delete("/make-server-b11e7096/dishes/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`dish:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Failed to delete dish:', error);
    return c.json({ error: 'Failed to delete dish' }, 500);
  }
});

// PHOTO UPLOAD ROUTE
app.post("/make-server-b11e7096/upload-photo", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const bucketName = 'make-b11e7096-dish-photos';
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.log('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload photo' }, 500);
    }

    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10);

    return c.json({ url: urlData.signedUrl });
  } catch (error) {
    console.log('Photo upload error:', error);
    return c.json({ error: 'Failed to upload photo' }, 500);
  }
});

// ORDER INQUIRY ROUTES
app.post("/make-server-b11e7096/orders", async (c) => {
  try {
    const { customerName, customerEmail, customerPhone, dishIds, message, language } = await c.req.json();

    const id = crypto.randomUUID();
    const order = {
      id,
      customerName,
      customerEmail,
      customerPhone,
      dishIds,
      message,
      language,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`order:${id}`, order);
    return c.json({ order });
  } catch (error) {
    console.log('Failed to create order inquiry:', error);
    return c.json({ error: 'Failed to create order inquiry' }, 500);
  }
});

app.get("/make-server-b11e7096/orders", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const orders = await kv.getByPrefix('order:');
    return c.json({ orders: orders.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )});
  } catch (error) {
    console.log('Failed to fetch orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

app.put("/make-server-b11e7096/orders/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();

    const existing = await kv.get(`order:${id}`);
    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const order = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order:${id}`, order);
    return c.json({ order });
  } catch (error) {
    console.log('Failed to update order:', error);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

app.delete("/make-server-b11e7096/orders/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`order:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Failed to delete order:', error);
    return c.json({ error: 'Failed to delete order' }, 500);
  }
});

// SEED DATA ENDPOINT
app.post("/make-server-b11e7096/seed", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized - admin access required' }, 401);
    }

    // Clear existing data
    const existingCategories = await kv.getByPrefix('category:');
    const existingDishes = await kv.getByPrefix('dish:');
    const existingOrders = await kv.getByPrefix('order:');

    for (const cat of existingCategories) {
      await kv.del(`category:${cat.id}`);
    }
    for (const dish of existingDishes) {
      await kv.del(`dish:${dish.id}`);
    }
    for (const order of existingOrders) {
      await kv.del(`order:${order.id}`);
    }

    // Create test categories
    const categories = [
      { nameEn: 'Appetizers', nameZh: '开胃菜' },
      { nameEn: 'Main Courses', nameZh: '主菜' },
      { nameEn: 'Soups', nameZh: '汤' },
      { nameEn: 'Vegetables', nameZh: '蔬菜' },
      { nameEn: 'Rice & Noodles', nameZh: '米饭和面条' },
    ];

    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      const id = crypto.randomUUID();
      categoryMap[cat.nameEn] = id;
      const category = {
        id,
        nameEn: cat.nameEn,
        nameZh: cat.nameZh,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`category:${id}`, category);
    }

    // Create test dishes
    const dishes = [
      {
        nameEn: 'Spring Rolls',
        nameZh: '春卷',
        descriptionEn: 'Crispy fried spring rolls filled with vegetables and shrimp',
        descriptionZh: '脆皮炸春卷，内馅是蔬菜和虾',
        ingredientsEn: 'Spring roll wrappers, shrimp, cabbage, carrots, mushrooms, soy sauce',
        ingredientsZh: '春卷皮、虾、卷心菜、胡萝卜、蘑菇、酱油',
        price: 6.99,
        categoryId: categoryMap['Appetizers'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1606080945470-343f7a360a1d?w=500',
      },
      {
        nameEn: 'Mapo Tofu',
        nameZh: '麻婆豆腐',
        descriptionEn: 'Spicy and numbing tofu dish with minced pork and Sichuan peppercorn sauce',
        descriptionZh: '辛辣而麻木的豆腐菜，配肉末和四川花椒酱',
        ingredientsEn: 'Soft tofu, ground pork, Sichuan peppercorn, chili oil, garlic, ginger, soy sauce',
        ingredientsZh: '嫩豆腐、肉末、四川花椒、辣油、大蒜、生姜、酱油',
        price: 10.99,
        categoryId: categoryMap['Main Courses'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      },
      {
        nameEn: 'Kung Pao Chicken',
        nameZh: '宫保鸡丁',
        descriptionEn: 'Tender chicken cubes stir-fried with peanuts and dried chilies in a sweet and savory sauce',
        descriptionZh: '嫩鸡丁与花生和干辣椒炒，配甜咸酱',
        ingredientsEn: 'Chicken breast, peanuts, dried red chilies, bell peppers, soy sauce, vinegar, sugar, garlic',
        ingredientsZh: '鸡胸肉、花生、干红辣椒、青椒、酱油、醋、糖、大蒜',
        price: 12.99,
        categoryId: categoryMap['Main Courses'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1626730488232-7dca56fdfc5e?w=500',
      },
      {
        nameEn: 'Hot and Sour Soup',
        nameZh: '酸辣汤',
        descriptionEn: 'Tangy and spicy soup with tofu, mushrooms, and bamboo shoots',
        descriptionZh: '酸辣汤，配豆腐、蘑菇和竹笋',
        ingredientsEn: 'Tofu, mushrooms, bamboo shoots, wood ear fungus, chicken broth, rice vinegar, white pepper, chili oil',
        ingredientsZh: '豆腐、蘑菇、竹笋、木耳、鸡汤、米醋、白胡椒、辣油',
        price: 5.99,
        categoryId: categoryMap['Soups'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500',
      },
      {
        nameEn: 'Egg Drop Soup',
        nameZh: '蛋花汤',
        descriptionEn: 'Silky smooth chicken broth with egg ribbons and green onions',
        descriptionZh: '鸡汤配蛋花和绿葱',
        ingredientsEn: 'Chicken broth, eggs, cornstarch, green onions, salt, white pepper',
        ingredientsZh: '鸡汤、鸡蛋、淀粉、绿葱、盐、白胡椒',
        price: 4.99,
        categoryId: categoryMap['Soups'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1568084308-db1a60dcc9e6?w=500',
      },
      {
        nameEn: 'Stir-fried Vegetables with Garlic',
        nameZh: '蒜炒蔬菜',
        descriptionEn: 'Fresh mixed vegetables stir-fried with lots of garlic in a light soy sauce',
        descriptionZh: '新鲜混合蔬菜与大蒜炒，配清淡酱油',
        ingredientsEn: 'Broccoli, snap peas, carrots, bell peppers, garlic, soy sauce, sesame oil, ginger',
        ingredientsZh: '西兰花、豌豆荚、胡萝卜、青椒、大蒜、酱油、麻油、生姜',
        price: 7.99,
        categoryId: categoryMap['Vegetables'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b5?w=500',
      },
      {
        nameEn: 'Eggplant in Garlic Sauce',
        nameZh: '蒜泥茄子',
        descriptionEn: 'Tender eggplant pieces coated in a rich garlic and spicy sauce',
        descriptionZh: '嫩茄子块配蒜和辣酱',
        ingredientsEn: 'Eggplant, garlic, chili oil, soy sauce, vinegar, sesame oil, scallions',
        ingredientsZh: '茄子、大蒜、辣油、酱油、醋、麻油、葱',
        price: 8.99,
        categoryId: categoryMap['Vegetables'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1577000522272-dc53aaf41901?w=500',
      },
      {
        nameEn: 'Fried Rice with Shrimp',
        nameZh: '虾炒饭',
        descriptionEn: 'Fluffy jasmine rice stir-fried with shrimp, peas, carrots, and scrambled eggs',
        descriptionZh: '蓬松的茉莉花米饭与虾、豌豆、胡萝卜和炒鸡蛋炒',
        ingredientsEn: 'Jasmine rice, shrimp, peas, carrots, eggs, soy sauce, sesame oil, garlic, green onions',
        ingredientsZh: '茉莉花米、虾、豌豆、胡萝卜、鸡蛋、酱油、麻油、大蒜、葱',
        price: 11.99,
        categoryId: categoryMap['Rice & Noodles'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1585238341710-4b2f3c583de1?w=500',
      },
      {
        nameEn: 'Chow Mein',
        nameZh: '炒面',
        descriptionEn: 'Crispy noodles stir-fried with chicken, vegetables, and savory sauce',
        descriptionZh: '脆面与鸡肉、蔬菜和咸味酱炒',
        ingredientsEn: 'Chow mein noodles, chicken, cabbage, carrots, bell peppers, soy sauce, garlic, sesame oil',
        ingredientsZh: '炒面、鸡肉、卷心菜、胡萝卜、青椒、酱油、大蒜、麻油',
        price: 10.99,
        categoryId: categoryMap['Rice & Noodles'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561541?w=500',
      },
      {
        nameEn: 'Orange Chicken',
        nameZh: '橙子鸡',
        descriptionEn: 'Crispy chicken in a tangy orange and ginger sauce with a hint of chili',
        descriptionZh: '脆鸡配橙子和生姜酱，带一点辣椒',
        ingredientsEn: 'Chicken, orange juice, ginger, garlic, chili peppers, soy sauce, honey, sesame seeds',
        ingredientsZh: '鸡肉、橙汁、生姜、大蒜、辣椒、酱油、蜂蜜、芝麻',
        price: 13.99,
        categoryId: categoryMap['Main Courses'],
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500',
      },
    ];

    const dishMap: Record<string, string> = {};
    for (const dish of dishes) {
      const id = crypto.randomUUID();
      dishMap[dish.nameEn] = id;
      const dishData = {
        id,
        ...dish,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`dish:${id}`, dishData);
    }

    // Create test orders
    const orders = [
      {
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        customerPhone: '555-0101',
        dishIds: [dishMap['Spring Rolls'], dishMap['Kung Pao Chicken']],
        message: 'Please make the Kung Pao Chicken extra spicy',
        language: 'en',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        customerName: '李美丽',
        customerEmail: 'li@example.com',
        customerPhone: '555-0102',
        dishIds: [dishMap['Mapo Tofu'], dishMap['Fried Rice with Shrimp'], dishMap['Hot and Sour Soup']],
        message: '麻婆豆腐要辣的',
        language: 'zh',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        customerName: 'Maria Garcia',
        customerEmail: 'maria@example.com',
        customerPhone: '555-0103',
        dishIds: [dishMap['Eggplant in Garlic Sauce'], dishMap['Stir-fried Vegetables with Garlic']],
        message: 'Vegetarian options - no meat please',
        language: 'en',
        status: 'pending',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        customerName: 'Chen Wei',
        customerEmail: 'chen@example.com',
        customerPhone: '555-0104',
        dishIds: [dishMap['Orange Chicken'], dishMap['Chow Mein']],
        message: 'Add extra sauce on the side',
        language: 'en',
        status: 'completed',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
      {
        customerName: 'Sophie Lee',
        customerEmail: 'sophie@example.com',
        customerPhone: '555-0105',
        dishIds: [dishMap['Egg Drop Soup'], dishMap['Fried Rice with Shrimp']],
        message: '',
        language: 'en',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const order of orders) {
      const id = crypto.randomUUID();
      const orderData = {
        id,
        ...order,
        createdAt: order.createdAt,
      };
      await kv.set(`order:${id}`, orderData);
    }

    return c.json({
      success: true,
      message: 'Database seeded with test data',
      stats: {
        categories: categories.length,
        dishes: dishes.length,
        orders: orders.length,
      },
    });
  } catch (error) {
    console.log('Seed error:', error);
    return c.json({ error: 'Failed to seed database', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);