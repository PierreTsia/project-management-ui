# Frontend PWA Epic

## Overview

Build a modern, responsive Progressive Web App (PWA) frontend for the project management API. This will be a separate repository deployed on Vercel, providing a complete user interface for all the backend functionality we've built.

## Tech Stack

### **Core Framework**

- **React 18** + **TypeScript** - Modern React with full type safety
- **Vite** - Fast development and build tooling
- **React Router** - Client-side routing and navigation

### **State Management & Data Fetching**

- **TanStack Query** - Server state management and caching
- **React Hook Form** - Form state management and validation
- **Zod** - Runtime validation and type inference

### **UI & Styling**

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality, accessible component library
- **Lucide React** - Beautiful, customizable icons
- **Class Variance Authority** - Component variant management
- **next-themes** - Dark/light mode management
- **Custom Shadcn Theme** - Branded design system

### **Internationalization**

- **react-i18next** - Internationalization framework
- **i18next-browser-languagedetector** - Automatic language detection
- **i18next-http-backend** - Dynamic translation loading

### **PWA & Real-time Features**

- **Workbox** - Service worker and offline functionality
- **Socket.io-client** - Real-time WebSocket connections
- **React Query DevTools** - Development debugging tools

### **Development Tools**

- **ESLint** + **Prettier** - Code quality and formatting
- **Husky** - Git hooks for pre-commit checks
- **Vitest** - Unit testing framework
- **@testing-library/react** - Component testing utilities
- **TypeScript** - Static type checking
- **Codecov** - Code coverage reporting and analysis

### **CI/CD Pipeline**

- **GitHub Actions** - Automated CI/CD workflows
- **Vercel** - Automated deployment
- **Codecov GitHub App** - Coverage reporting integration
- **Dependabot** - Automated dependency updates

### **Deployment**

- **Vercel** - Hosting and deployment platform
- **Environment Variables** - Configuration management

## Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn/ui components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   └── features/        # Feature-specific components
│       ├── auth/        # Authentication components
│       ├── projects/    # Project management components
│       ├── tasks/       # Task management components
│       ├── comments/    # Comment system components
│       ├── attachments/ # File attachment components
│       └── reporting/   # Analytics and reporting components
├── hooks/               # Custom React hooks
├── services/            # API client, auth service, etc.
├── stores/              # Client state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── pages/               # Page components
├── styles/              # Global styles and Tailwind config
├── i18n/                # Internationalization
│   ├── locales/         # Translation files
│   ├── config.ts        # i18n configuration
│   └── hooks.ts         # i18n hooks
├── themes/              # Theme configuration
│   ├── index.ts         # Theme provider
│   ├── dark.ts          # Dark theme colors
│   ├── light.ts         # Light theme colors
│   └── components.ts    # Component theme overrides
└── assets/              # Static assets (images, icons)
```

## Core Features Implementation

### **Phase 1: Foundation & Authentication**

#### **1.1 Project Setup & Configuration**

**Estimated Time:** 3-4 hours  
**Value:** Solid foundation for the entire frontend

**Definition of Done:**

- [x] Initialize React + TypeScript project with Vite
- [x] Configure Tailwind CSS and Shadcn/ui
- [x] Set up custom Shadcn theme with brand colors
- [x] Configure dark/light mode
- [ ] Set up i18n with react-i18next
- [ ] Set up ESLint, Prettier, and Husky
- [ ] Configure React Router for navigation
- [ ] Set up TanStack Query for API state management
- [ ] Create basic project structure
- [ ] Configure environment variables for API endpoints
- [ ] Set up basic error boundaries and loading states
- [ ] Configure Vitest for unit testing
- [ ] Set up TypeScript strict mode configuration

**Acceptance Criteria:**

- Project builds and runs without errors
- Tailwind CSS is properly configured
- Shadcn/ui components use custom theme colors
- Dark/light mode toggle works and persists
- i18n is configured with at least English and French
- Basic routing works (Home, Login, Dashboard)
- API client is configured with proper error handling
- Development tools are working (ESLint, Prettier, etc.)
- Unit tests can be run with Vitest
- TypeScript compilation passes with strict mode

---

#### **1.2 CI/CD Pipeline Setup**

**Estimated Time:** 2-3 hours  
**Value:** Automated quality assurance and deployment

**Definition of Done:**

- [ ] Set up GitHub Actions workflow for CI/CD
- [ ] Configure ESLint and Prettier in CI pipeline
- [ ] Set up TypeScript type checking in CI
- [ ] Configure Vitest for CI testing
- [ ] Set up Codecov integration for coverage reporting
- [ ] Configure Vercel deployment automation
- [ ] Set up Dependabot for dependency updates
- [ ] Create pre-commit hooks with Husky
- [ ] Configure coverage thresholds and reporting
- [ ] Set up branch protection rules
- [ ] Create PR templates with quality checklists
- [ ] Configure automated testing on pull requests

**Acceptance Criteria:**

- CI pipeline runs on every push and PR
- Linting passes with no errors or warnings
- TypeScript compilation succeeds
- All tests pass in CI environment
- Code coverage reports are generated and uploaded
- Coverage badges are displayed in README
- Vercel deploys automatically on main branch
- Dependabot creates automated PRs for updates
- Pre-commit hooks prevent bad commits
- Branch protection requires CI to pass
- PR templates guide contributors

---

#### **1.3 Theme System & Design Tokens**

**Estimated Time:** 2-3 hours  
**Value:** Consistent, branded design system

**Definition of Done:**

- [ ] Create custom color palette for light and dark modes
- [ ] Configure Shadcn/ui theme with custom colors
- [ ] Set up CSS custom properties for design tokens
- [ ] Create theme provider with context
- [ ] Implement theme switching with smooth transitions
- [ ] Add theme persistence in localStorage
- [ ] Create theme-aware components
- [ ] Add system theme detection
- [ ] Test theme switching across all components

**Acceptance Criteria:**

- Custom brand colors are applied consistently
- Dark/light mode switches smoothly
- Theme preference persists across sessions
- System theme is detected automatically
- All Shadcn components use custom theme
- Color contrast meets accessibility standards
- Theme switching works without page reload

---

#### **1.4 Internationalization Setup**

**Estimated Time:** 2-3 hours  
**Value:** Multi-language support for global users

**Definition of Done:**

- [ ] Configure react-i18next with browser detection
- [ ] Set up translation file structure
- [ ] Create language switcher component
- [ ] Implement dynamic translation loading
- [ ] Add language persistence in localStorage
- [ ] Create i18n hooks for easy usage
- [ ] Set up pluralization and interpolation
- [ ] Add RTL support for Arabic/Hebrew
- [ ] Create translation management utilities

**Acceptance Criteria:**

- Language detection works automatically
- Language switching updates all text immediately
- Translation files are loaded dynamically
- Language preference persists across sessions
- Pluralization works correctly
- RTL languages display properly
- Translation keys are organized logically
- Missing translations are handled gracefully

---

#### **1.5 Authentication System**

**Estimated Time:** 3-4 hours  
**Value:** Secure user access to the application

**Definition of Done:**

- [ ] Create login and register forms with React Hook Form
- [ ] Implement JWT token storage and management
- [ ] Create authentication context and hooks
- [ ] Add protected route wrapper
- [ ] Implement logout functionality
- [ ] Add "Remember me" functionality
- [ ] Create password reset flow
- [ ] Add loading states and error handling
- [ ] Write unit tests for auth components
- [ ] Add i18n support for all auth text
- [ ] Ensure auth forms work in both themes

**Acceptance Criteria:**

- Users can log in with email/password
- Users can register new accounts
- JWT tokens are properly stored and managed
- Protected routes redirect to login when unauthorized
- Logout clears all user data
- Form validation works correctly
- Error messages are user-friendly and translated
- Authentication state persists across page refreshes
- Forms look good in both light and dark modes

---

#### **1.6 Layout & Navigation**

**Estimated Time:** 3-4 hours  
**Value:** Consistent user experience and navigation

**Definition of Done:**

- [ ] Create responsive header with user menu
- [ ] Build sidebar navigation for projects
- [ ] Implement breadcrumb navigation
- [ ] Create mobile-responsive navigation
- [ ] Add loading skeletons for navigation
- [ ] Implement dark/light mode toggle in header
- [ ] Add language switcher in header
- [ ] Create layout wrapper component
- [ ] Add keyboard navigation support
- [ ] Ensure all navigation text is translated
- [ ] Test navigation in both themes

**Acceptance Criteria:**

- Header shows user info, theme toggle, and language switcher
- Sidebar shows user's projects
- Navigation is responsive on mobile devices
- Breadcrumbs show current location
- Dark/light mode toggle works from header
- Language switching updates navigation text
- Keyboard navigation is accessible
- Loading states are smooth and informative
- All navigation elements work in both themes

---

### **Phase 2: Project Management**

#### **2.1 Project Dashboard**

**Estimated Time:** 3-4 hours  
**Value:** Main entry point for project management

**Definition of Done:**

- [ ] Create project grid/list view
- [ ] Implement project creation modal
- [ ] Add project search and filtering
- [ ] Create project cards with key metrics
- [ ] Implement project status indicators
- [ ] Add project actions (edit, archive, delete)
- [ ] Create empty state for new users
- [ ] Add project sorting options
- [ ] Implement infinite scroll for large project lists
- [ ] Add i18n support for all project text
- [ ] Ensure project cards work in both themes

**Acceptance Criteria:**

- Users can view all their projects
- Project cards show name, description, status, and task count
- Search filters projects by name/description
- Users can create new projects
- Project actions work correctly
- Empty state guides new users
- Sorting works (by name, date, status)
- Infinite scroll handles large datasets
- All text is properly translated
- Cards look great in both light and dark modes

---

#### **2.2 Project Detail View**

**Estimated Time:** 4-5 hours  
**Value:** Comprehensive project overview and management

**Definition of Done:**

- [ ] Create project header with key info
- [ ] Build project tabs (Overview, Tasks, Contributors, Attachments)
- [ ] Implement project editing functionality
- [ ] Create project progress visualization
- [ ] Add project activity feed
- [ ] Implement project settings
- [ ] Create project export functionality
- [ ] Add project sharing options
- [ ] Add i18n support for all project detail text
- [ ] Ensure all components work in both themes
- [ ] Add theme-aware charts and visualizations

**Acceptance Criteria:**

- Project header shows name, description, status, and owner
- Tabs organize project information clearly
- Users can edit project details
- Progress visualization shows completion metrics
- Activity feed shows recent project activity
- Settings allow project configuration
- Export functionality works
- Sharing options are available
- All text is properly translated
- Charts and visualizations adapt to theme

---

#### **2.3 Contributor Management**

**Estimated Time:** 3-4 hours  
**Value:** Team collaboration and access control

**Definition of Done:**

- [ ] Create contributor list view
- [ ] Implement add contributor modal
- [ ] Add role management interface
- [ ] Create contributor invitation system
- [ ] Implement contributor removal
- [ ] Add role change confirmation
- [ ] Create contributor activity indicators
- [ ] Add bulk contributor operations
- [ ] Add i18n support for all contributor text
- [ ] Ensure contributor management works in both themes

**Acceptance Criteria:**

- Users can view all project contributors
- Adding contributors works with email lookup
- Role changes are properly validated
- Invitations are sent and tracked
- Contributor removal has proper confirmation
- Role hierarchy is enforced
- Activity indicators show contributor engagement
- Bulk operations work for multiple contributors
- All text is properly translated
- Interface works seamlessly in both themes

---

### **Phase 3: Task Management**

#### **3.1 Task List & Board View**

**Estimated Time:** 4-5 hours  
**Value:** Core task management functionality

**Definition of Done:**

- [ ] Create task list view with filtering
- [ ] Implement Kanban board view
- [ ] Add task creation modal
- [ ] Implement task editing functionality
- [ ] Create task status transitions
- [ ] Add task assignment interface
- [ ] Implement task priority indicators
- [ ] Create task due date management
- [ ] Add task bulk operations
- [ ] Add i18n support for all task text
- [ ] Ensure task views work in both themes
- [ ] Add theme-aware status and priority indicators

**Acceptance Criteria:**

- Task list shows all project tasks with filtering
- Kanban board organizes tasks by status
- Task creation includes all required fields
- Task editing preserves all data
- Status transitions follow proper workflow
- Assignment interface shows available contributors
- Priority indicators are clear and actionable
- Due dates are properly managed
- Bulk operations work for multiple tasks
- All text is properly translated
- Status and priority indicators are theme-aware

---

#### **3.2 Task Detail & Comments**

**Estimated Time:** 3-4 hours  
**Value:** Detailed task information and collaboration

**Definition of Done:**

- [ ] Create task detail modal/sidebar
- [ ] Implement comment system
- [ ] Add comment editing and deletion
- [ ] Create @mention functionality
- [ ] Implement comment notifications
- [ ] Add task history tracking
- [ ] Create task activity indicators
- [ ] Implement task sharing
- [ ] Add i18n support for all task detail text
- [ ] Ensure task detail works in both themes
- [ ] Add theme-aware comment styling

**Acceptance Criteria:**

- Task detail shows all task information
- Comments can be added, edited, and deleted
- @mentions work and notify users
- Comment notifications are sent
- Task history shows all changes
- Activity indicators show task engagement
- Task sharing works with proper permissions
- Comment threading is supported
- All text is properly translated
- Comments look great in both themes

---

#### **3.3 File Attachments**

**Estimated Time:** 3-4 hours  
**Value:** File sharing and document management

**Definition of Done:**

- [ ] Create file upload interface
- [ ] Implement drag-and-drop upload
- [ ] Add file preview functionality
- [ ] Create file management interface
- [ ] Implement file download
- [ ] Add file deletion with confirmation
- [ ] Create file type indicators
- [ ] Implement file size validation
- [ ] Add i18n support for all attachment text
- [ ] Ensure attachment interface works in both themes

**Acceptance Criteria:**

- File upload works with drag-and-drop
- File preview shows appropriate content
- File management allows organization
- Downloads work correctly
- File deletion has proper confirmation
- File type indicators are clear
- Size validation prevents oversized uploads
- File permissions are enforced
- All text is properly translated
- Interface works seamlessly in both themes

---

### **Phase 4: Advanced Features**

#### **4.1 Search & Filtering**

**Estimated Time:** 3-4 hours  
**Value:** Efficient information discovery

**Definition of Done:**

- [ ] Implement global search functionality
- [ ] Create advanced filtering interface
- [ ] Add saved search functionality
- [ ] Implement search suggestions
- [ ] Create search result highlighting
- [ ] Add search history
- [ ] Implement search analytics
- [ ] Create search keyboard shortcuts
- [ ] Add i18n support for all search text
- [ ] Ensure search interface works in both themes

**Acceptance Criteria:**

- Global search finds projects, tasks, and comments
- Advanced filters work for all entities
- Saved searches can be created and reused
- Search suggestions improve discovery
- Results highlight matching terms
- Search history is maintained
- Search analytics show usage patterns
- Keyboard shortcuts improve efficiency
- All text is properly translated
- Search interface adapts to theme

---

#### **4.2 Real-time Updates**

**Estimated Time:** 4-5 hours  
**Value:** Live collaboration experience

**Definition of Done:**

- [ ] Integrate Socket.io for real-time updates
- [ ] Implement live task updates
- [ ] Add real-time comment notifications
- [ ] Create presence indicators
- [ ] Implement typing indicators
- [ ] Add real-time search updates
- [ ] Create offline/online status
- [ ] Implement real-time error handling
- [ ] Add i18n support for real-time notifications
- [ ] Ensure real-time indicators work in both themes

**Acceptance Criteria:**

- Task updates appear in real-time
- Comment notifications are instant
- Presence shows who's online
- Typing indicators work in comments
- Search updates reflect changes immediately
- Offline/online status is accurate
- Real-time errors are handled gracefully
- Connection status is clearly indicated
- Notifications are properly translated
- Real-time indicators are theme-aware

---

#### **4.3 Reporting & Analytics**

**Estimated Time:** 4-5 hours  
**Value:** Project insights and progress tracking

**Definition of Done:**

- [ ] Create project progress dashboard
- [ ] Implement task completion charts
- [ ] Add team performance metrics
- [ ] Create time tracking visualization
- [ ] Implement custom report builder
- [ ] Add data export functionality
- [ ] Create report scheduling
- [ ] Implement report sharing
- [ ] Add i18n support for all reporting text
- [ ] Ensure charts and visualizations work in both themes
- [ ] Add theme-aware chart colors and styling

**Acceptance Criteria:**

- Progress dashboard shows key metrics
- Charts visualize task completion trends
- Team performance is measured and displayed
- Time tracking data is visualized
- Custom reports can be created
- Data export works in multiple formats
- Reports can be scheduled
- Report sharing works with permissions
- All text is properly translated
- Charts and visualizations adapt to theme

---

### **Phase 5: PWA & Polish**

#### **5.1 Progressive Web App Features**

**Estimated Time:** 3-4 hours  
**Value:** Mobile app-like experience

**Definition of Done:**

- [ ] Configure service worker with Workbox
- [ ] Implement offline functionality
- [ ] Add push notifications
- [ ] Create app manifest
- [ ] Implement background sync
- [ ] Add install prompt
- [ ] Create offline fallback pages
- [ ] Implement cache strategies
- [ ] Add i18n support for PWA messages
- [ ] Ensure PWA works in both themes

**Acceptance Criteria:**

- App works offline for cached content
- Push notifications are received
- App can be installed on mobile devices
- Background sync works for offline actions
- Install prompt appears appropriately
- Offline fallback pages are informative
- Cache strategies optimize performance
- PWA features work across browsers
- PWA messages are properly translated
- PWA works seamlessly in both themes

---

#### **5.2 Performance & Optimization**

**Estimated Time:** 2-3 hours  
**Value:** Fast, responsive user experience

**Definition of Done:**

- [ ] Implement code splitting
- [ ] Add lazy loading for components
- [ ] Optimize bundle size
- [ ] Implement image optimization
- [ ] Add performance monitoring
- [ ] Create loading optimizations
- [ ] Implement error boundaries
- [ ] Add accessibility improvements
- [ ] Optimize theme switching performance
- [ ] Optimize i18n loading performance

**Acceptance Criteria:**

- Code splitting reduces initial bundle size
- Lazy loading improves perceived performance
- Bundle size is optimized
- Images are properly optimized
- Performance is monitored and tracked
- Loading states are smooth
- Error boundaries prevent crashes
- Accessibility meets WCAG standards
- Theme switching is instant
- Language switching is fast

---

#### **5.3 Mobile Optimization**

**Estimated Time:** 2-3 hours  
**Value:** Excellent mobile experience

**Definition of Done:**

- [ ] Optimize touch interactions
- [ ] Implement mobile-specific navigation
- [ ] Add mobile gestures
- [ ] Optimize mobile forms
- [ ] Create mobile-specific layouts
- [ ] Implement mobile notifications
- [ ] Add mobile keyboard handling
- [ ] Create mobile performance optimizations
- [ ] Ensure mobile works with both themes
- [ ] Test mobile with different languages

**Acceptance Criteria:**

- Touch interactions are responsive
- Mobile navigation is intuitive
- Gestures work naturally
- Mobile forms are optimized
- Layouts adapt to mobile screens
- Mobile notifications work
- Keyboard handling is smooth
- Mobile performance is excellent
- Mobile works great in both themes
- Mobile supports all languages

---

## Theme System Implementation

### **Custom Shadcn Theme Configuration**

```typescript
// themes/index.ts
import { createTheme } from '@shadcn/ui';

export const lightTheme = createTheme({
  colors: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    primary: {
      DEFAULT: 'hsl(221.2 83.2% 53.3%)',
      foreground: 'hsl(210 40% 98%)',
    },
    secondary: {
      DEFAULT: 'hsl(210 40% 96%)',
      foreground: 'hsl(215.4 16.3% 46.9%)',
    },
    // ... custom brand colors
  },
});

export const darkTheme = createTheme({
  colors: {
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    primary: {
      DEFAULT: 'hsl(217.2 91.2% 59.8%)',
      foreground: 'hsl(222.2 84% 4.9%)',
    },
    secondary: {
      DEFAULT: 'hsl(217.2 32.6% 17.5%)',
      foreground: 'hsl(210 40% 98%)',
    },
    // ... custom brand colors
  },
});
```

### **Theme Provider Setup**

```typescript
// themes/provider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { lightTheme, darkTheme } from './index'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

## Internationalization Implementation

### **i18n Configuration**

```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### **Translation Structure**

```
public/locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── projects.json
│   ├── tasks.json
│   └── errors.json
├── fr/
│   ├── common.json
│   ├── auth.json
│   ├── projects.json
│   ├── tasks.json
│   └── errors.json
└── es/
    ├── common.json
    ├── auth.json
    ├── projects.json
    ├── tasks.json
    └── errors.json
```

### **i18n Hooks**

```typescript
// i18n/hooks.ts
import { useTranslation } from 'react-i18next';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return {
    t,
    currentLanguage: i18n.language,
    changeLanguage,
    isRTL: ['ar', 'he'].includes(i18n.language),
  };
};
```

## API Integration Strategy

### **API Client Setup**

```typescript
// src/services/api.ts
import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
});

// Request interceptor for authentication
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add language header for i18n
  const language = localStorage.getItem('i18nextLng') || 'en';
  config.headers['Accept-Language'] = language;

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### **Type Sharing**

```typescript
// src/types/api.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  contributors?: ProjectContributor[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  projectId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

// ... other types
```

### **React Query Integration**

```typescript
// src/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(res => res.data),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) =>
      api.post('/projects', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
```

## Deployment Strategy

### **Vercel Configuration**

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/locales/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ],
  "env": {
    "VITE_API_URL": "@vite_api_url",
    "VITE_WS_URL": "@vite_ws_url"
  }
}
```

### **Environment Variables**

```bash
# .env.production
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_WS_URL=wss://your-api-domain.com
VITE_ENVIRONMENT=production
VITE_DEFAULT_LOCALE=en
VITE_SUPPORTED_LOCALES=en,fr,es
```

## Development Workflow

### **1. Setup Phase**

```bash
# Create new repository
git init project-management-ui
cd project-management-ui

# Initialize with Vite
npm create vite@latest . -- --template react-ts

# Install dependencies
pnpm install @tanstack/react-query react-router-dom axios
pnpm install react-hook-form @hookform/resolvers zod
pnpm install lucide-react class-variance-authority clsx tailwind-merge
pnpm install next-themes react-i18next i18next-browser-languagedetector i18next-http-backend
pnpm install -D @types/node autoprefixer postcss tailwindcss
```

### **2. Configuration**

```bash
# Setup Tailwind CSS
npx tailwindcss init -p

# Setup Shadcn/ui
npx shadcn@latest init

# Setup ESLint and Prettier
pnpm install -D eslint prettier eslint-config-prettier
pnpm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Setup Testing
pnpm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm install -D @vitest/ui @testing-library/user-event
```

### **3. Development Process**

1. **API-First Development** - Test API endpoints before building UI
2. **Component-Driven** - Build reusable components first
3. **Type Safety** - Share types between frontend and backend
4. **Testing** - Write tests for critical user flows
5. **Performance** - Monitor and optimize continuously
6. **i18n-First** - Always add translations when creating new text
7. **Theme-Aware** - Test components in both light and dark modes

## CI/CD Configuration

### **GitHub Actions Workflow**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Run TypeScript type check
        run: pnpm type-check

      - name: Run tests with coverage
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: frontend
          name: frontend-coverage
          fail_ci_if_error: false

  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build application
        run: pnpm build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_WS_URL: ${{ secrets.VITE_WS_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### **Vitest Configuration**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### **Test Setup**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### **ESLint Configuration**

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### **Prettier Configuration**

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### **Husky Pre-commit Hooks**

```json
// package.json scripts
{
  "scripts": {
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "prepare": "husky install"
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint
pnpm type-check
pnpm test:run
pnpm format:check
```

### **Codecov Configuration**

```yaml
# .codecov.yml
coverage:
  precision: 2
  round: down
  range: '80...100'
  status:
    project:
      default:
        target: 80%
        threshold: 5%
    patch:
      default:
        target: 80%
        threshold: 5%

parsers:
  gcov:
    branch_detection:
      conditional: yes
      loop: yes
      method: no
      macro: no

comment:
  layout: 'reach,diff,flags,files,footer'
  behavior: default
  require_changes: false
```

### **Vercel Configuration**

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/locales/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ],
  "env": {
    "VITE_API_URL": "@vite_api_url",
    "VITE_WS_URL": "@vite_ws_url"
  }
}
```

### **Dependabot Configuration**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    reviewers:
      - 'your-username'
    assignees:
      - 'your-username'
    commit-message:
      prefix: 'chore'
      include: 'scope'
    labels:
      - 'dependencies'
      - 'frontend'

  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 5
    reviewers:
      - 'your-username'
    assignees:
      - 'your-username'
    commit-message:
      prefix: 'ci'
      include: 'scope'
    labels:
      - 'dependencies'
      - 'ci/cd'
```

### **PR Template**

```markdown
<!-- .github/pull_request_template.md -->

## Description

<!-- Describe your changes in detail -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Code coverage meets requirements

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules

## Screenshots (if applicable)

<!-- Add screenshots to help explain your changes -->

## Additional Notes

<!-- Add any other context about the pull request here -->
```
