import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/admin/dashboard",
  },
  {
    title: "Users",
    icon: <Users className="h-5 w-5" />,
    href: "/admin/users",
  },
  {
    title: "Courses",
    icon: <GraduationCap className="h-5 w-5" />,
    href: "/admin/courses",
  },
  {
    title: "Transactions",
    icon: <Wallet className="h-5 w-5" />,
    href: "/admin/transactions",
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/admin/settings",
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    toast.success("Logged out successfully");
    navigate('/admin/login');
  };

  const NavContent = () => (
    <>
      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              location.pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="border-b px-6 py-4">
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
              <div className="flex-1 px-3 py-4">
                <NavContent />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-background md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b px-6 py-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex-1 px-3 py-4">
            <NavContent />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 