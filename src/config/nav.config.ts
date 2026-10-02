import {
  LayoutDashboard,
  Users,
  Receipt,
  BookOpen,
  BarChart3,
  Settings,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

/**
 * Ledrix — Sidebar navigation config.
 * Add new pages here, sidebar auto-renders.
 */

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: ROUTES.dashboard,
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: ROUTES.analytics,
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Workers",
        href: ROUTES.workers,
        icon: Users,
      },
      {
        title: "Transactions",
        href: ROUTES.transactions,
        icon: Receipt,
      },
      {
        title: "Running Ledger",
        href: ROUTES.ledger,
        icon: BookOpen,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Reports",
        href: ROUTES.reports,
        icon: BarChart3,
      },
      {
        title: "Activity",
        href: ROUTES.activityLogs,
        icon: Activity,
      },
      {
        title: "Settings",
        href: ROUTES.settings,
        icon: Settings,
      },
    ],
  },
];