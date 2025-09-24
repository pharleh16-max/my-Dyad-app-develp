import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type UserRole = 'employee' | 'admin';

interface NavigationState {
  activeTab: string;
  sideMenuOpen: boolean;
  userRole: UserRole;
}

export function useNavigation(userRole: UserRole = 'employee') {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState<NavigationState>({
    activeTab: getActiveTabFromPath(location.pathname, userRole),
    sideMenuOpen: false,
    userRole,
  });

  // Update activeTab when location changes
  useEffect(() => {
    setState(prev => ({ ...prev, activeTab: getActiveTabFromPath(location.pathname, userRole) }));
  }, [location.pathname, userRole]);

  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const toggleSideMenu = useCallback(() => {
    setState(prev => ({ ...prev, sideMenuOpen: !prev.sideMenuOpen }));
  }, []);

  const closeSideMenu = useCallback(() => {
    setState(prev => ({ ...prev, sideMenuOpen: false }));
  }, []);

  const navigateToTab = useCallback((tab: string) => {
    setActiveTab(tab);
    
    // Map tab IDs to routes based on user role
    const routes = userRole === 'admin' ? {
      dashboard: '/admin/dashboard',
      employees: '/admin/employees',
      monitoring: '/admin/attendance',
      reports: '/admin/reports',
      'employee-approval': '/admin/employee-approval', // New route mapping
      locations: '/admin/locations',
      system: '/admin/settings',
      users: '/admin/users',
      data: '/admin/export',
      security: '/admin/security',
      help: '/admin/help',
    } : {
      dashboard: '/dashboard',
      attendance: '/check-in', // Changed from /attendance to /check-in
      history: '/history',
      profile: '/profile',
    };

    const route = routes[tab as keyof typeof routes];
    if (route) {
      navigate(route);
    }
  }, [navigate, userRole, setActiveTab]);

  const navigateToPath = useCallback((path: string) => {
    navigate(path);
    const tab = getActiveTabFromPath(path, userRole);
    setActiveTab(tab);
    closeSideMenu();
  }, [navigate, userRole, setActiveTab, closeSideMenu]);

  return {
    activeTab: state.activeTab,
    sideMenuOpen: state.sideMenuOpen,
    userRole: state.userRole,
    setActiveTab,
    toggleSideMenu,
    closeSideMenu,
    navigateToTab,
    navigateToPath,
  };
}

function getActiveTabFromPath(pathname: string, userRole: UserRole): string {
  if (userRole === 'admin') {
    if (pathname.includes('/admin/employees')) return 'employees';
    if (pathname.includes('/admin/attendance')) return 'monitoring';
    if (pathname.includes('/admin/reports')) return 'reports';
    if (pathname.includes('/admin/employee-approval')) return 'employee-approval'; // New path check
    if (pathname.includes('/admin/locations')) return 'locations';
    if (pathname.includes('/admin/settings')) return 'system';
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/export')) return 'data';
    if (pathname.includes('/admin/security')) return 'security';
    if (pathname.includes('/admin/help')) return 'help';
    return 'dashboard'; // Default for admin
  } else {
    if (pathname.includes('/check-in') || pathname.includes('/check-out')) return 'attendance';
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/profile')) return 'profile';
    return 'dashboard'; // Default for employee
  }
}