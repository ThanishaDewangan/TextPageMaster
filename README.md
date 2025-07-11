# Invoice Generator - MERN Stack Application

A professional invoice generator built with React, Express.js, PostgreSQL, and TypeScript. Features user authentication, product management, and PDF invoice generation.

## 🚀 Features

- **User Authentication**: JWT-based authentication system
- **Product Management**: Add, edit, and delete products with automatic calculations
- **Invoice Generation**: Create professional invoices with PDF export
- **Dark Theme**: Modern dark UI following Figma design specifications
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Calculations**: Automatic GST (18%) and total calculations

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Zustand for state management
- shadcn/ui components
- Tailwind CSS for styling
- React Hook Form with Zod validation

### Backend
- Node.js with Express.js
- TypeScript with ESM modules
- PostgreSQL database
- Drizzle ORM for database operations
- JWT for authentication
- bcrypt for password hashing
- Puppeteer for PDF generation

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- PostgreSQL database (local or remote)
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd invoice-generator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/invoice_db
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=invoice_db

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Node Environment
NODE_ENV=development
```

### 4. Database Setup
```bash
# Create database tables
npm run db:push
```

### 5. Start the Application
```bash
# Start both frontend and backend
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── db.ts            # Database configuration
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema and validation
└── package.json         # Dependencies and scripts
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get user products
- `POST /api/products` - Create new product
- `DELETE /api/products/:id` - Delete product

### Invoices
- `GET /api/invoices` - Get user invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices/:id/pdf` - Generate PDF

## 💾 Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `createdAt` - Registration timestamp

### Products Table
- `id` - Primary key
- `userId` - Foreign key to users
- `name` - Product name
- `quantity` - Product quantity
- `rate` - Product rate/price
- `total` - Calculated total (quantity × rate)
- `gst` - Calculated GST (18% of total)
- `createdAt` - Creation timestamp

### Invoices Table
- `id` - Primary key
- `userId` - Foreign key to users
- `invoiceNumber` - Unique invoice number
- `clientName` - Client's name
- `clientEmail` - Client's email
- `clientCompany` - Client's company (optional)
- `subtotal` - Invoice subtotal
- `totalGst` - Total GST amount
- `totalAmount` - Final total amount
- `status` - Invoice status (draft, sent, paid)
- `createdAt` - Creation timestamp
- `dueDate` - Payment due date (optional)

### Invoice Items Table
- `id` - Primary key
- `invoiceId` - Foreign key to invoices
- `productName` - Product name
- `quantity` - Product quantity
- `rate` - Product rate
- `total` - Line item total

## 🎨 Design Features

- **Dark Theme**: Professional dark color scheme
- **Responsive Layout**: Mobile-first design approach
- **Loading States**: Smooth loading indicators
- **Form Validation**: Real-time form validation with error messages
- **Toast Notifications**: User feedback for actions
- **Professional Invoice Layout**: Clean, business-ready invoice templates

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Zod schemas for data validation
- **Protected Routes**: Authentication required for sensitive operations
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production
Make sure to set these environment variables in your production environment:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong JWT secret key
- `NODE_ENV=production`

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

### Database Operations
```bash
# Push schema changes to database
npm run db:push

# Generate database migrations (if needed)
npm run db:generate
```

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Modular component architecture

## 📱 Usage

1. **Registration/Login**: Create an account or login
2. **Add Products**: Navigate to "Add Product" and create your product catalog
3. **Generate Invoice**: Select products and create invoices with client details
4. **Download PDF**: Export professional PDF invoices
5. **Dashboard**: View all invoices and track revenue

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check DATABASE_URL environment variable
- Verify database credentials

**Authentication Issues**
- Clear browser localStorage
- Check JWT_SECRET environment variable
- Ensure token is being sent with requests

**PDF Generation Issues**
- Puppeteer dependencies may need to be installed
- Check server logs for detailed error messages

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please create an issue in the repository.