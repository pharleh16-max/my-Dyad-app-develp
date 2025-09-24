# AI Rules for AttendanceDREAMS Application

This document outlines the core technologies used in this project and provides guidelines for using specific libraries and tools.

## Tech Stack Overview

*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
*   **Vite**: A fast build tool that provides an instant development server and optimized builds.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **shadcn/ui**: A collection of reusable components built with Radix UI and styled with Tailwind CSS.
*   **React Router**: A standard library for routing in React applications.
*   **Supabase**: An open-source Firebase alternative providing database, authentication, and storage services.
*   **React Query (TanStack Query)**: A powerful library for fetching, caching, and updating asynchronous data in React.
*   **Lucide React**: A collection of beautiful and customizable SVG icons.
*   **date-fns**: A comprehensive JavaScript date utility library.
*   **Sonner**: A modern toast component for React.

## Library Usage Guidelines

To maintain consistency and leverage the strengths of each library, please adhere to the following rules:

*   **UI Components**:
    *   **Always** prioritize using components from `shadcn/ui` (located in `src/components/ui`).
    *   If a required component is not available in `shadcn/ui` or needs significant custom behavior/styling, create a **new component** in `src/components/` and style it using Tailwind CSS.
    *   **Never** directly modify files within `src/components/ui`.
*   **Styling**:
    *   **Exclusively** use Tailwind CSS for all component styling.
    *   Custom CSS should be minimal and reserved for global styles or specific utility classes defined in `src/index.css`.
*   **Routing**:
    *   Use `react-router-dom` for all client-side navigation and route definitions.
    *   All primary application routes should be defined in `src/App.tsx`.
*   **Authentication & User State**:
    *   Manage all authentication-related state and actions (sign-in, sign-up, sign-out, user profile fetching) through the `src/hooks/useAuthState.ts` hook.
    *   Interact with Supabase for auth via the client in `src/integrations/supabase/client.ts`.
*   **Data Fetching & Caching**:
    *   For fetching, caching, and synchronizing server state, use `@tanstack/react-query`.
*   **Icons**:
    *   Use `lucide-react` for all icons throughout the application.
*   **Date Manipulation**:
    *   For any date formatting, parsing, or manipulation, use `date-fns`.
*   **Notifications**:
    *   For simple, non-blocking toast notifications, use `sonner`.
    *   For more complex or interactive toasts, `src/components/ui/toast` (Radix UI based) can be used, but `sonner` is generally preferred for its simplicity.
*   **Utility Functions**:
    *   General utility functions (e.g., `cn` for Tailwind class merging) should be placed in `src/lib/utils.ts`.
*   **Supabase Integration**:
    *   All interactions with the Supabase backend (database queries, storage, etc.) should use the `supabase` client instance from `src/integrations/supabase/client.ts`.
    *   Refer to `src/integrations/supabase/types.ts` for database type definitions.