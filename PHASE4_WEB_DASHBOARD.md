# Phase 4: Web Dashboard Development

## Overview

Phase 4 implements the web dashboard using **Next.js 14 + React 18 + Material-UI**.

The dashboard provides a user-friendly interface for:
- Organization management
- Employee management
- Payroll processing
- Pay stub generation
- Tax reporting

## What's Included

### Pages Created

1. **Home Dashboard** (`/`)
   - Quick stats (organizations, employees, pay runs)
   - Quick action links
   - Documentation links

2. **Organizations List** (`/organizations`)
   - View all organizations
   - Create, edit, delete organizations
   - Display company details

3. **Create Organization** (`/organizations/new`)
   - Form for company setup
   - Province selection (all 13 provinces/territories)
   - Business number, address, contact info
   - Validation and error handling

### Components & Libraries

- **Framework**: Next.js 14 (React 18)
- **UI Library**: Material-UI (MUI v5)
- **HTTP Client**: Axios with interceptors
- **Styling**: CSS + MUI theme system
- **Forms**: React Hook Form (can be added)
- **State**: Zustand or Redux (can be added)

### File Structure

```
packages/web/
├── src/
│   ├── pages/
│   │   ├── _app.tsx              # Global app setup + theme
│   │   ├── index.tsx             # Home dashboard
│   │   ├── 404.tsx               # 404 page
│   │   └── organizations/
│   │       ├── index.tsx         # List organizations
│   │       └── new.tsx           # Create organization
│   ├── components/               # Reusable components (coming soon)
│   ├── hooks/                    # Custom hooks (coming soon)
│   ├── lib/
│   │   └── api.ts               # API client with axios
│   └── styles/
│       └── globals.css          # Global styles
├── .env.example                 # Environment template
├── next.config.js               # Next.js config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies

```

## Development Setup

### 1. Install Dependencies

```bash
cd /tmp/canadian-payroll/packages/web
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
npm start
```

## Features Implemented

### ✅ Complete

- [x] Next.js + React setup
- [x] Material-UI theme & styling
- [x] API client with Axios
- [x] Home dashboard
- [x] Organizations list page
- [x] Create organization form
- [x] Error handling
- [x] Loading states
- [x] Responsive design
- [x] TypeScript support

### 🔄 In Progress

- [ ] Employee management pages
- [ ] Pay run processing
- [ ] Pay stub generation UI
- [ ] Tax reporting
- [ ] User authentication
- [ ] Pagination components

### 📋 Coming Next

- [ ] Dashboard cards with real data
- [ ] Charts for analytics
- [ ] Export functionality (CSV/Excel)
- [ ] Multi-language support (EN/FR)
- [ ] Dark mode toggle
- [ ] Mobile-responsive improvements

## API Integration

The dashboard communicates with the backend API at:
```
http://localhost:3000/api
```

### Available API Methods (via `src/lib/api.ts`)

**Organizations:**
```typescript
api.getOrganizations(page, limit)
api.getOrganization(id)
api.createOrganization(data)
api.updateOrganization(id, data)
deleteOrganization(id)
```

**Employees:**
```typescript
api.getEmployees(organizationId, page, limit)
api.getActiveEmployees(organizationId)
api.getEmployee(organizationId, employeeId)
api.createEmployee(organizationId, data)
api.updateEmployee(organizationId, employeeId, data)
api.deactivateEmployee(organizationId, employeeId)
api.reactivateEmployee(organizationId, employeeId)
api.deleteEmployee(organizationId, employeeId)
```

## Running the Full Stack

### Terminal 1: Backend API

```bash
cd /tmp/canadian-payroll
npm run backend:dev
# API runs on http://localhost:3000
```

### Terminal 2: Web Dashboard

```bash
cd /tmp/canadian-payroll
npm run web:dev
# Web runs on http://localhost:3001
```

### Terminal 3: Run Tests (Optional)

```bash
cd /tmp/canadian-payroll
npm test
```

## Testing the Dashboard

### Manual Testing Checklist

- [ ] **Home page loads** - http://localhost:3001
- [ ] **Navigation works** - click menu items
- [ ] **Create organization form opens** - `/organizations/new`
- [ ] **Form submission** - creates organization via API
- [ ] **Organization appears in list** - after creation
- [ ] **Delete organization** - removes from list
- [ ] **Error handling** - invalid form shows errors
- [ ] **Loading states** - spinner shows during requests
- [ ] **Responsive layout** - works on mobile/tablet/desktop

## Styling & Theming

The app uses Material-UI theming system (`src/pages/_app.tsx`):

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Roboto"...',
  },
});
```

To customize:
1. Edit theme in `_app.tsx`
2. Or create separate theme file
3. Use MUI's `sx` prop for component-level styling

## Performance Tips

1. **Image Optimization**
   ```tsx
   import Image from 'next/image';
   <Image src="/logo.png" alt="Logo" width={40} height={40} />
   ```

2. **Code Splitting**
   - Next.js auto-splits by page
   - Use dynamic imports for heavy components:
   ```tsx
   const HeavyChart = dynamic(() => import('@/components/Chart'));
   ```

3. **API Caching**
   - Use SWR or React Query for caching
   - Axios interceptors for request/response logging

## Authentication (Future Phase)

When adding auth:

1. Create login page (`/login`)
2. Store JWT token in localStorage
3. Axios interceptor adds to headers:
   ```typescript
   config.headers.Authorization = `Bearer ${token}`;
   ```
4. Redirect to login on 401
5. Protect routes with middleware

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd packages/web
vercel
```

### Environment Variables on Vercel

Go to **Settings → Environment Variables** and add:
- `NEXT_PUBLIC_API_URL`: Your backend API URL

## Troubleshooting

### "Cannot GET /404"
- Make sure Next.js is running: `npm run dev`
- Check port 3001 is available

### API requests failing
- Verify backend is running on port 3000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Open browser console for network errors

### Build failures
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### TypeScript errors
- Run `npm run build` to see all errors
- Check `tsconfig.json` is correct

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Metrics

Target Lighthouse scores:
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

Monitor at: `http://localhost:3001` → DevTools → Lighthouse

## Next Phase: Phase 5

After Phase 4 is complete:

1. **Employee Management Pages**
   - Employee list
   - Create/edit employee form
   - Bulk import from CSV

2. **Payroll Processing**
   - Create pay run
   - Calculate payroll
   - Review before processing
   - Mark as processed

3. **Pay Stub Management**
   - Generate pay stubs
   - Download PDFs
   - Email to employees
   - Archive management

4. **Tax Reporting**
   - T4 generation
   - ROE tracking
   - Year-end reports
   - Export to CRA formats

---

## Quick Commands

```bash
# Development
npm run dev           # Start dev server (port 3001)
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint

# Testing (coming soon)
npm test             # Run Jest tests
npm run test:watch   # Watch mode

# Cleanup
rm -rf .next         # Clear build cache
rm -rf node_modules  # Remove dependencies
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/material-ui)
- [React Hooks Guide](https://react.dev/reference/react)
- [Axios Documentation](https://axios-http.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Document Version**: 1.0
**Created**: January 2024
**Status**: Phase 4 Started ✅
