import fs from "fs/promises";
import path from "path";

const DATA_DIR = "./data";
const FILE = path.join(DATA_DIR, "users.json");

// Papka bo‘lmasa yaratadi
async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]");
  }
}

export async function readUsers() {
  await ensureFile();
  const data = await fs.readFile(FILE, "utf-8");
  return JSON.parse(data);
}

export async function saveUsers(users) {
  await ensureFile();
  await fs.writeFile(FILE, JSON.stringify(users, null, 2));
}

export async function getUser(id) {
  id = Number(id); // ID ni number qilish
  const users = await readUsers();
  return users.find(u => u.id === id);
}

export async function saveUser(id, newData) {
  id = Number(id); // ID ni number qilish

  const users = await readUsers();

  let user = users.find(u => u.id === id);

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