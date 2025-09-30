# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `npm run dev` - Start Next.js development server on localhost:3000
- **Production build**: `npm run build` - Build the application for production
- **Production server**: `npm start` - Start production server (requires build first)
- **Linting**: `npm run lint` - Run ESLint to check code quality

## High-Level Architecture

This is a Next.js 15 application using the App Router pattern for a crypto loan risk management web app that helps users run a sophisticated credit prime brokerage.

### Core Philosophy & Principles

- `../project-plan/.claude/.claude_principles.md` - Engineering philosophy and core beliefs
- `../project-plan/.claude/.claude_personal.md` - Personal/team preferences and style

### Architecture & Design

- `../project-plan/.claude/.claude_architecture.md` - Clean Architecture rules and patterns
- `../project-plan/.claude/.claude_solid.md` - SOLID principles and refactoring guidelines
- `../project-plan/.claude/.claude_code_style.md` - Architecture code conventions
- `../project-plan/.claude/.claude_cross_component.md` - Multi-component coordination patterns

### Development Process

- `../project-plan/.claude/.claude_workflow.md` - Git workflow, epics, and branching strategy
- `../project-plan/.claude/.claude_testing.md` - TDD approach and testing standards
- `../project-plan/.claude/.claude_todo.md` - TODO file structure and progress tracking

### Repository & Structure

- `../project-plan/.claude/.claude_repository.md` - Multi-component repository management

### Language-Specific

- `.claude/.claude_typescripts.md` - Typescript standards
- `.claude/.claude_testing_typescripts.md` - Typescript standards

### Data-adapters
- **Client-side data persistence**: For this prototype, uses localStorage via `storageUtils` in `src/infrastructure/adapters/storage.ts` for loan, market, credit, liquidity, scenario, and simulation data
- **TypeScript-first**: All components and utilities are strongly typed using clean architecture interfaces
- **Page-based routing**: Each major feature has its own page in `src/app/`
- **Utility-driven calculations**: Risk calculations are centralized under `src/risk/` with modules like `src/risk/var.ts`

### Key Data Flow

1. Loans are managed through `storageUtils` with CRUD operations
2. All monetary values are formatted using USD currency formatting
3. Transaction IDs are generated using timestamp + random string combination

### Component Architecture

- **Navigation**: Shared navigation component in `src/components/Navigation.tsx` with integrated feature flag management
- **Page Components**: Each page (`correlationHeatMap/`, `portfolioAnalysis/`, `scenarioLab`, `drawdownLTVPanel/`) is a self-contained page component
- **Export Modals**: Two export systems controlled by feature flags:
  - **AdvancedExportModal**: Tabbed interface with format selection, filtering, and preview
  - **CloudExportDashboard**: Cloud-integrated export with templates and automation
- **Feature Flags**: Independent control system for export functionality (`src/config/featureFlags.ts`)

### Data Models

The protobuf schemas are in `proto`.

### Styling and UI

- **Tailwind CSS**: Custom color scheme with primary (blue) and secondary (slate) color palettes
- **Responsive design**: Mobile-first approach with responsive breakpoints
- **Lucide React**: Icon library for consistent iconography

### Key Business Logic

- **VAT Rates**: Supports 0%, 5%, and 20% VAT rates
- **Categories**: Predefined expense categories (Hardware, Software, Subscriptions, etc.)
- **Quarterly Reporting**: VAT reports are organized by quarterly periods
- **Export Functionality**: CSV export and advanced cloud export capabilities

### Development Notes

- Uses TypeScript path mapping (`@/*` → `./src/*`)
- Server-side rendering considerations: localStorage access is wrapped with `typeof window` checks
- Error handling for localStorage operations with fallbacks
- Date handling uses standard ISO format with UK locale formatting