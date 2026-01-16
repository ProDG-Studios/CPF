import { useState, useRef } from 'react';
import { Bell, User, Search, X, FileText, CheckCircle, Clock, AlertCircle, CreditCard, Users, RotateCcw, Download, Upload } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { useData, ActivityLog, Notification } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

const activityIcons = {
  bill_verified: CheckCircle,
  bill_processed: Clock,
  bill_paid: CreditCard,
  bill_rejected: AlertCircle,
  step_completed: FileText,
  payment_made: CreditCard,
  supplier_verified: Users,
};

const activityColors = {
  bill_verified: 'text-success',
  bill_processed: 'text-primary',
  bill_paid: 'text-accent',
  bill_rejected: 'text-destructive',
  step_completed: 'text-success',
  payment_made: 'text-success',
  supplier_verified: 'text-success',
};

const TopBar = ({ title, subtitle }: TopBarProps) => {
  const { filters, setFilter, resetFilters, activeFilterCount } = useFilters();
  const { notifications, activityLog, markNotificationRead, clearNotifications, resetData } = useData();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    markNotificationRead(notification.id);
  };

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 h-14">
        <div>
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          {showSearch ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Search..."
                value={filters.searchTerm}
                onChange={(e) => setFilter('searchTerm', e.target.value)}
                className="w-48 px-3 py-1.5 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                autoFocus
              />
              <button
                onClick={() => { setShowSearch(false); setFilter('searchTerm', ''); }}
                className="p-1.5 hover:bg-secondary rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Filter Badge */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium hover:bg-accent/15 transition-colors"
            >
              {activeFilterCount} filters
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Activity Log */}
          <div className="relative">
            <button 
              onClick={() => { setShowActivity(!showActivity); setShowNotifications(false); }}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Activity Log"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              {activityLog.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-success rounded-full" />
              )}
            </button>

            {/* Activity Dropdown */}
            {showActivity && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Activity Log</h3>
                  <span className="text-xs text-muted-foreground">{activityLog.length} actions</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {activityLog.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No activity yet
                    </div>
                  ) : (
                    activityLog.slice(0, 20).map((activity) => {
                      const Icon = activityIcons[activity.type] || FileText;
                      const colorClass = activityColors[activity.type] || 'text-muted-foreground';
                      return (
                        <div key={activity.id} className="p-3 hover:bg-muted/30">
                          <div className="flex items-start gap-3">
                            <div className={cn("p-1.5 rounded-md bg-secondary", colorClass)}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{activity.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                            {activity.amount && (
                              <span className="text-xs font-medium text-accent">
                                KES {(activity.amount / 1000000).toFixed(1)}M
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowActivity(false); }}
              className="relative p-2 hover:bg-secondary rounded-md transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-accent text-accent-foreground text-xs font-medium rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 15).map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "w-full p-3 text-left hover:bg-muted/30 transition-colors",
                          !notification.read && "bg-accent/5"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-2 h-2 mt-1.5 rounded-full shrink-0",
                            notification.type === 'success' && "bg-success",
                            notification.type === 'info' && "bg-primary",
                            notification.type === 'warning' && "bg-warning",
                            notification.type === 'error' && "bg-destructive",
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm", !notification.read && "font-medium")}>{notification.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset Data Button */}
          <button
            onClick={resetData}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            title="Reset all data"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground hidden md:block">Admin</span>
          </div>
        </div>
      </div>

      {/* Click outside handler */}
      {(showNotifications || showActivity) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => { setShowNotifications(false); setShowActivity(false); }} 
        />
      )}
    </header>
  );
};

export default TopBar;
