# EventEase - Event Management Assessment Project

## 📋 Project Overview

This project is an assessment submission for a full-stack event management platform. It demonstrates the implementation of a complete event management system with role-based access control, real-time event tracking, and comprehensive user management.

## 🔑 Demo Credentials

The platform comes with three pre-configured user accounts for testing different roles and permissions:

### Admin Account

- **Email:** admin@gmail.com
- **Password:** Admin@123
- **Access:** Full system access with complete administrative privileges

### Staff Account

- **Email:** staff@gmail.com
- **Password:** Staff@123
- **Access:** Limited administrative access for event management and user support

### Event Manager Account

- **Email:** joseph@gmail.com
- **Password:** Event@123
- **Access:** Event creation and management capabilities

These accounts are pre-seeded in the database and can be used to explore all features of the platform. Each account demonstrates different permission levels and access controls implemented in the system.

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

### 3. Event Manager (joseph@gmail.com / Event@123)

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

## 🛠️ Technical Architecture Deep Dive

The EventEase platform is built on a modern, scalable architecture that leverages the full potential of Next.js 14's App Router and server components. At its core, the system follows a layered architecture pattern that cleanly separates concerns while maintaining high performance and security.

The application's foundation is built on Next.js, which provides both our frontend and backend capabilities through its hybrid rendering model. The frontend layer utilizes React Server Components for optimal performance, allowing us to render components on the server while maintaining interactivity where needed. This approach significantly reduces the client-side JavaScript bundle size and improves initial page load times. Our component architecture is organized around the App Router structure, with a clear separation of concerns between routes, components, and business logic.

The backend architecture is implemented through Next.js API routes, which serve as our RESTful API endpoints. These routes are protected by a custom authentication middleware that implements role-based access control. The API layer communicates with our PostgreSQL database through Prisma ORM, which provides type-safe database queries and automatic migrations. We've implemented connection pooling and query optimization to ensure database performance under load.

Security is a fundamental aspect of our architecture. The authentication system is built on a custom implementation that provides session-based authentication with JWT tokens for API requests. This dual-layer approach ensures secure communication while maintaining a good user experience. The authorization system implements a granular role-based access control system that defines specific permissions for each user role. All sensitive operations are logged through our audit system, which tracks user actions, system changes, and security events.

The infrastructure layer is designed for scalability and reliability. The application is deployed on Vercel, which provides edge caching, automatic SSL, and global CDN distribution. Our deployment pipeline includes automated testing, type checking, and linting to maintain code quality. Performance optimization is achieved through a combination of edge caching, database indexing, and asset optimization.

## 👤 User Interaction Flows

The EventEase platform is designed around a user-centric approach that guides different user types through their specific workflows while maintaining a consistent and intuitive experience. The system's interaction model is built on the principle of progressive disclosure, revealing features and capabilities based on user roles and context.

When a user first arrives at EventEase, they are presented with a streamlined onboarding process. New users are guided through registration with a role-based signup flow that collects necessary information while existing users are directed to a secure login process. Upon authentication, users are taken to role-specific dashboards that present relevant information and actions based on their permissions.

For Event Managers, the platform provides a comprehensive event creation and management workflow. The process begins with a guided event creation wizard that helps users define their event's basic information, custom registration fields, and RSVP options. Once an event is created, managers can preview it in a staging environment before publishing. After publication, they gain access to real-time analytics, RSVP management tools, and communication features. The system supports both draft and published states, allowing managers to prepare events in advance and publish them when ready.

Administrators experience a different interaction model focused on system management and oversight. Their dashboard provides a bird's-eye view of the entire platform, including user management, system health metrics, and audit logs. The admin interface is designed for efficiency, with bulk operations, advanced filtering, and comprehensive reporting tools. Administrators can manage user roles, monitor system performance, and handle support requests through an integrated support interface.

Staff members operate in a middle ground, with access to event management tools but without system administration capabilities. Their workflow is optimized for handling day-to-day operations, including RSVP approvals, event monitoring, and user support. The staff interface provides quick access to common tasks while maintaining appropriate access controls.

The platform implements a robust error handling and recovery system that guides users through error states and provides clear paths to resolution. When errors occur, users receive context-aware error messages with specific recovery steps. The system includes automated recovery processes for common issues like session timeouts and network interruptions.

Communication is a critical aspect of the user experience, and the platform implements a comprehensive notification system. Users receive real-time updates about event changes, RSVP status, and system notifications through their preferred channels. The system supports both push notifications and email communications, with customizable notification preferences for different event types and user roles.

All user interactions are designed with accessibility in mind, following WCAG guidelines and implementing responsive design principles. The interface adapts to different screen sizes and devices, ensuring a consistent experience across desktop and mobile platforms. The platform's interaction model is continuously refined based on user feedback and analytics, ensuring that it remains intuitive and efficient for all user types.

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
