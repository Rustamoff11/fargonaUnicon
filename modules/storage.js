import fs from "fs/promises";
import path from "path";

const DATA_DIR = "./data";
const FILE_PATH = path.join(DATA_DIR, "users.json");

// =============================
// FILE TEKSHIRISH / YARATISH
// =============================

async function ensureFile() {
try {
await fs.mkdir(DATA_DIR, { recursive: true });
await fs.access(FILE_PATH);
} catch {
await fs.writeFile(FILE_PATH, "[]", "utf8");
}
}

// =============================
// USERS O‘QISH
// =============================

export async function readUsers() {
await ensureFile();

try {
const data = await fs.readFile(FILE_PATH, "utf8");
return JSON.parse(data);
} catch (err) {
console.log("❌ users.json o‘qishda xato:", err.message);
return [];
}
}

// =============================
// USERS SAQLASH
// =============================

export async function saveUsers(users) {
await ensureFile();

try {
await fs.writeFile(
FILE_PATH,
JSON.stringify(users, null, 2),
"utf8"
);
} catch (err) {
console.log("❌ users.json yozishda xato:", err.message);
}
}

// =============================
// BITTA USER OLISH
// =============================

export async function getUser(id) {

id = Number(id);

const users = await readUsers();

return users.find(user => user.id === id);

}

// =============================
// USER SAQLASH / UPDATE
// =============================

export async function saveUser(id, newData = {}) {

id = Number(id);

const users = await readUsers();

let user = users.find(u => u.id === id);

// YANGI USER
if (!user) {

```
user = {
  id,
  active: false,
  phone: null,
  district: null,
  lastMessageId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

users.push(user);
```

}

// DATA UPDATE
Object.assign(user, newData);

user.updatedAt = new Date().toISOString();

await saveUsers(users);

return user;

}
