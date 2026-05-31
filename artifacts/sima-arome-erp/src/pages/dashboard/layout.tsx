import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Package, LayoutDashboard, Inbox, CheckCircle, Warehouse, FileText, LogOut, Search, Bell, User, Settings, HelpCircle, X, Menu, Lock, Truck, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  
  const userRole = user?.role?.toLowerCase() || "super_admin";
  const userName = user?.username || "Admin User";
  
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [profileData, setProfileData] = useState({
    fullName: userName,
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

  const allMenuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["intake", "qc", "ppic", "admin", "super_admin"] },
    { path: "/dashboard/intake", label: "Incoming Materials", icon: Inbox, roles: ["intake", "admin", "super_admin", "intake_staff"] },
    { path: "/dashboard/qc", label: "Quality Control", icon: CheckCircle, roles: ["qc", "admin", "super_admin", "qc_inspector"] },
    { path: "/dashboard/ppic", label: "Warehouse Routing", icon: Warehouse, roles: ["ppic", "admin", "super_admin", "ppic_manager"] },
    { path: "/dashboard/delivery", label: "Delivery Queue", icon: Truck, roles: ["delivery", "admin", "super_admin", "delivery_staff"] },
    { path: "/dashboard/suppliers", label: "Suppliers", icon: Building2, roles: ["admin", "super_admin"] },
    { path: "/dashboard/audit", label: "Audit Logs", icon: FileText, roles: ["admin", "super_admin"] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setShowUserMenu(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSearchResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = [
    { type: "Material", name: "Vanilla Extract", lot: "LOT-2026-001", path: "/dashboard/intake" },
    { type: "Material", name: "Lavender Oil", lot: "LOT-2026-002", path: "/dashboard/qc" },
    { type: "Material", name: "Rose Essential Oil", lot: "LOT-2026-003", path: "/dashboard/ppic" },
    { type: "Page", name: "Quality Control", lot: "", path: "/dashboard/qc" },
    { type: "Page", name: "Warehouse Routing", lot: "", path: "/dashboard/ppic" },
    { type: "Page", name: "Audit Logs", lot: "", path: "/dashboard/audit" },
  ].filter(
    (item) => searchQuery && (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.lot.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const notifications = notificationsList.slice(0, 4);
  const unreadCount = notificationsList.filter(n => n.unread).length;

  const markAllAsRead = () => setNotificationsList(notificationsList.map(n => ({ ...n, unread: false })));
  const markAsRead = (id: number) => setNotificationsList(notificationsList.map(n => n.id === id ? { ...n, unread: false } : n));

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      intake: "Intake Staff",
      intake_staff: "Intake Staff",
      qc: "QC Inspector",
      qc_inspector: "QC Inspector",
      ppic: "PPIC Manager",
      ppic_manager: "PPIC Manager",
      admin: "Super Administrator",
      super_admin: "Super Administrator",
      delivery_staff: "Delivery Staff",
    };
    return roleNames[role] || "User";
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return location === "/dashboard";
    return location.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowMobileSidebar(false)} />
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
            <button onClick={() => setShowMobileSidebar(false)} className="lg:hidden w-8 h-8 rounded-lg hover:bg-sidebar-accent transition-colors flex items-center justify-center text-sidebar-foreground">
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
                onClick={() => { navigate(item.path); setShowMobileSidebar(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive(item.path) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowMobileSidebar(true)} className="lg:hidden w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-secondary/50 transition-colors">
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
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(e.target.value.length > 0); }}
                placeholder="Search materials, lots..."
                className="pl-9 pr-4 py-2 w-48 lg:w-64 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 top-12 w-full bg-white rounded-xl border border-border shadow-2xl z-50">
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button key={index} onClick={() => { navigate(result.path); setSearchQuery(""); setShowSearchResults(false); }} className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors text-left">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Search className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">{result.name}</div>
                          <div className="text-xs text-muted-foreground">{result.type} {result.lot && `• ${result.lot}`}</div>
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
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-secondary/50 transition-colors">
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-border shadow-2xl z-50">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} unread</span>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} onClick={() => markAsRead(notification.id)} className={`p-4 border-b border-border hover:bg-background transition-colors cursor-pointer ${notification.unread ? "bg-secondary/20" : ""}`}>
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
                          {notification.unread && <span className="w-2 h-2 bg-primary rounded-full"></span>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-border">
                    <button onClick={() => { setShowAllNotificationsModal(true); setShowNotifications(false); }} className="text-sm text-primary hover:underline">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
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
                    <button onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors text-foreground">
                      <User className="w-4 h-4 text-muted-foreground" /><span className="text-sm">My Profile</span>
                    </button>
                    <button onClick={() => { setShowSettingsModal(true); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors text-foreground">
                      <Settings className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Settings</span>
                    </button>
                    <button onClick={() => { setShowHelpModal(true); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors text-foreground">
                      <HelpCircle className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Help & Support</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-border">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive">
                      <LogOut className="w-4 h-4" /><span className="text-sm">Logout</span>
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg my-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl text-foreground">My Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground">✕</button>
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
                  <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">Email Address</label>
                  <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">Role</label>
                  <input type="text" value={getRoleDisplayName(userRole)} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50 transition-colors font-medium text-sm">Cancel</button>
              <button onClick={() => { alert("Profile updated!"); setShowProfileModal(false); }} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg my-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl text-foreground">Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-4">Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications' },
                    { key: 'pushNotifications', label: 'Push Notifications' },
                    { key: 'smsNotifications', label: 'SMS Notifications' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{label}</span>
                      <button
                        onClick={() => setSettingsData(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                        className={`w-10 h-6 rounded-full transition-colors ${settingsData[key as keyof typeof settingsData] ? 'bg-primary' : 'bg-switch-background'}`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${settingsData[key as keyof typeof settingsData] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-slate-50 transition-colors font-medium text-sm">Cancel</button>
              <button onClick={() => { alert("Settings saved!"); setShowSettingsModal(false); }} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm">Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg my-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl text-foreground">Help & Support</h2>
              <button onClick={() => setShowHelpModal(false)} className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <h3 className="font-medium text-foreground mb-2">Getting Started</h3>
                <p className="text-sm text-muted-foreground">Use the sidebar to navigate between modules. Each role has access to specific features.</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                <h3 className="font-medium text-foreground mb-2">Contact Support</h3>
                <p className="text-sm text-muted-foreground">Email: support@simaarome.com</p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end">
              <button onClick={() => setShowHelpModal(false)} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* All Notifications Modal */}
      {showAllNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-2xl my-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl text-foreground">All Notifications</h2>
                {unreadCount > 0 && <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread notifications</p>}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <button onClick={markAllAsRead} className="text-sm text-primary hover:underline">Mark all as read</button>}
                <button onClick={() => setShowAllNotificationsModal(false)} className="w-8 h-8 rounded-lg hover:bg-background transition-colors flex items-center justify-center text-muted-foreground">✕</button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notificationsList.map((notification) => (
                <div key={notification.id} onClick={() => markAsRead(notification.id)} className={`p-4 border-b border-border hover:bg-background transition-colors cursor-pointer ${notification.unread ? "bg-secondary/20" : ""}`}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.timestamp}</span>
                      {notification.unread && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setShowAllNotificationsModal(false)} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
