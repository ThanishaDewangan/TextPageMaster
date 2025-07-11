import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, insertProductSchema, insertInvoiceSchema } from "@shared/schema";
import { ZodError } from "zod";
import puppeteer from "puppeteer";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

// JWT middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(credentials.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected routes
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Product routes
  app.post("/api/products", authenticateToken, async (req: any, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Calculate totals
      const rate = parseFloat(productData.rate);
      const total = rate * productData.quantity;
      const gst = total * 0.18; // 18% GST
      
      const product = await storage.createProduct({
        ...productData,
        userId: req.user.id,
        rate: rate.toString(),
        total: total.toString(),
        gst: gst.toString()
      });

      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products", authenticateToken, async (req: any, res) => {
    try {
      const products = await storage.getUserProducts(req.user.id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product || product.userId !== req.user.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Invoice routes
  app.post("/api/invoices", authenticateToken, async (req: any, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const { productIds } = req.body;

      if (!productIds || productIds.length === 0) {
        return res.status(400).json({ message: "No products selected" });
      }

      // Get products
      const products = await Promise.all(
        productIds.map((id: number) => storage.getProduct(id))
      );

      // Verify all products belong to user
      const invalidProducts = products.filter(
        (product) => !product || product.userId !== req.user.id
      );

      if (invalidProducts.length > 0) {
        return res.status(400).json({ message: "Invalid product selection" });
      }

      // Calculate totals
      const subtotal = products.reduce((sum, product) => sum + parseFloat(product!.total), 0);
      const totalGst = products.reduce((sum, product) => sum + parseFloat(product!.gst), 0);
      const totalAmount = subtotal + totalGst;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice
      const invoice = await storage.createInvoice({
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        clientCompany: invoiceData.clientCompany,
        status: invoiceData.status || "draft",
        dueDate: invoiceData.dueDate,
        userId: req.user.id,
        invoiceNumber,
        subtotal: subtotal.toString(),
        totalGst: totalGst.toString(),
        totalAmount: totalAmount.toString()
      });

      // Create invoice items
      await Promise.all(
        products.map((product) =>
          storage.createInvoiceItem({
            invoiceId: invoice.id,
            productName: product!.name,
            quantity: product!.quantity,
            rate: product!.rate,
            total: product!.total
          })
        )
      );

      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/invoices", authenticateToken, async (req: any, res) => {
    try {
      const invoices = await storage.getUserInvoices(req.user.id);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/invoices/:id", authenticateToken, async (req: any, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice || invoice.userId !== req.user.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const items = await storage.getInvoiceItems(invoiceId);
      res.json({ ...invoice, items });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PDF Generation
  app.post("/api/invoices/:id/pdf", authenticateToken, async (req: any, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice || invoice.userId !== req.user.id) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const items = await storage.getInvoiceItems(invoiceId);
      const user = await storage.getUser(req.user.id);

      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 20px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .table th { background: #1f2937; color: white; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">INVOICE GENERATOR</div>
            <div>Professional Invoice Services</div>
          </div>
          
          <div class="invoice-details">
            <div>
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoice.createdAt!).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <h3>Client Information</h3>
              <p><strong>Company:</strong> ${invoice.clientCompany || 'N/A'}</p>
              <p><strong>Contact:</strong> ${invoice.clientName}</p>
              <p><strong>Email:</strong> ${invoice.clientEmail}</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>$${parseFloat(item.rate).toFixed(2)}</td>
                  <td>$${parseFloat(item.total).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Subtotal:</strong> $${parseFloat(invoice.subtotal).toFixed(2)}</p>
            <p><strong>GST (18%):</strong> $${parseFloat(invoice.totalGst).toFixed(2)}</p>
            <p class="total-row"><strong>Total Amount:</strong> $${parseFloat(invoice.totalAmount).toFixed(2)}</p>
          </div>
        </body>
        </html>
      `;

      await page.setContent(htmlContent);
      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdf);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
