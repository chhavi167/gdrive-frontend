import {
    createRootRoute,
    createRoute,
    createRouter,
    Outlet,redirect
  } from '@tanstack/react-router';
  import Login from './pages/Login';
  import Register from './pages/Register';
  import Dashboard from './pages/Dashboard';
  import { isAuthenticated } from './api/auth';


  
  const rootRoute = createRootRoute({
    component: Outlet,
  });
  
  const loginRoute = createRoute({
    path: '/',
    getParentRoute: () => rootRoute,
    component: Login,
  });
  
  const registerRoute = createRoute({
    path: '/register',
    getParentRoute: () => rootRoute,
    component: Register,
  });
  
  const dashboardRoute = createRoute({
    path: '/dashboard',
    getParentRoute: () => rootRoute,
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({to : '/'  });
      }
    },
    component: Dashboard,
  });
  
  const routeTree = rootRoute.addChildren([
    loginRoute,
    registerRoute,
    dashboardRoute,
  ]);
  
  export const router = createRouter({
    routeTree,
  });
  
  declare module '@tanstack/react-router' {
    interface Register {
      router: typeof router;
    }
  }
  