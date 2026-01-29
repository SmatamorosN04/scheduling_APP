# 📅 Appointment Booking System (ArielCalendar)

A high-performance, minimalist appointment management system built with **Next.js 16**, **TypeScript**, and **MongoDB**. This project features a dual-interface approach for seamless administrative control and a friction-less client booking experience.

## 🚀 Key Features

* **Hybrid Calendar System**: Integrated logic for an **Admin Dashboard** (Read and Delete) and a **Client Booking Flow** (availability check).
* **Intelligent Responsive Engine**:
    * Automatic switch to **Agenda View** on mobile devices.
    * Programmatic restriction of heavy views (Month/Week) on small screens to maintain UI integrity.
* **Modern Admin Sidebar**: A left-aligned details panel for event management, featuring smooth Framer Motion-like transitions and backdrop-blur overlays.
* **Brutalist UI Design**:
    * Clean event blocks with dynamic color-coding based on service type.
    * Customized `react-big-calendar` components to match a professional minimalist aesthetic.
* **Ti****mezone-Aware Scheduling**: Optimized for Nicaragua (`es-NI`) using `moment-timezone` (America/Managua).

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (App Router)
* **Language**: TypeScript
* **Database**: MongoDB (via Mongoose/Native Driver)
* **Calendar Engine**: React Big Calendar
* **State & Logic**: React Hooks + Server Actions
* **Styling**: Tailwind CSS 4.0 / PostCSS




## 📂 Project Structure

Following the official Next.js App Router conventions:

```text
├── app/
│   ├── admin/dashboard/    # Admin control center
│   ├── api/                # API Route handlers
│   ├── clients/booking/    # Client-facing appointment flow
│   ├── components/         # Atomic UI Components
│   │   ├── Calendar/       # Core Calendar implementation
│   │   ├── Events/         # Custom Event UI (Blue/Minimalist style)
│   │   └── TimeSlotPicker/ # Custom availability logic
│   └── login/              # Administrative authentication
├── lib/
│   ├── actions.ts          # Next.js Server Actions (CRUD)
│   ├── mongodb.ts          # Database connection singleton
│   └── constants.ts        # Business logic constants
└── public/                 # Static assets
```
# 📦 Installation Guide - Dependencies

Run these commands in your project terminal to install all the necessary libraries for the **ArielCalendar** system.

### 1. Core Framework & Styles
Essential for Next.js 16 and the latest Tailwind CSS processing.
```bash
npm install next@latest react@latest react-dom@latest
npm install -D tailwindcss postcss autoprefixer
npm install react-big-calendar moment moment-timezone
npm install mongoose mongodb
npm install -D @types/react-big-calendar @types/node @types/react @types/react-dom
