# 💰 Familia Gómez De La Cruz - Finance App

A modern financial management application built with Next.js, designed specifically for the Gómez De La Cruz family to track expenses, income, and savings goals.

## ✨ Features

- 💸 **Transaction Management**: Track income and expenses with detailed categorization
- 📊 **Statistics Dashboard**: Visual analytics of spending patterns and trends
- 🎯 **Savings Goals**: Set and monitor progress towards financial objectives
- 👫 **Multi-person Support**: Separate tracking for family members
- 🔐 **Secure Authentication**: Protected access to financial data
- 📱 **Mobile-First Design**: Responsive interface optimized for mobile devices
- 🌟 **Modern UI**: Clean, colorful design with emoji-enhanced user experience

## 🚀 Quick Start

### Prerequisites

- Node.js 22.16.0 or later
- npm 10.0.0 or later

### Installation

1. **Clone the repository:**
   ```bash
   git clone [your-repository-url]
   cd biohack
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables:**
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STATIC_USERNAME=your_username
   NEXT_PUBLIC_STATIC_PASSWORD=your_password
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🔧 Dependency Installation Troubleshooting

If you encounter build failures with exit code 1 during dependency installation, use these solutions:

### Windows (Recommended)
```powershell
# Clean installation
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force

# Install with legacy peer deps
& "C:\Program Files\nodejs\npm.cmd" install --legacy-peer-deps

# Build the application
& "C:\Program Files\nodejs\npm.cmd" run build
```

### Automated Deployment
Run the deployment script for a complete setup:
```powershell
# With lint checking
.\deploy.ps1

# Skip linting for faster build
.\deploy.ps1 -SkipLint

# Clean installation
.\deploy.ps1 -Clean
```

### Alternative Solutions
1. **Use CI installation:**
   ```bash
   npm ci --legacy-peer-deps
   ```

2. **Manual cleanup:**
   ```bash
   npm run install:clean
   ```

3. **Force reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps --force
   ```

## 📊 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run install:clean` - Clean install dependencies
- `npm run install:ci` - CI-optimized installation

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15.4.2
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React + Emojis
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **TypeScript**: Full type safety

### Project Structure
```
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main application
├── components/         # React components
│   ├── statistics-dashboard.tsx
│   ├── savings-goals.tsx
│   └── ui/            # UI components
├── lib/               # Utility functions
│   ├── supabase.ts    # Database client
│   └── utils.ts       # Helper functions
├── scripts/           # Database setup
└── public/            # Static assets
```

## 🗄️ Database Setup

1. **Create Supabase project**
2. **Run setup script:**
   ```sql
   -- Execute scripts/setup-database.sql in Supabase SQL editor
   ```
3. **Add sample data:**
   ```sql
   -- Execute scripts/add-savings-goals.sql for savings goals
   ```

## 🎨 Design System

- **Colors**: Blue gradient theme with white cards
- **Typography**: Roboto font family
- **Icons**: Mix of Lucide React icons and colorful emojis
- **Layout**: Mobile-first responsive design
- **Animations**: Smooth transitions and hover effects

## 🔒 Security

- Environment variables for sensitive data
- Static authentication (configurable)
- Input validation with Zod
- Secure database queries through Supabase

## 📱 Mobile Support

- Responsive design optimized for mobile devices
- Touch-friendly interface
- Swipe gestures support
- Progressive Web App ready

## 🐛 Common Issues

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions to common problems.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary to the Gómez De La Cruz family.

## 🎯 Future Enhancements

- [ ] Receipt scanning with OCR
- [ ] Budget alerts and notifications
- [ ] Investment tracking
- [ ] Export to CSV/PDF
- [ ] Multi-currency support
- [ ] Bank account integration

---

Made with ❤️ for the Familia Gómez De La Cruz
