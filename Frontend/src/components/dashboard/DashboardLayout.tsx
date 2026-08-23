import { type ReactNode, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ChevronRight,
  LogOut,
  Moon,
  Search,
  Sun,
  User,
  Sparkles,
  Home,
  ShoppingBag,
  Package,
  UserCheck,
  CheckCheck,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth-context";
import { notificationService, type AppNotification } from "@/lib/notifications";
import { toast } from "sonner";

export type NavItem = { key: string; label: string; icon: LucideIcon };

export function DashboardLayout({
  title,
  role,
  items,
  active,
  onChange,
  search,
  onSearchChange,
  children,
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
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const current = items.find((i) => i.key === active);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoadingNotifs(true);
    try {
      const data = await notificationService.getNotifications(user);
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoadingNotifs(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds for live order & stock updates
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, [loadNotifications]);

  const handleSignOut = async () => {
    await logout();
    nav({ to: "/" });
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (user) {
      notificationService.markAsRead(user.id || user._id, n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
    }
    if (n.actionTab) {
      onChange(n.actionTab);
    }
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    notificationService.markAllAsRead(user.id || user._id, notifications);
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground relative">
        <Sidebar collapsible="icon" className="border-r border-border/50 bg-card/60 backdrop-blur-xl">
          <SidebarHeader className="p-3 border-b border-border/40">
            <Link to="/" className="flex items-center gap-2.5 px-2 py-1.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white grid place-items-center text-xs font-bold shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="font-extrabold text-sm font-heading tracking-tight text-foreground">
                  Darsh Dental
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {role}
                </span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-2 py-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-3 mb-1">
                Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {items.map((item) => {
                    const isActive = item.key === active;
                    const isNotificationTab = item.key === "notifications";
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => onChange(item.key)}
                          tooltip={item.label}
                          className={`rounded-xl h-10 px-3 transition-all relative ${
                            isActive
                              ? "bg-primary text-primary-foreground font-bold shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{item.label}</span>
                          {isNotificationTab && unreadCount > 0 && (
                            <Badge className="ml-auto h-4 min-w-4 px-1 text-[9px] font-bold bg-destructive text-white border-0">
                              {unreadCount}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border/40 space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Storefront">
                  <Link
                    to="/"
                    className="rounded-xl h-9 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    <Home className="h-4 w-4" />
                    <span>Back to Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  tooltip="Sign Out"
                  className="rounded-xl h-9 px-3 text-xs text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="rounded-xl h-9 w-9 border border-border/60 hover:bg-secondary" />
              <nav className="flex items-center text-xs font-semibold text-muted-foreground gap-1.5 min-w-0">
                <span className="text-muted-foreground truncate">{title}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                <span className="text-foreground font-bold truncate">{current?.label}</span>
              </nav>
            </div>

            <div className="flex items-center gap-2.5">
              {onSearchChange !== undefined && (
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    className="pl-8.5 w-56 h-9 rounded-xl bg-background/70 border-border/60 text-xs focus:border-primary"
                    value={search ?? ""}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-sky-600" />}
              </Button>

              <NotificationsDropdown
                role={role}
                notifications={notifications}
                unreadCount={unreadCount}
                onNotificationClick={handleNotificationClick}
                onMarkAllRead={handleMarkAllRead}
                onOpenFull={() => onChange("notifications")}
              />

              <ProfileDropdown
                role={role}
                user={user}
                onSignOut={handleSignOut}
              />
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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

function NotificationsDropdown({
  role,
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAllRead,
  onOpenFull,
}: {
  role: string;
  notifications: AppNotification[];
  unreadCount: number;
  onNotificationClick: (n: AppNotification) => void;
  onMarkAllRead: () => void;
  onOpenFull: () => void;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-3.5 w-3.5 text-primary shrink-0" />;
      case "stock":
        return <Package className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
      case "user":
        return <UserCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-primary shrink-0" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl h-9 w-9">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-white text-[9px] font-extrabold shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 glass-card rounded-2xl p-2 shadow-2xl border-border/70">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
            {role === "Doctor" ? "Clinic Alerts" : role === "Shop Owner" ? "Shop Live Alerts" : "Platform Alerts"}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-border/40 my-1" />

        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground space-y-1">
            <Bell className="h-6 w-6 mx-auto opacity-40 mb-2" />
            <p className="text-xs font-semibold">No notifications yet</p>
            <p className="text-[10px]">Real-time orders, dispatch, and restock alerts will appear here.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
            {notifications.slice(0, 6).map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => onNotificationClick(n)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                  !n.isRead ? "bg-primary/8 font-medium border-l-2 border-primary" : "hover:bg-secondary/70 opacity-80"
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-background border border-border/50">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-foreground truncate">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator className="bg-border/40 my-1" />
        <DropdownMenuItem
          onClick={onOpenFull}
          className="rounded-xl justify-center text-xs font-semibold text-primary py-2 cursor-pointer hover:bg-primary/10"
        >
          View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileDropdown({
  role,
  user,
  onSignOut,
}: {
  role: string;
  user: any;
  onSignOut: () => void;
}) {
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DD";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-2xl hover:bg-secondary/80 p-1.5 pr-3 transition-colors border border-border/40">
          <Avatar className="h-7 w-7 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white font-bold text-xs">
            <AvatarFallback className="bg-transparent text-white text-[11px] font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
              {user?.fullName || "Doctor"}
            </span>
            <span className="text-[10px] text-primary font-semibold">{role}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card w-56 rounded-2xl p-2">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="font-bold text-xs">{user?.fullName || "Doctor Profile"}</div>
          <div className="text-[11px] text-muted-foreground truncate">{user?.email || "doctor@clinic.com"}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-xs">
          <Link to="/">
            <Home className="h-3.5 w-3.5 mr-2" /> Storefront
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut} className="rounded-xl cursor-pointer text-xs text-destructive hover:bg-destructive/10">
          <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function useDashboardSection<T extends string>(initial: T) {
  return useState<T>(initial);
}
