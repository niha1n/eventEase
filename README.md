# EventEase - Event Management Platform

EventEase is a modern, full-stack event management platform built with Next.js, Prisma, and PostgreSQL. It provides a comprehensive solution for creating, managing, and tracking events with features for event owners, staff, and administrators.

## 🌟 Features

### For Event Owners

- Create and manage multiple events
- Customize event details (title, description, location, dates)
- Set custom fields (max attendees, approval requirements, waitlist)
- Track RSVPs and event views
- Publish/unpublish events
- View event analytics

### For Staff

- View and manage all events
- Handle RSVP approvals
- Access event analytics
- Manage user roles
- View audit logs

### For Administrators

- Full system access
- User management
- Role management
- System-wide analytics
- Complete audit log access

## 🚀 Live Demo

Visit our live demo at: [https://eventease.vercel.app](https://eventease.vercel.app)

Demo Credentials:

- Admin: admin@eventease.com / aAdmin@123
- Staff: staff@eventease.com / sAdmin@123
- Event Owner: eventowner1@eventease.com / oAdmin@123

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Better-Auth
- **Deployment**: Vercel
- **Styling**: TailwindCSS
- **Testing**: Jest, React Testing Library

## 📋 Prerequisites

- Node.js 18.x or later
- PostgreSQL 14.x or later
- pnpm (recommended) or npm
- Git

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/eventease.git
   cd eventease
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/eventease"

   # Next.js
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Authentication
   AUTH_SECRET="your-auth-secret"
   ```

4. **Set up the database**

   ```bash
   # Create and apply migrations
   pnpm prisma migrate dev
   # or
   npx prisma migrate dev
   ```

5. **Seed the database (optional)**

   ```bash
   pnpm prisma db seed
   # or
   npx prisma db seed
   ```

   This will create demo data with the following users:

   - Admin: admin@eventease.com / aAdmin@123
   - Staff: staff@eventease.com / sAdmin@123
   - Event Owners: eventowner1@eventease.com, eventowner2@eventease.com / oAdmin@123

   After seeding, run:

   ```bash
   # Generate Prisma Client to ensure it's up to date
   pnpm prisma generate
   # or
   npx prisma generate
   ```

6. **Start the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

7. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

### Database Management

- `prisma migrate dev`: Create and apply database migrations
- `prisma db seed`: Seed the database with demo data
- `prisma studio`: Open Prisma Studio to view/edit database data
- `prisma generate`: Generate Prisma Client

### Development

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm format`: Format code with Prettier

### Testing

- `pnpm test`: Run tests
- `pnpm test:watch`: Run tests in watch mode
- `pnpm test:coverage`: Run tests with coverage report

### Utility Scripts

- `scripts/make-admin.ts`: Make a user an admin
  ```bash
  npx tsx scripts/make-admin.ts user@example.com
  ```

## �� Database Seeding

To seed the database with demo data:

```bash
# Seed the database
pnpm prisma db seed
# or
npx prisma db seed

# After seeding, regenerate Prisma Client
pnpm prisma generate
# or
npx prisma generate
```

To reseed the database (this will reset the database and apply all migrations):

```bash
# Reset the database and apply migrations
pnpm prisma migrate reset
# or
npx prisma migrate reset

# After reseeding, regenerate Prisma Client
pnpm prisma generate
# or
npx prisma generate
```

> 💡 **Note**: Always run `prisma generate` after seeding or making schema changes to ensure your Prisma Client is in sync with your database schema.

## 🔐 Security

- All passwords meet security requirements
- Authentication handled by Better-Auth
- Role-based access control
- Audit logging for sensitive actions
- Environment variables for sensitive data
- CSRF protection
- Rate limiting on API routes

## 📚 API Documentation

API routes are available at `/api/*`:

- `/api/auth/*`: Authentication endpoints
- `/api/events/*`: Event management
- `/api/rsvps/*`: RSVP handling
- `/api/users/*`: User management
- `/api/analytics/*`: Analytics data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Better-Auth](https://github.com/better-auth/better-auth)
