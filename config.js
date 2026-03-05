import dotenv from 'dotenv';
dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || "";
export const ADMIN_ID = process.env.ADMIN_ID
  ? process.env.ADMIN_ID.split(",").map(Number)
  : [];

export const DISTRICTS = [
  { name: "Farg‘ona T", groupId: -1003874541804 },
  { name: "Oltiariq", groupId: -1003874541804 },
  { name: "Quvasoy", groupId: -1003874541804 },
  { name: "Qo‘qon", groupId:-1003874541804 },
  { name: "Marg‘ilon", groupId: -1003874541804 },
  { name: "Quva", groupId:-1003874541804 },
  { name: "Yozyovon", groupId:-1003874541804 },
  { name: "Toshloq", groupId: -1003874541804 },
  { name: "Qo‘shtepa", groupId:-1003874541804},
  { name: "Rishton", groupId: -1003874541804 },
  { name: "Bog‘dod", groupId: -1003874541804},
  { name: "Buvayda", groupId: -1003874541804 },
  { name: "So‘x", groupId: -1003874541804 },
  { name: "Dang‘ara", groupId:-1003874541804 },
  { name: "Beshariq", groupId: -1003874541804},
  { name: "O‘zbekiston", groupId: -1003874541804 },
  { name: "Furqat", groupId: -1003874541804 },
  { name: "Uchkoprik", groupId:  -1003874541804},
  { name: "Farg‘ona Sh", groupId:  -1003874541804 },
];