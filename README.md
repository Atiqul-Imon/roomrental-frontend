# RoomRentalUSA Frontend

A modern, enterprise-grade Next.js application for room rental management. Built with TypeScript, React 19, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15, React 19, TypeScript
- **Beautiful UI**: Tailwind CSS with custom design system
- **Admin Panel**: Comprehensive admin dashboard with dark mode
- **User Management**: Student and landlord portals
- **Real-time Features**: Socket.io integration
- **Advanced Search**: Location-based search with filters
- **Responsive Design**: Mobile-first, fully responsive
- **Performance Optimized**: Code splitting, lazy loading, memoization

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── auth/              # Authentication pages
│   ├── listings/         # Listing pages
│   ├── profile/          # User profile pages
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── charts/           # Chart components
│   ├── layout/           # Layout components
│   ├── listings/         # Listing components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API client
│   ├── auth-context.tsx  # Authentication context
│   └── navigation.ts      # Navigation utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🎨 Design System

- **Primary Color**: Blue (#3B82F6)
- **Secondary Color**: Pink (#EC4899)
- **Typography**: Inter font family
- **Theme**: Light mode (admin panel has dark mode)

## 🔐 Authentication

The app uses JWT-based authentication with:
- Access tokens (15min expiry)
- Refresh tokens (7 days expiry)
- Role-based access control (student, landlord, admin, staff, super_admin)

## 📱 Key Pages

- `/` - Homepage
- `/listings` - Browse all listings
- `/listings/[id]` - Listing details
- `/auth/login` - User login
- `/auth/register` - User registration
- `/dashboard` - User dashboard
- `/admin/dashboard` - Admin dashboard
- `/admin/landlords` - Landlord management
- `/admin/users` - User management
- `/admin/listings` - Listing management

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console | - |

## 📦 Dependencies

### Core
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### State Management
- **TanStack Query** - Data fetching
- **Zustand** - Client state

### UI Components
- **Lucide React** - Icons
- **Recharts** - Charts
- **React Hook Form** - Form handling
- **Zod** - Validation

## 🛡️ Security Features

- Password hashing with Argon2id (2025 industry standard)
- JWT token authentication
- Rate limiting on API calls
- XSS protection
- CSRF protection
- Secure cookie handling

## 📄 License

Private - All rights reserved

## 👥 Contributing

This is a private project. For contributions, please contact the project maintainer.

## 📞 Support

For support, email support@roomrentalusa.com
