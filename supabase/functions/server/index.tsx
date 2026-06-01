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

Deno.serve(app.fetch);