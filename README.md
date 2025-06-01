# EventEase - Event Management Assessment Project

## 📋 Project Overview

This project is an assessment submission for a full-stack event management platform. It demonstrates the implementation of a complete event management system with role-based access control, real-time event tracking, and comprehensive user management.

## 🎯 Assessment Requirements & Implementation

### Core Features Implemented

1. **Authentication & Authorization**

   - Custom authentication system using Better-Auth
   - Role-based access control (Admin, Staff, Event Manager)
   - Secure session management
   - Protected API routes
   - Audit logging for all sensitive actions

2. **Event Management**

   - CRUD operations for events
   - Custom field support for event registration
   - Event publishing workflow
   - RSVP management system
   - Event analytics and tracking

3. **User Management**

   - Role-based user system
   - User profile management
   - Admin dashboard for user control
   - Staff management interface

4. **Database Design**
   - PostgreSQL with Prisma ORM
   - Optimized schema design
   - Proper indexing for performance
   - Audit logging system
   - Relationship management

## 🔄 Application Flow

### 1. Authentication Flow

```mermaid
graph TD
    A[User Visit] --> B{Has Session?}
    B -->|No| C[Login/Signup]
    B -->|Yes| D[Role Check]
    C --> E[Authentication]
    E --> F{Valid Credentials?}
    F -->|Yes| D
    F -->|No| C
    D --> G[Admin Dashboard]
    D --> H[Staff Dashboard]
    D --> I[Event Manager Dashboard]
```

### 2. Event Management Flow

```mermaid
graph TD
    A[Create Event] --> B[Set Basic Info]
    B --> C[Add Custom Fields]
    C --> D[Set RSVP Options]
    D --> E[Preview Event]
    E --> F{Publish?}
    F -->|Yes| G[Live Event]
    F -->|No| H[Draft]
    G --> I[Track RSVPs]
    I --> J[Analytics]
```

## 👥 User Roles & Permissions

### 1. Admin (admin@gmail.com / Admin@123)

- **Full System Access**
  - User management (create, update, delete users)
  - Role management
  - System-wide analytics
  - Complete audit log access
  - Event management across all users
  - Staff management

### 2. Staff (staff@gmail.com / Staff@123)

- **Limited Administrative Access**
  - View and manage all events
  - Handle RSVP approvals
  - Access event analytics
  - View audit logs
  - Cannot modify user roles
  - Cannot access admin settings

### 3. Event Manager (subhash@gmail.com / Event@123)

- **Event-Specific Access**
  - Create and manage own events
  - Customize event details
  - Manage RSVPs for own events
  - View analytics for own events
  - Cannot access other users' events
  - Cannot modify system settings

## 📊 Database Schema

### Key Models

1. **User**

   - Authentication details
   - Role management
   - Profile information
   - Audit logging

2. **Event**

   - Basic event information
   - Custom fields
   - RSVP management
   - Analytics tracking

3. **RSVP**

   - Attendee information
   - Status tracking
   - Custom field responses
   - Event relationship

4. **AuditLog**
   - Action tracking
   - User accountability
   - System changes
   - Security monitoring

## 🔐 Security Implementation

1. **Authentication Security**

   - Secure password hashing
   - Session management
   - CSRF protection
   - Rate limiting

2. **Data Security**

   - Environment variables
   - Database encryption
   - Input validation
   - XSS prevention

3. **Access Control**
   - Role-based permissions
   - Route protection
   - API security
   - Audit logging

## 🛠️ Technical Implementation

### Frontend

- Next.js 14 with App Router
- React Server Components
- Client-side state management
- Responsive design with TailwindCSS
- Component library (shadcn/ui)
- Form handling with react-hook-form
- Validation with Zod

### Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL database
- Custom authentication
- API rate limiting
- Error handling

### Development Tools

- TypeScript for type safety
- ESLint for code quality
- Git for version control
- Vercel for deployment

## 🚀 Getting Started

1. **Environment Setup**

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/eventease"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   AUTH_SECRET="your-auth-secret"
   ```

2. **Database Setup**

   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

3. **Development**
   ```bash
   pnpm install
   pnpm dev
   ```

## 📝 Assessment Notes

### Technical Decisions

1. **Why Next.js?**

   - Server-side rendering for better SEO
   - API routes for backend functionality
   - Built-in TypeScript support
   - Excellent developer experience

2. **Why Prisma?**

   - Type-safe database queries
   - Automatic migrations
   - Excellent developer experience
   - Built-in connection pooling

3. **Why Custom Auth?**
   - Full control over authentication flow
   - Custom role management
   - Audit logging integration
   - Better security control

### Future Improvements

1. **Technical**

   - Add unit and integration tests
   - Implement real-time features
   - Add email notifications
   - Enhance analytics

2. **Features**
   - Event templates
   - Bulk operations
   - Advanced reporting
   - Mobile app

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

### Event Endpoints

- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### RSVP Endpoints

- `POST /api/rsvps` - Create RSVP
- `GET /api/rsvps/:eventId` - Get event RSVPs
- `PUT /api/rsvps/:id` - Update RSVP status

### User Management

- `GET /api/users` - List users (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## 🔍 Testing the Application

1. **Admin Testing**

   - Login as admin
   - Create new users
   - Assign roles
   - View system analytics
   - Check audit logs

2. **Staff Testing**

   - Login as staff
   - Manage events
   - Handle RSVPs
   - View analytics
   - Test permissions

3. **Event Manager Testing**
   - Login as event manager
   - Create events
   - Manage RSVPs
   - View analytics
   - Test restrictions

## 📄 License

This project is created as an assessment submission. All rights reserved.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Prisma team for the amazing ORM
- Vercel for the deployment platform
- shadcn/ui for the component library
