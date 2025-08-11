# Water Plant Management System

A comprehensive water plant management system built with **Payload CMS 3.0** and **Next.js 15**, designed to manage water delivery operations, customer relationships, and business operations.

## 🚰 Features

- **Customer Management**: Track customer information, delivery schedules, and preferences
- **Trip Management**: Organize and track water delivery trips
- **Invoice Generation**: Automated PDF invoice creation and management
- **Transaction Tracking**: Monitor water bottle transactions and payments
- **Employee Management**: Manage delivery personnel and staff
- **Area & Block Management**: Organize delivery zones and territories
- **Reporting System**: Generate business insights and reports
- **WhatsApp Integration**: Customer communication via WhatsApp
- **Email Automation**: Automated email notifications and reports
- **PDF Generation**: Create professional PDF documents for invoices and trip reports

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with React 19
- **CMS**: Payload CMS 3.0 (built on top of Next.js)
- **Database**: MongoDB with Mongoose
- **File Storage**: UploadThing for media management
- **PDF Generation**: React PDF Renderer
- **Email**: Nodemailer with cron jobs
- **Testing**: Playwright (E2E) + Vitest (Unit/Integration)
- **Package Manager**: pnpm
- **TypeScript**: Full type safety

## 📋 Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9+ or 10+
- MongoDB instance
- UploadThing account (for file storage)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone git@github.com:Furqankhanzada/water-plant.git
cd water-plant
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URI=mongodb://localhost:27017/water-plant

# Payload
PAYLOAD_SECRET=your-secret-key-here

# UploadThing (for file storage)
UPLOADTHING_TOKEN=your-uploadthing-token

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WhatsApp (optional)
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_PHONE_NUMBER=your-whatsapp-number
```

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 🐳 Docker Development

For a consistent development environment using Docker:

```bash
# Start MongoDB and the application
docker-compose up

# Or run in background
docker-compose up -d
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📚 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (frontend)/        # Public frontend routes
│   ├── (payload)/         # Payload CMS admin routes
│   ├── invoices/          # Invoice PDF generation
│   ├── trips/             # Trip PDF generation
│   └── whatsapp/          # WhatsApp integration
├── collections/            # Payload CMS collections
│   ├── Customers.ts       # Customer management
│   ├── Trips.ts          # Delivery trip management
│   ├── Invoices.ts       # Invoice management
│   ├── Transactions.ts   # Transaction tracking
│   └── Users.ts          # User authentication
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── services/               # Business logic services
└── templates/              # Email and PDF templates
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run all tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:int` - Run integration tests
- `pnpm lint` - Run ESLint
- `pnpm generate:types` - Generate Payload types
- `pnpm payload` - Run Payload CLI commands

## 🧪 Testing

The project includes comprehensive testing:

- **Unit/Integration Tests**: Vitest with React Testing Library
- **E2E Tests**: Playwright for browser automation
- **API Tests**: Integration tests for backend endpoints

Run tests with:
```bash
pnpm test          # All tests
pnpm test:int      # Unit/Integration only
pnpm test:e2e      # E2E only
```

## 📦 Collections Overview

### Core Business Collections
- **Customers**: Customer profiles, delivery preferences, contact info
- **Trips**: Delivery route planning and execution
- **Invoices**: Billing and payment tracking
- **Transactions**: Water bottle delivery/pickup records
- **Employees**: Staff management and roles
- **Areas/Blocks**: Geographic organization for deliveries

### System Collections
- **Users**: Authentication and admin access
- **Media**: File uploads and management
- **Reports**: Business analytics and insights
- **Messages**: Communication history
- **Requests**: Customer service requests

## 🔐 Authentication

The system uses Payload's built-in authentication with:
- Admin panel access control
- Role-based permissions
- Secure user management

## 📄 PDF Generation

Built-in PDF generation for:
- **Invoices**: Professional billing documents
- **Trip Reports**: Delivery completion summaries
- **Custom Reports**: Business analytics

## 📧 Email Automation

Automated email system with:
- Cron job scheduling
- Template-based emails
- Transactional notifications
- Report delivery

## 🌐 API Endpoints

- **GraphQL**: `/api/graphql` - Full GraphQL API
- **REST**: `/api/[collection]` - RESTful endpoints
- **Admin**: `/admin` - Payload CMS admin panel

## 🚀 Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Environment Variables

Ensure all required environment variables are set in production:
- `DATABASE_URI` - Production MongoDB connection
- `PAYLOAD_SECRET` - Secure secret key
- `UPLOADTHING_TOKEN` - File storage credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [Payload CMS documentation](https://payloadcms.com/docs)
- Review existing issues in the repository
- Create a new issue with detailed information

## 🔄 Version History

- **v1.1.0** - Current version with full water plant management features
- **v1.0.0** - Initial release with core functionality
