import { useState, useCallback } from 'react';
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
    } : {
      dashboard: '/dashboard',
      attendance: '/attendance',
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
    return 'dashboard';
  } else {
    if (pathname.includes('/attendance')) return 'attendance';
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/profile')) return 'profile';
    return 'dashboard';
  }
}