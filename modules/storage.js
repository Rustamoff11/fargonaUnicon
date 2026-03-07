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

  if (supabase) {
    try {

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Supabase getUser error:", error);
      }

      if (data) return data;

    } catch (err) {
      console.error("Supabase connection error:", err);
    }
  }

  // JSON fallback
  const users = await readUsers();
  return users.find(u => u.id === id);
}



// USER saqlash
export async function saveUser(id, newData) {

  let user;

  if (supabase) {
    try {

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!data) {
        user = {
          id,
          createdAt: new Date().toISOString(),
          active: false,
          actions: [],
          ...newData
        };
      } else {
        user = { ...data, ...newData };
      }

      const { error } = await supabase
        .from("users")
        .upsert({
          ...user,
          createdat: user.createdAt
        });

      if (error) {
        console.error("Supabase saveUser error:", error);
      }

      return;

    } catch (err) {
      console.error("Supabase connection error:", err);
    }
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