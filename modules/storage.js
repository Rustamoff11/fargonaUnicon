import fs from "fs/promises";
import path from "path";

const DATA_DIR = "./data";
const FILE = path.join(DATA_DIR, "users.json");

// Papka yoki fayl bo‘lmasa yaratadi
async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]");
  }
}

// Foydalanuvchilar ro‘yxatini o‘qish
export async function readUsers() {
  await ensureFile();
  const data = await fs.readFile(FILE, "utf-8");
  return JSON.parse(data);
}

// Foydalanuvchilar ro‘yxatini saqlash
export async function saveUsers(users) {
  await ensureFile();
  await fs.writeFile(FILE, JSON.stringify(users, null, 2));
}

// Foydalanuvchi ma’lumotini olish
export async function getUser(id) {
  id = Number(id); // ID raqamga aylantiriladi
  const users = await readUsers();
  return users.find(u => u.id === id);
}

// Foydalanuvchi ma’lumotini saqlash yoki yangilash
export async function saveUser(id, newData) {
  id = Number(id);

  const users = await readUsers();
  let user = users.find(u => u.id === id);

  if (!user) {
    user = {
      id,
      createdAt: new Date().toISOString(),
      active: false,
      district: null,
      lastMessageId: null,
      lastRequestDate: null,
      actions: []
    };
    users.push(user);
  }

  // Agar action qo‘shilsa, actions massiviga qo‘shiladi
  if (newData.action) {
    user.actions.push({
      action: newData.action,
      date: new Date().toISOString()
    });
    delete newData.action;
  }

  Object.assign(user, newData);

  await saveUsers(users);
}