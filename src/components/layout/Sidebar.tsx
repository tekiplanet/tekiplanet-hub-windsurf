import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Academy",
      href: "/dashboard/academy",
    },
    {
      label: "My Courses",
      href: "/dashboard/academy/my-courses",
    },
    {
      label: "Wallet",
      href: "/dashboard/wallet",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0">
        <ScrollArea className="h-full py-6">
          <div className="space-y-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                    onClick={onClose}
                  >
                    <Link to={item.href}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default Sidebar; 