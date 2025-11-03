import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import routes from '../routes';
import Layout from '../components/Layout';
import Snack from '../components/Notification/Snack';
import { isUserAuthenticated } from '../helpers/authUtils';

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search, location.hash]);
  return null;
}

function RequireAuth({ children }) {
  return isUserAuthenticated() ? children : <Navigate to="/logout" replace />;
}

export default function MainRouter() {
  const BASENAME = '/bulksms';
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const useBasename = path.startsWith(BASENAME);

  return (
    <BrowserRouter basename={useBasename ? BASENAME : undefined}>
      <ScrollToTop />
      <Routes>
        {routes.map((route, idx) => {
          const Element = route.component;
          const elementNode = route.ispublic ? (
            <Element />
          ) : (
            <RequireAuth>
              <Layout>
                <Element />
              </Layout>
            </RequireAuth>
          );
          return <Route key={idx} path={route.path} element={elementNode} />;
        })}
        {/* Fallback to root if no route matches */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Snack />
    </BrowserRouter>
  );
}
