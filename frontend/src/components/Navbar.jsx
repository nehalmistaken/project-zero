import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ScanLine,
  BarChart3,
  Monitor,
  Plus,
  Building2,
  FileText,
  SearchCheck,
  LayoutDashboard,
  CircleUserRound,
  LogOut,
  Bell,
  CheckCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Flame,
  ShieldAlert,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { citizenProfile } from '../services/citizenAccounts';
import { apiService } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = citizenProfile();
  const adminToken = localStorage.getItem('admin_token');
  const citizenToken = localStorage.getItem('citizen_token');
  const activeToken = adminToken || citizenToken;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const [markingReadId, setMarkingReadId] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setNotifications([]);
    setUnreadCount(0);
    sessionStorage.removeItem('project_profile');
    sessionStorage.removeItem('project_guest');
    sessionStorage.removeItem('project_mode');
    navigate('/login');
  };

  // Human-friendly relative timestamp helper
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 0) return 'Just now';
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Fetch notifications wrapped in useCallback
  const fetchNotifications = useCallback(async () => {
    if (!activeToken) return;
    try {
      setLoading(true);
      const response = await apiService.getNotifications();
      if (response && response.status === 'success') {
        setNotifications(response.notifications || []);
        setUnreadCount(Math.max(0, response.unread_count || 0));
      }
    } catch {
      // Background fetch errors ignored gracefully
    } finally {
      setLoading(false);
    }
  }, [activeToken]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications, location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    if (markingReadId === id) return;
    try {
      setMarkingReadId(id);
      await apiService.markNotificationAsRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setMarkingReadId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAllRead) return;
    try {
      setMarkingAllRead(true);
      await apiService.markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = (notif) => {
    setShowDropdown(false);
    if (!notif.is_read) {
      apiService.markNotificationAsRead(notif.id).catch(() => {});
    }

    if (notif.grievance_id) {
      if (adminToken) {
        navigate(`/admin/dashboard?tab=complaints&search=${encodeURIComponent(notif.grievance_id)}`);
      } else {
        navigate(`/history?id=${encodeURIComponent(notif.grievance_id)}`);
      }
    }
  };


  const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';
  const isActive = (path) => path.startsWith('/activity') ? location.pathname === '/activity' && (new URLSearchParams(location.search).get('filter') || 'all') === (new URLSearchParams(path.split('?')[1] || '').get('filter') || 'all') : path.includes('?tab=')
    ? location.pathname === '/admin/dashboard' && currentTab === path.split('?tab=')[1]
    : location.pathname === path;
  const officerLinks = [
    ['/admin/dashboard?tab=dashboard', 'Performance', LayoutDashboard],
    ['/admin/dashboard?tab=complaints', 'Grievance queue', FileText],
    ['/admin/dashboard?tab=departments', 'Departments', Building2],
    ['/admin/dashboard?tab=ai_analysis', 'AI intelligence', ScanLine],
    ['/admin/dashboard?tab=reports', 'Reports & analytics', BarChart3],
    ['/admin/dashboard?tab=users', 'Officer accounts', CircleUserRound],
    ['/admin/dashboard?tab=settings', 'Settings', ShieldAlert],
  ];
  const citizenLinks = [['/activity', 'Service activity', BarChart3], ['/activity?filter=high', 'High priority', Flame], ['/activity?filter=pending', 'Pending cases', Clock], ['/activity?filter=resolved', 'Resolved cases', CheckCircle2], ['/submit', 'New grievance', FileText], ['/history', 'Track & browse', SearchCheck]];
  const links = adminToken ? officerLinks : citizenLinks;
  useEffect(() => { setShowDropdown(false); }, [location.pathname, location.search]);
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') setShowDropdown(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  // Type-specific icons & visual priority styling
  const getNotifIconAndStyle = (type, title = '') => {
    const titleUpper = title.toUpperCase();

    if (type === 'SLA_BREACHED' || titleUpper.includes('SLA BREACH')) {
      return {
        icon: <Clock size={16} className="text-rose-600 shrink-0" />,
        accentClass: 'border-l-rose-500 bg-rose-50/70',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        label: 'SLA Breach',
      };
    }
    if (type === 'COMPLAINT_ESCALATED' || titleUpper.includes('ESCALATED')) {
      return {
        icon: <Flame size={16} className="text-amber-600 shrink-0" />,
        accentClass: 'border-l-amber-500 bg-amber-50/70',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        label: 'Escalated',
      };
    }
    if (type === 'DUPLICATE_DETECTED' || titleUpper.includes('DUPLICATE')) {
      return {
        icon: <Copy size={16} className="text-purple-600 shrink-0" />,
        accentClass: 'border-l-purple-500 bg-purple-50/70',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Duplicate',
      };
    }
    if (type === 'COMPLAINT_RESOLVED' || titleUpper.includes('RESOLVED')) {
      return {
        icon: <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />,
        accentClass: 'border-l-emerald-500 bg-emerald-50/70',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        label: 'Resolved',
      };
    }
    if (type === 'COMPLAINT_REOPENED' || titleUpper.includes('REOPENED')) {
      return {
        icon: <ShieldAlert size={16} className="text-rose-600 shrink-0" />,
        accentClass: 'border-l-rose-500 bg-rose-50/70',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        label: 'Reopened',
      };
    }
    if (type === 'SLA_APPROACHING' || titleUpper.includes('NEAR DEADLINE')) {
      return {
        icon: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
        accentClass: 'border-l-amber-500 bg-amber-50/70',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        label: 'Near Deadline',
      };
    }

    return {
      icon: <Info size={16} className="text-[#31624e] shrink-0" />,
      accentClass: 'border-l-[#31624e] bg-blue-50/50',
      badgeClass: 'bg-blue-100 text-[#31624e] border-blue-200',
      label: 'Update',
    };
  };

  return (
    <>
      <a href="#content" className="cf-skip">Skip to workspace</a>
      <aside className="cf-sidebar">
        <Link to="/submit" className="cf-brand"><img src="/india-emblem.svg" alt="Emblem of India" className="zero-india-emblem"/><div>PROJECT ZERO<small>Independent civic demo</small></div></Link>
        <Link to="/activity?filter=all" className="cf-workspace"><BarChart3 size={21}/><div>Service activity<small>Explore the live demo →</small></div></Link>
        <p className="cf-nav-label">{adminToken ? 'OPERATIONS' : 'CITIZEN SERVICES'}</p>
        <nav aria-label="Main navigation" className="cf-nav">
          {links.map(([path,label,Icon]) => <Link key={path} to={path} className={isActive(path) ? 'active' : ''} aria-current={isActive(path) ? 'page' : undefined}><Icon size={18} strokeWidth={1.6}/>{label}</Link>)}
        </nav>
        <div className="cf-sidebar-bottom">
          <div className="cf-local-note"><Monitor size={18}/><div>Public service desk<small>Grievance intake, routing<br/>and resolution tracking</small></div></div>
          <Link to="/technology" className="cf-project-link"><Info size={18}/>About Project</Link>
          {adminToken && <Link to="/submit" className="cf-project-link"><Plus size={18}/>Register a grievance</Link>}
          <div className="zero-sidebar-actions">          {activeToken && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  if (!showDropdown) fetchNotifications();
                }}
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-[#31624e] transition focus:outline-none cursor-pointer"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={showDropdown}
                aria-haspopup="true"
                id="notification-bell"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Enhanced Notification Dropdown Panel */}
              {showDropdown && (
                <div className="zero-notifications absolute left-0 bottom-full mb-2 w-[calc(100vw-2rem)] sm:w-96 rounded-xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-[#31624e]" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 border border-rose-200">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#31624e] hover:text-[#244d3d] hover:underline cursor-pointer"
                      >
                        <CheckCheck size={14} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* List Container */}
                  <div className="max-h-[75vh] sm:max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {loading && notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                        <RefreshCw size={18} className="animate-spin text-[#31624e]" />
                        <span>Loading notification center...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                        <AlertCircle size={24} className="text-slate-300" />
                        <span className="font-semibold text-slate-700">No notifications available</span>
                        <p className="text-[11px] text-slate-400">Updates regarding your complaints will appear here.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const styleInfo = getNotifIconAndStyle(notif.notification_type, notif.title);
                        const isUnread = !notif.is_read;

                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 flex items-start gap-3 border-l-4 transition cursor-pointer hover:bg-slate-50 ${
                              isUnread ? styleInfo.accentClass : 'border-l-transparent bg-white opacity-85'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">{styleInfo.icon}</div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${styleInfo.badgeClass}`}>
                                  {styleInfo.label}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                  {formatTimeAgo(notif.created_at)}
                                </span>
                              </div>

                              <h4 className={`text-xs ${isUnread ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700'} truncate`}>
                                {notif.title}
                              </h4>

                              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>

                              {notif.grievance_id && (
                                <div className="mt-1.5 flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-extrabold text-[#31624e] bg-blue-100/70 px-1.5 py-0.5 rounded">
                                    {notif.grievance_id}
                                  </span>
                                  <span className="text-[10px] text-[#31624e] font-bold hover:underline">View details →</span>
                                </div>
                              )}
                            </div>

                            {isUnread && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(e, notif.id)}
                                className="mt-0.5 p-1 text-slate-400 hover:text-[#31624e] hover:bg-blue-100/50 rounded transition"
                                title="Mark as read"
                                aria-label="Mark notification as read"
                              >
                                <CheckCheck size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


<button type="button" className="zero-sidebar-exit" onClick={handleLogout}><LogOut size={17}/>{adminToken?'Sign out':'Exit workspace'}</button></div><div className="cf-profile"><span className="cf-avatar">{adminToken ? 'AD' : 'CT'}</span><div>{adminToken ? 'Administrator' : profile?.name || 'Guest workspace'}<small>{adminToken ? 'Officer access' : 'Report & track'}</small></div></div>
        </div>
      </aside>

    </>
  );
}
