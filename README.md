# Garage Vision - Professional Management System

A comprehensive garage management system built with Next.js, React, and MySQL, designed to handle all aspects of automotive business operations.

## 🚗 Features

### Core Management
- **Client Management** - Fleet and individual client handling with vehicle associations
- **Vehicle Management** - Complete vehicle tracking and history
- **Job Management** - Work order creation, assignment, and tracking
- **Parts Management** - Inventory control with pricing and markup calculations
- **Supplier Management** - Vendor relationships and credit tracking

### Business Operations
- **Quotations** - Professional quote generation with PDF export
- **Invoicing** - Complete billing system with status tracking
- **EPOS** - Point of sale system for quick transactions
- **Reporting** - Business performance and financial analytics

### Staff Management
- **Engineer Dashboard** - Work assignment and time tracking
- **HR System** - Attendance, holiday requests, and shift scheduling
- **Role-based Access** - Secure user permissions and authentication

## 🏗️ Architecture

- **Frontend**: Next.js 15 with React and Tailwind CSS
- **Backend**: Node.js with MySQL database
- **Authentication**: JWT-based secure login system
- **Deployment**: Heroku with MySQL add-on
- **Database**: Clean, normalized schema with proper relationships

## 🗄️ Database Structure

The system uses a clean, normalized database design with:
- **Users**: Staff accounts with role-based permissions
- **Clients**: Fleet and individual customers
- **Vehicles**: Client vehicle registrations
- **Jobs**: Work orders and assignments
- **Parts**: Inventory management
- **Suppliers**: Vendor relationships
- **Quotes & Invoices**: Business transaction tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 22.x
- MySQL 8.0+
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

### Environment Variables
```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 📊 Current Status

- ✅ **Database**: Clean, working schema with 719 clients and proper relationships
- ✅ **Authentication**: User login system with devkieran and pauldev accounts
- ✅ **Client Management**: Fleet vs Local client categorization working
- ✅ **API Endpoints**: All core endpoints functional
- ✅ **UI Components**: Modern, responsive interface

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run test suite

### Code Structure
```
├── components/     # React components
├── pages/         # Next.js pages and API routes
├── services/      # Business logic and database operations
├── lib/          # Utility functions and configurations
├── styles/       # CSS and design system
├── database/     # Database schema and migrations
└── migrations/   # Database change scripts
```

## 🌐 Deployment

The application is deployed on Heroku at:
**https://garagevision-899c3f626875.herokuapp.com**

### Deployment Process
1. Push changes to main branch
2. Heroku automatically builds and deploys
3. Database migrations run automatically
4. Application restarts with new code

## 📝 Recent Updates

- **January 2025**: Complete database cleanup and restructuring
- **Database Migration**: Successfully migrated from old schema to clean structure
- **Client Categorization**: Implemented Fleet vs Local client distinction
- **User Management**: Restored essential user accounts
- **API Optimization**: Fixed all service layer queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Check the documentation in the `/docs` folder
- Review recent database migrations
- Contact the development team

---

**Garage Vision** - Professional Automotive Business Management
