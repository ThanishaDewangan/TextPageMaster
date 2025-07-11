# VS Code Setup Guide for Invoice Generator

## 📥 Download & Setup

### Option 1: Download ZIP from Replit

1. **Download the ZIP file** from your Replit project
2. **Extract** the ZIP file to your desired location
3. **Open VS Code** and select "Open Folder"
4. **Navigate** to the extracted folder and open it

### Option 2: Clone from Git Repository

```bash
git clone <your-repository-url>
cd invoice-generator
```

## 🛠️ Quick Setup

### 1. Open Terminal in VS Code
Press `Ctrl+`` (backtick) or go to Terminal → New Terminal

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/invoice_db
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=invoice_db
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
NODE_ENV=development
```

### 4. Database Setup

Make sure PostgreSQL is running, then:
```bash
npm run db:push
```

### 5. Start the Application
```bash
npm run dev
```

Open `http://localhost:5000` in your browser.

## 🔧 VS Code Configuration

### Recommended Extensions

VS Code will automatically suggest these extensions (or install them manually):

- **Tailwind CSS IntelliSense** - For Tailwind CSS autocomplete
- **TypeScript Importer** - Auto import TypeScript modules
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
- **Path Intellisense** - File path autocomplete

### Keyboard Shortcuts

- `Ctrl+Shift+P` - Command palette
- `Ctrl+`` - Toggle terminal
- `F5` - Start debugging
- `Ctrl+Shift+F` - Search across all files
- `Ctrl+D` - Select next occurrence of current word

## 📁 Project Structure Overview

```
invoice-generator/
├── 📁 client/                  # Frontend React app
│   ├── 📁 src/
│   │   ├── 📁 components/      # UI components
│   │   ├── 📁 pages/          # Application pages
│   │   ├── 📁 lib/            # Utilities & config
│   │   └── 📁 hooks/          # Custom React hooks
├── 📁 server/                 # Backend Express app
│   ├── 📄 index.ts           # Server entry point
│   ├── 📄 routes.ts          # API routes
│   ├── 📄 storage.ts         # Database operations
│   └── 📄 db.ts             # Database config
├── 📁 shared/                # Shared types & schemas
├── 📄 package.json           # Dependencies
├── 📄 tsconfig.json          # TypeScript config
├── 📄 tailwind.config.ts     # Tailwind CSS config
└── 📄 vite.config.ts         # Vite config
```

## 🐛 Debugging

### Debug the Server
1. Press `F5` or go to Run → Start Debugging
2. Select "Debug Server" configuration
3. Set breakpoints in your server code
4. The debugger will attach to the running server

### Debug the Client
1. Start the application with `npm run dev`
2. Open browser developer tools (F12)
3. Use React Developer Tools extension for component debugging

## 📝 Development Workflow

### 1. Making Changes
- **Frontend**: Edit files in `client/src/` - changes auto-reload
- **Backend**: Edit files in `server/` - server auto-restarts
- **Database**: Modify `shared/schema.ts` then run `npm run db:push`

### 2. Adding New Features
1. **Database Schema**: Update `shared/schema.ts`
2. **API Routes**: Add endpoints in `server/routes.ts`
3. **Frontend Pages**: Create components in `client/src/pages/`
4. **UI Components**: Add reusable components in `client/src/components/`

### 3. Common Commands
```bash
# Development
npm run dev              # Start development server
npm run check           # Type checking
npm run db:push         # Update database schema

# Production
npm run build           # Build for production
npm start              # Start production server
```

## 🌐 Accessing the Application

- **Frontend & API**: `http://localhost:5000`
- **Database**: Connect using your PostgreSQL client with the credentials in `.env`

## 📊 Features to Test

1. **User Registration**: Create a new account
2. **User Login**: Sign in with credentials
3. **Add Products**: Create products with quantity and pricing
4. **Generate Invoice**: Select products and create an invoice
5. **PDF Export**: Download professional PDF invoices
6. **Dashboard**: View all invoices and products

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000
```

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `.env` file credentials
- Verify database exists

### TypeScript Errors
```bash
# Check for type errors
npm run check
```

### Clear Cache Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=your_strong_production_secret
```

### Build and Deploy
```bash
npm run build
npm start
```

## 💡 Tips for Development

1. **Auto-save**: Enable auto-save in VS Code (File → Auto Save)
2. **Terminal Split**: Use split terminals for running multiple commands
3. **Extensions**: Install recommended extensions for better development experience
4. **Debugging**: Use browser dev tools and VS Code debugger together
5. **Database GUI**: Use pgAdmin or similar tools to view database contents

## 📚 Learning Resources

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Express.js**: https://expressjs.com/
- **PostgreSQL**: https://www.postgresql.org/docs/

Happy coding! 🎉