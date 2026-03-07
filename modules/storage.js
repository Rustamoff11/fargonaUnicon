import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const DATA_DIR = "./data";
const FILE = path.join(DATA_DIR, "users.json");

// SUPABASE
const supabase = process.env.SUPABASE_URL
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  : null;


// Papka bo‘lmasa yaratadi
async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]");
  }
}


// JSON dan o‘qish
export async function readUsers() {
  await ensureFile();
  const data = await fs.readFile(FILE, "utf-8");
  return JSON.parse(data);
}


// JSON ga yozish
export async function saveUsers(users) {
  await ensureFile();
  await fs.writeFile(FILE, JSON.stringify(users, null, 2));
}


// USER olish
export async function getUser(id) {

  // SUPABASE dan olish
  if (supabase) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (data) return data;
  }

  // JSON fallback
  const users = await readUsers();
  return users.find(u => u.id === id);
}



// USER saqlash
export async function saveUser(id, newData) {

  let user;

  // SUPABASE ga yozish
  if (supabase) {

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) {
      user = {
        id,
        createdAt: new Date().toISOString(),
        active: false,
        actions: [],
        ...newData
      };

      await supabase.from("users").insert(user);

    } else {

      user = { ...data, ...newData };

      await supabase
        .from("users")
        .update(user)
        .eq("id", id);
    }

    return;
  }


  // JSON fallback
  const users = await readUsers();

  user = users.find(u => u.id === id);

  if (!user) {
    user = {
      id,
      createdAt: new Date().toISOString(),
      active: false,
      actions: []
    };
    users.push(user);
  }

  Object.assign(user, newData);

  await saveUsers(users);
}