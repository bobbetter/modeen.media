import { users, type User, type InsertUser, contacts, type Contact, type InsertContact, products, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: insertUser.isAdmin === true
    }).returning();
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const created_at = new Date().toISOString();
    const [contact] = await db.insert(contacts).values({
      ...insertContact,
      created_at
    }).returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const created_at = new Date().toISOString();
    const [product] = await db.insert(products).values({
      ...insertProduct,
      created_at
    }).returning();
    return product;
  }
  
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async updateProduct(id: number, insertProduct: InsertProduct): Promise<Product | undefined> {
    const [updated] = await db.update(products)
      .set(insertProduct)
      .where(eq(products.id, id))
      .returning();
    
    return updated || undefined;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return !!result;
  }
}

// Initialize the storage
export const storage = new DatabaseStorage();

// Create a default admin user if it doesn't exist
(async () => {
  try {
    const adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      await storage.createUser({
        username: "admin",
        password: "admin123",
        isAdmin: true
      });
      console.log("Default admin user created");
    }
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }
})();
