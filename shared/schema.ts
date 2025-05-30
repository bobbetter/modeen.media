import { pgTable, text, serial, integer, boolean, numeric, jsonb, timestamp, foreignKey, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  created_at: text("created_at").notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  message: true,
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  category: text("category").default("").notNull(),
  tags: text("tags").array().default([]).notNull(),
  fileUrl: text("file_url"),
  display_image_url: text("display_image_url"),
  created_at: text("created_at").notNull(),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  tags: true,
  fileUrl: true,
  display_image_url: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export const download_links = pgTable("download_links", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  session_id: text("session_id"),
  download_link: text("download_link").notNull(),
  signed_s3_url: text("signed_s3_url"),
  download_count: integer("download_count").default(0).notNull(),
  max_download_count: integer("max_download_count").default(0).notNull(),
  expire_after_seconds: integer("expire_after_seconds").default(0).notNull(),
  created_by: jsonb("created_by").notNull(),
  created_at: text("created_at").notNull(),
}, (table) => ({
  sessionIdIdx: index("session_id_idx").on(table.session_id),
}));

export const insertDownloadLinkSchema = createInsertSchema(download_links).pick({
  product_id: true,
  session_id: true,
  download_link: true,
  signed_s3_url: true,
  max_download_count: true,
  expire_after_seconds: true,
  created_by: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertDownloadLink = z.infer<typeof insertDownloadLinkSchema>;
export type DownloadLink = typeof download_links.$inferSelect;
