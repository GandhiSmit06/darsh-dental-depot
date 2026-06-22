import { type ReactNode, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronRight, LogOut, Moon, Search, Sun, User, type LucideIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export type NavItem = { key: string; label: string; icon: LucideIcon };

export function DashboardLayout({
  title, role, items, active, onChange, search, onSearchChange, children,
}: {
  title: string;
  role: string;
  items: NavItem[];
  active: string;
  onChange: (key: string) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  children: ReactNode;
}) {
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const current = items.find((i) => i.key === active);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Link to="/" className="flex items-center gap-2 px-2 py-2">
              <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center text-xs font-bold">DD</div>
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">Darsh Dental</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{role}</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={item.key === active}
                        onClick={() => onChange(item.key)}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => nav({ to: "/" })} tooltip="Sign out">
                  <LogOut className="h-4 w-4" /><span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b bg-card/50 backdrop-blur sticky top-0 z-30 flex items-center gap-3 px-4">
            <SidebarTrigger />
            <nav className="flex items-center text-sm text-muted-foreground gap-1.5 min-w-0">
              <span>{title}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium truncate">{current?.label}</span>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 w-64 h-9" 
                  value={search ?? ""}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={toggle}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <NotificationsDropdown />
              <ProfileDropdown role={role} onSignOut={() => nav({ to: "/" })} />
            </div>
          </header>

          <main className="p-4 md:p-6 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function NotificationsDropdown() {
  const items = [
    { t: "New order ORD-1024", d: "2m ago" },
    { t: "Low stock: GC Fuji", d: "1h ago" },
    { t: "Dr. Khan registered", d: "3h ago" },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 grid place-items-center text-[10px]">3</Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((n, i) => (
          <DropdownMenuItem key={i} className="flex flex-col items-start gap-0.5">
            <span className="text-sm">{n.t}</span>
            <span className="text-xs text-muted-foreground">{n.d}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileDropdown({ role, onSignOut }: { role: string; onSignOut: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full hover:bg-accent p-1 pr-3">
          <Avatar className="h-8 w-8"><AvatarFallback>U</AvatarFallback></Avatar>
          <span className="hidden md:inline text-sm font-medium">{role}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem><User className="h-4 w-4 mr-2" />Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut}><LogOut className="h-4 w-4 mr-2" />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function useDashboardSection<T extends string>(initial: T) {
  return useState<T>(initial);
}
