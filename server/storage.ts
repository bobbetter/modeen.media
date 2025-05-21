import { users, type User, type InsertUser, contacts, type Contact, type InsertContact, products, type Product, type InsertProduct } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private products: Map<number, Product>;
  currentUserId: number;
  currentContactId: number;
  currentProductId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.products = new Map();
    this.currentUserId = 1;
    this.currentContactId = 1;
    this.currentProductId = 1;
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    // Ensure isAdmin is properly set with a default value if not provided
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin === true
    };
    this.users.set(id, user);
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const created_at = new Date().toISOString();
    const contact: Contact = { ...insertContact, id, created_at };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const created_at = new Date().toISOString();
    const product: Product = { ...insertProduct, id, created_at };
    this.products.set(id, product);
    return product;
  }
  
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async updateProduct(id: number, insertProduct: InsertProduct): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    
    if (!existingProduct) {
      return undefined;
    }
    
    const updated: Product = { 
      ...existingProduct, 
      ...insertProduct,
    };
    
    this.products.set(id, updated);
    return updated;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
}

export const storage = new MemStorage();
