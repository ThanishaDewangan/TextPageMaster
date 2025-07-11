import { users, products, invoices, invoiceItems, type User, type InsertUser, type Product, type InsertProduct, type Invoice, type InsertInvoice, type InvoiceItem } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Product methods
  createProduct(insertProduct: InsertProduct & { userId: number; total: string; gst: string }): Promise<Product>;
  getUserProducts(userId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  
  // Invoice methods
  createInvoice(insertInvoice: InsertInvoice & { userId: number; invoiceNumber: string; subtotal: string; totalGst: string; totalAmount: string }): Promise<Invoice>;
  getUserInvoices(userId: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  
  // Invoice Item methods
  createInvoiceItem(item: { invoiceId: number; productName: string; quantity: number; rate: string; total: string }): Promise<InvoiceItem>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createProduct(insertProduct: InsertProduct & { userId: number; total: string; gst: string }): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        name: insertProduct.name,
        userId: insertProduct.userId,
        quantity: insertProduct.quantity,
        rate: insertProduct.rate,
        total: insertProduct.total,
        gst: insertProduct.gst
      })
      .returning();
    return product;
  }

  async getUserProducts(userId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.userId, userId));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async createInvoice(insertInvoice: InsertInvoice & { userId: number; invoiceNumber: string; subtotal: string; totalGst: string; totalAmount: string }): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values({
        userId: insertInvoice.userId,
        invoiceNumber: insertInvoice.invoiceNumber,
        clientName: insertInvoice.clientName,
        clientEmail: insertInvoice.clientEmail,
        clientCompany: insertInvoice.clientCompany || null,
        subtotal: insertInvoice.subtotal,
        totalGst: insertInvoice.totalGst,
        totalAmount: insertInvoice.totalAmount,
        status: insertInvoice.status || "draft",
        dueDate: insertInvoice.dueDate ? new Date(insertInvoice.dueDate) : null
      })
      .returning();
    return invoice;
  }

  async getUserInvoices(userId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.userId, userId));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoiceItem(item: { invoiceId: number; productName: string; quantity: number; rate: string; total: string }): Promise<InvoiceItem> {
    const [invoiceItem] = await db
      .insert(invoiceItems)
      .values(item)
      .returning();
    return invoiceItem;
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }
}

export const storage = new DatabaseStorage();