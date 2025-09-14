# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

SkillTag is a Next.js 15+ React application that connects talent with micro-gigs and companies. It's a dual-sided platform with separate flows for talent acquisition and company partnerships. The application uses MongoDB for data persistence, NextAuth for authentication, and ShadCN UI components with Tailwind CSS for styling.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Operations
The app uses both MongoDB native client and Mongoose for different operations. Database connections are handled through:
- `lib/mongodb.ts` - Native MongoDB client with connection pooling
- `lib/mongoose.ts` - Mongoose ORM connection with caching

## Architecture Overview

### Application Structure
- **App Router**: Uses Next.js 13+ app directory structure
- **Dual Platform**: Separate user flows for talent and companies
- **Authentication**: NextAuth with Google OAuth integration
- **Database**: MongoDB with dual connection approach (native + Mongoose)
- **UI**: ShadCN components with Radix UI primitives and Tailwind CSS

### Key Directories
- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions, database connections, auth config
- `/models` - Mongoose schema definitions
- `/hooks` - Custom React hooks

### Database Models
- **User Schema** (via authOptions.ts): Talent profiles with referral system
- **Company Schema** (models/Company.ts): Business entity information
- **Notification Schema** (models/Notification.ts): In-app notification system

### Authentication Flow
- Google OAuth through NextAuth
- Automatic user creation with referral code generation
- Session management with JWT strategy
- Separate company authentication flow at `/companies/login`

### Component Architecture
- **Landing Page**: Dual-tab interface (talent/companies)
- **3D Components**: Three.js integration with React Three Fiber
- **Animation**: Framer Motion and GSAP animations
- **UI Library**: ShadCN components with custom styling

### API Structure
Key API endpoints in `/app/api`:
- `/applications` - Gig application management
- `/gigs` - Job posting operations
- `/notifications` - User notification system
- `/waitlist` - Waitlist management
- `/upload-*` - File upload handlers

### Configuration Notes
- **TypeScript**: Configured with build error ignoring (development phase)
- **ESLint**: Build errors ignored for faster iteration
- **Images**: Configured for ImageKit CDN and Google profile images
- **Build**: Standalone output configured for deployment

### Styling Architecture
- **Tailwind CSS**: Custom configuration with brand colors
- **Color Scheme**: Primary green (#ADFF00), black backgrounds, custom skill tags
- **Components**: ShadCN "New York" style with CSS variables
- **Responsive**: Mobile-first design approach

### Key Features
- **Referral System**: Automatic referral code generation for users
- **File Uploads**: ImageKit integration for profile and task files
- **Skill Tagging**: Custom skill tag system for talent categorization
- **Notification System**: Real-time notifications with read/unread states
- **Admin Dashboard**: Admin page for user management and approval

### Development Environment
- **Node.js**: Uses Next.js 15+ with React 19+
- **Database**: MongoDB with both native and Mongoose connections
- **Authentication**: Google OAuth with NextAuth
- **Styling**: Tailwind CSS with ShadCN components
- **Animations**: Framer Motion for UI animations, GSAP for complex animations