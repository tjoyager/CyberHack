'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Package, LayoutDashboard, Inbox, CheckCircle, Warehouse, FileText, LogOut, Search, Bell, User, Settings, HelpCircle, X, Menu, Lock, Truck, Building2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [userRole, setUserRole] = useState("super_admin");
  const [userName, setUserName] = useState("Admin User");
  
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [profileData, setProfileData] = useState({
    fullName: "Admin User",
    email: "admin@simaarome.com",
    department: "IT & Operations",
  });
  
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    language: "English",
    timezone: "Asia/Jakarta (GMT+7)",
  });
  
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, title: "New material submitted", message: "LOT-2026-001 is pending QC approval", time: "2 min ago", timestamp: "2026-05-28 16:45", unread: true, type: "info" },
    { id: 2, title: "QC Approved", message: "LOT-2026-002 has been approved", time: "15 min ago", timestamp: "2026-05-28 16:32", unread: true, type: "success" },
    { id: 3, title: "Moved to production", message: "LOT-2026-003 assigned to warehouse A-12", time: "1 hour ago", timestamp: "2026-05-28 15:47", unread: false, type: "info" },
    { id: 4, title: "Material rejected", message: "LOT-2026-004 failed QC inspection", time: "2 hours ago", timestamp: "2026-05-28 14:47", unread: false, type: "warning" },
    { id: 5, title: "Low stock alert", message: "Lavender Oil stock below threshold", time: "3 hours ago", timestamp: "2026-05-28 13:47", unread: false, type: "warning" },
    { id: 6, title: "Batch completed", message: "Production batch #234 completed successfully", time: "5 hours ago", timestamp: "2026-05-28 11:47", unread: false, type: "success" },
    { id: 7, title: "Expiry warning", message: "5 lots expiring within 30 days", time: "1 day ago", timestamp: "2026-05-27 16:47", unread: false, type: "warning" },
    { id: 8, title: "New supplier added", message: "Global Botanics Ltd added to supplier list", time: "1 day ago", timestamp: "2026-05-27 14:20", unread: false, type: "info" },
    { id: 9, title: "System maintenance", message: "Scheduled maintenance completed", time: "2 days ago", timestamp: "2026-05-26 10:00", unread: false, type: "info" },
    { id: 10, title: "Quality check passed", message: "Weekly quality audit completed", time: "3 days ago", timestamp: "2026-05-25 09:30", unread: false, type: "success" },
  ]);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole") || "super_admin";
      const name = localStorage.getItem("userName") || "Admin User";
      setUserRole(role);
      setUserName(name);
      setProfileData(prev => ({ ...prev, fullName: name }));
    }
  }, []);

  const allMenuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["intake", "qc", "ppic", "admin", "super_admin"] },
    { path: "/dashboard/intake", label: "Incoming Materials", icon: Inbox, roles: ["intake", "admin", "super_admin"] },
    { path: "/dashboard/qc", label: "Quality Control", icon: CheckCircle, roles: ["qc", "admin", "super_admin"] },
    { path: "/dashboard/ppic", label: "Warehouse Routing", icon: Warehouse, roles: ["ppic", "admin", "super_admin"] },
    { path: "/dashboard/delivery", label: "Delivery Queue", icon: Truck, roles: ["delivery", "admin", "super_admin"] },
    { path: "/dashboard/suppliers", label: "Suppliers", icon: Building2, roles: ["admin", "super_admin"] },
    { path: "/dashboard/audit", label: "Audit Logs", icon: FileText, roles: ["admin", "super_admin"] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const currentPath = pathname;
    const hasAccess = allMenuItems.some(
      item => item.path === currentPath && item.roles.includes(userRole)
    );

    if (!hasAccess && menuItems.length > 0 && currentPath.startsWith("/dashboard")) {
      router.replace(menuItems[0].path);
    }
  }, [pathname, userRole, menuItems, router, allMenuItems]);

  const searchResults = [
    { type: "Material", name: "Vanilla Extract", lot: "LOT-2026-001", path: "/dashboard/intake" },
    { type: "Material", name: "Lavender Oil", lot: "LOT-2026-002", path: "/dashboard/qc" },
    { type: "Material", name: "Rose Essential Oil", lot: "LOT-2026-003", path: "/dashboard/ppic" },
    { type: "Page", name: "Quality Control", lot: "", path: "/dashboard/qc" },
    { type: "Page", name: "Warehouse Routing", lot: "", path: "/dashboard/ppic" },
    { type: "Page", name: "Audit Logs", lot: "", path: "/dashboard/audit" },
  ].filter(
    (item) =>
      searchQuery &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lot.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  const notifications = notificationsList.slice(0, 4);
  const unreadCount = notificationsList.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotificationsList(notificationsList.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotificationsList(notificationsList.map(n =>
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const handleSaveProfile = () => {
    alert("Profile updated successfully!");
    setShowProfileModal(false);
  };

  const handleSaveSettings = () => {
    alert("Settings saved successfully!");
    setShowSettingsModal(false);
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      intake: "Intake Staff",
      qc: "QC Inspector",
      ppic: "PPIC Manager",
      admin: "Super Administrator",
      super_admin: "Super Administrator",
    };
    return roleNames[role] || "User";
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-sidebar border-r border-sidebar-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sidebar-foreground">Sima Arome</div>
                <div className="text-xs text-muted-foreground">ERP Lite</div>
              </div>
            </div>
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="lg:hidden w-8 h-8 rounded-lg hover:bg-sidebar-accent transition-colors flex items-center justify-center text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setShowMobileSidebar(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive(item.path)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => {
              localStorage.removeItem("userRole");
              localStorage.removeItem("userName");
              router.push("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-secondary/50 transition-colors"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg lg:text-xl text-foreground truncate">
              {menuItems.find((item) => isActive(item.path))?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden md:block" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search materials, lots..."
                className="pl-9 pr-4 py-2 w-48 lg:w-64 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 top-12 w-full bg-white rounded-xl border border-border shadow-2xl z-50">
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          router.push(result.path);
                          setSearchQuery("");
                          setShowSearchResults(false);
                        }}
                        className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Search className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">{result.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {result.type} {result.lot && `• ${result.lot}`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showSearchResults && searchQuery && searchResults.length === 0 && (
                <div className="absolute left-0 top-12 w-full bg-white rounded-xl border border-border shadow-2xl z-50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-secondary/50 transition-colors"
              >
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-border shadow-2xl z-50">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 border-b border-border hover:bg-background transition-colors cursor-pointer ${
                          notification.unread ? "bg-secondary/20" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
                          {notification.unread && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-border">
                    <button
                      onClick={() => {
                        setShowAllNotificationsModal(true);
                        setShowNotifications(false);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <User className="w-5 h-5 text-white" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl border border-border shadow-2xl z-50">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{userName}</h4>
                        <p className="text-sm text-muted-foreground">{profileData.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors text-foreground"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowSettingsModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors text-foreground"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowHelpModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors text-foreground"
                    >
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Help & Support</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-border">
                    <button
                      onClick={() => {
                        localStorage.removeItem("userRole");
                        localStorage.removeItem("userName");
                        router.push("/login");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg my-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl text-foreground">My Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">{userName}</h3>
                  <p className="text-sm text-muted-foreground">{getRoleDisplayName(userRole)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">Role</label>
                  <input
                    type="text"
                    value={getRoleDisplayName(userRole)}
                    disabled
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">Department</label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl text-foreground">Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-background transition-colors cursor-pointer">
                    <span className="text-foreground">Email notifications</span>
                    <input
                      type="checkbox"
                      checked={settingsData.emailNotifications}
                      onChange={(e) => setSettingsData({ ...settingsData, emailNotifications: e.target.checked })}
                      className="w-5 h-5 text-primary rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-background transition-colors cursor-pointer">
                    <span className="text-foreground">Push notifications</span>
                    <input
                      type="checkbox"
                      checked={settingsData.pushNotifications}
                      onChange={(e) => setSettingsData({ ...settingsData, pushNotifications: e.target.checked })}
                      className="w-5 h-5 text-primary rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-background transition-colors cursor-pointer">
                    <span className="text-foreground">SMS notifications</span>
                    <input
                      type="checkbox"
                      checked={settingsData.smsNotifications}
                      onChange={(e) => setSettingsData({ ...settingsData, smsNotifications: e.target.checked })}
                      className="w-5 h-5 text-primary rounded"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-4">Display</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-2 text-sm text-muted-foreground">Language</label>
                    <select
                      value={settingsData.language}
                      onChange={(e) => setSettingsData({ ...settingsData, language: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>English</option>
                      <option>Indonesian</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-muted-foreground">Time Zone</label>
                    <select
                      value={settingsData.timezone}
                      onChange={(e) => setSettingsData({ ...settingsData, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>Asia/Jakarta (GMT+7)</option>
                      <option>America/New_York (GMT-5)</option>
                      <option>Europe/London (GMT+0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-4">Security</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowChangePasswordModal(true);
                      setShowSettingsModal(false);
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground text-left"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setShow2FAModal(true);
                      setShowSettingsModal(false);
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground text-left"
                  >
                    Two-Factor Authentication
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl text-foreground">Help & Support</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-4">Quick Links</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => alert("Opening User Guide...")}
                    className="p-4 rounded-lg border border-border hover:bg-background transition-colors text-left"
                  >
                    <h4 className="font-medium text-foreground mb-1">User Guide</h4>
                    <p className="text-sm text-muted-foreground">Learn how to use the system</p>
                  </button>
                  <button
                    onClick={() => alert("Opening Video Tutorials...")}
                    className="p-4 rounded-lg border border-border hover:bg-background transition-colors text-left"
                  >
                    <h4 className="font-medium text-foreground mb-1">Video Tutorials</h4>
                    <p className="text-sm text-muted-foreground">Watch step-by-step guides</p>
                  </button>
                  <button
                    onClick={() => alert("Opening FAQ...")}
                    className="p-4 rounded-lg border border-border hover:bg-background transition-colors text-left"
                  >
                    <h4 className="font-medium text-foreground mb-1">FAQ</h4>
                    <p className="text-sm text-muted-foreground">Frequently asked questions</p>
                  </button>
                  <button
                    onClick={() => alert("Opening API Documentation...")}
                    className="p-4 rounded-lg border border-border hover:bg-background transition-colors text-left"
                  >
                    <h4 className="font-medium text-foreground mb-1">API Documentation</h4>
                    <p className="text-sm text-muted-foreground">For developers</p>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-4">Contact Support</h3>
                <div className="space-y-3 p-4 rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="text-foreground">support@simaarome.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">📞</span>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-foreground">+62 21 1234 5678</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-4">System Information</h3>
                <div className="p-4 rounded-lg bg-background space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="text-foreground">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="text-foreground">May 28, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License</span>
                    <span className="text-foreground">Enterprise</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAllNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl text-foreground">All Notifications</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowAllNotificationsModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-border">
                {notificationsList.map((notification) => {
                  const getNotificationIcon = (type: string) => {
                    switch (type) {
                      case "success": return "✅";
                      case "warning": return "⚠️";
                      case "info": return "ℹ️";
                      default: return "📢";
                    }
                  };

                  const getNotificationColor = (type: string) => {
                    switch (type) {
                      case "success": return "bg-success/10 text-success";
                      case "warning": return "bg-warning/10 text-warning";
                      case "info": return "bg-primary/10 text-primary";
                      default: return "bg-muted text-muted-foreground";
                    }
                  };

                  return (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 hover:bg-background transition-colors cursor-pointer ${
                        notification.unread ? "bg-secondary/20" : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-foreground">{notification.title}</h4>
                            {notification.unread && (
                              <span className="w-2 h-2 bg-primary rounded-full mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{notification.time}</span>
                            <span>•</span>
                            <span>{notification.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-border flex gap-3 justify-between">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark all as read
              </button>
              <button
                onClick={() => setShowAllNotificationsModal(false)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl text-foreground">Change Password</h2>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="p-3 rounded-lg bg-secondary/20 border border-secondary">
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Password changed successfully!");
                  setShowChangePasswordModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl text-foreground">Two-Factor Authentication</h2>
              <button
                onClick={() => setShow2FAModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-background rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <span className="text-4xl">🔐</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background border border-border">
                <p className="text-xs text-muted-foreground mb-1">Manual Entry Code:</p>
                <p className="font-mono text-sm text-foreground">JBSW Y3DP EHPK 3PXP</p>
              </div>
              <div>
                <label className="block mb-2 text-sm text-muted-foreground">Verification Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => setShow2FAModal(false)}
                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Two-Factor Authentication enabled successfully!");
                  setShow2FAModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
