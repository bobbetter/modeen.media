import {
  users,
  type User,
  type InsertUser,
  contacts,
  type Contact,
  type InsertContact,
  products,
  type Product,
  type InsertProduct,
  download_links,
  type DownloadLink,
  type InsertDownloadLink,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  deleteContact(id: number): Promise<Contact | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  updateProduct(
    id: number,
    product: InsertProduct,
  ): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Download links methods
  createDownloadLink(downloadLink: InsertDownloadLink): Promise<DownloadLink>;
  getDownloadLinks(): Promise<DownloadLink[]>;
  getDownloadLinksByProductId(productId: number): Promise<DownloadLink[]>;
  getDownloadLinksBySessionId(sessionId: string): Promise<DownloadLink[]>;
  getDownloadLink(id: number): Promise<DownloadLink | undefined>;
  incrementDownloadCount(id: number): Promise<DownloadLink | undefined>;
  deleteDownloadLink(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isAdmin: insertUser.isAdmin === true,
      })
      .returning();
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const created_at = new Date().toISOString();
    const [contact] = await db
      .insert(contacts)
      .values({
        ...insertContact,
        created_at,
      })
      .returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async deleteContact(id: number): Promise<Contact | undefined> {
    const [deleted] = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning();
    return deleted || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const created_at = new Date().toISOString();
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        created_at,
      })
      .returning();
    return product;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product || undefined;
  }

  async updateProduct(
    id: number,
    insertProduct: InsertProduct,
  ): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set(insertProduct)
      .where(eq(products.id, id))
      .returning();

    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return !!result;
  }

  // Download links implementation
  async createDownloadLink(
    insertDownloadLink: InsertDownloadLink,
  ): Promise<DownloadLink> {
    const created_at = new Date().toISOString();
    console.log("++++Creating download link with data:", insertDownloadLink);
    const [downloadLink] = await db
      .insert(download_links)
      .values({
        ...insertDownloadLink,
        download_count: 0,
        created_at,
      })
      .returning();
    return downloadLink;
  }

  // Update Download Link with actual URL
  async updateDownloadLink(
    id: number,
    download_link: string,
  ): Promise<DownloadLink | undefined> {
    console.log(
      "-----Updating download link with id:",
      id,
      "and URL:",
      download_link,
    );
    const [updated] = await db
      .update(download_links)
      .set({ download_link: download_link })
      .where(eq(download_links.id, id))
      .returning();
    return updated || undefined;
  }

  async getDownloadLinks(): Promise<DownloadLink[]> {
    return await db.select().from(download_links);
  }

  async getDownloadLinksByProductId(
    productId: number,
  ): Promise<DownloadLink[]> {
    return await db
      .select()
      .from(download_links)
      .where(eq(download_links.product_id, productId));
  }

  async getDownloadLinksBySessionId(
    sessionId: string,
  ): Promise<DownloadLink[]> {
    return await db
      .select()
      .from(download_links)
      .where(eq(download_links.session_id, sessionId));
  }

  async getDownloadLink(id: number): Promise<DownloadLink | undefined> {
    const [downloadLink] = await db
      .select()
      .from(download_links)
      .where(eq(download_links.id, id));
    return downloadLink || undefined;
  }

  async incrementDownloadCount(id: number): Promise<DownloadLink | undefined> {
    const downloadLink = await this.getDownloadLink(id);
    if (!downloadLink) return undefined;

    const [updated] = await db
      .update(download_links)
      .set({
        download_count: downloadLink.download_count + 1,
      })
      .where(eq(download_links.id, id))
      .returning();

    return updated || undefined;
  }

  async deleteDownloadLink(id: number): Promise<boolean> {
    const result = await db
      .delete(download_links)
      .where(eq(download_links.id, id));
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
        isAdmin: true,
      });
      console.log("Default admin user created");
    }
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }
})();
