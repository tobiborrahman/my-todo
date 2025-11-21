# My Todo - Task Management Application

A modern Todo Web Application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ✅ User Authentication (Signup & Login)
- ✅ Todo Management (Create, Read, Update, Delete)
- ✅ Drag and Drop Reordering
- ✅ User Profile Management
- ✅ Responsive Design
- ✅ Form Validation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-todo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_API_URL=https://todo-app.pioneeralpha.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
my-todo/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── todos/             # Todo management page
│   ├── profile/           # User profile page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home/redirect page
├── components/            # Reusable React components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Navbar.tsx
│   ├── TodoItem.tsx
│   └── TodoForm.tsx
├── contexts/              # React Context providers
│   └── AuthContext.tsx
├── lib/                   # Utility functions
│   └── api.ts            # API client (to be completed)
├── types/                 # TypeScript type definitions
│   └── index.ts
└── public/               # Static assets
```

## Pages

### Signup Page (`/signup`)
- User registration with form validation
- Email and password requirements

### Login Page (`/login`)
- User authentication
- Redirects to todos page on success

### Todo Management Page (`/todos`)
- Create new todos
- Update existing todos
- Delete todos
- Drag and drop to reorder todos
- Mark todos as complete/incomplete

### Profile Page (`/profile`)
- View and update user profile information
- Update name and email

## API Integration

The API functions are structured in `lib/api.ts` and ready to be implemented once the API collection is provided. The following endpoints are prepared:

- `authApi.login()` - User login
- `authApi.signup()` - User registration
- `authApi.logout()` - User logout
- `authApi.getProfile()` - Get user profile
- `authApi.updateProfile()` - Update user profile
- `todoApi.getAll()` - Get all todos
- `todoApi.create()` - Create a new todo
- `todoApi.update()` - Update a todo
- `todoApi.delete()` - Delete a todo
- `todoApi.reorder()` - Reorder todos

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://todo-app.pioneeralpha.com`
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import your repository on [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://todo-app.pioneeralpha.com`
6. Deploy!

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Notes

- The `.env` file is included in the repository (not in .gitignore) as per project requirements
- API functions are structured but not yet implemented - waiting for API collection
- All pages include proper authentication guards
- Drag and drop functionality uses @dnd-kit library

## License

This project is created for assessment purposes.
