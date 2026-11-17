import { lazy } from 'react';
import { Navigate } from 'react-router';
import type { RouteObject } from 'react-router';
import { HomePublicRoot } from './layout/HomePublicRoot';

const HomeLayout = lazy(() =>
  import('./layout/HomeLayout').then((m) => ({ default: m.HomeLayout }))
);
const UserLayout = lazy(() =>
  import('./layout/UserLayout').then((m) => ({ default: m.UserLayout }))
);
const UserProfileLayout = lazy(() =>
  import('./layout/UserProfileLayout').then((m) => ({ default: m.UserProfileLayout }))
);
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const FindJobsPage = lazy(() =>
  import('./pages/FindJobsPage').then((m) => ({ default: m.FindJobsPage }))
);
const MyApplicationsPage = lazy(() =>
  import('./pages/MyApplicationsPage').then((m) => ({ default: m.MyApplicationsPage }))
);
const MyProfilePage = lazy(() =>
  import('./pages/MyProfilePage').then((m) => ({ default: m.MyProfilePage }))
);
const MyDocumentsPage = lazy(() =>
  import('./pages/MyDocumentsPage').then((m) => ({ default: m.MyDocumentsPage }))
);
const AccountSettingsPage = lazy(() =>
  import('./pages/AccountSettingsPage').then((m) => ({ default: m.AccountSettingsPage }))
);
const MyResumePage = lazy(() =>
  import('./pages/MyResumePage').then((m) => ({ default: m.MyResumePage }))
);
const ResumePreviewPage = lazy(() =>
  import('./pages/ResumePreviewPage').then((m) => ({ default: m.ResumePreviewPage }))
);
const RecruiterLayout = lazy(() =>
  import('./layout/RecruiterLayout').then((m) => ({ default: m.RecruiterLayout }))
);
const RecruiterHomePage = lazy(() =>
  import('./pages/RecruiterHomePage').then((m) => ({ default: m.RecruiterHomePage }))
);
const RecruiterApplicationsPage = lazy(() =>
  import('./pages/RecruiterApplicationsPage').then((m) => ({
    default: m.RecruiterApplicationsPage
  }))
);
const RecruiterMarketJobsPage = lazy(() =>
  import('./pages/RecruiterMarketJobsPage').then((m) => ({
    default: m.RecruiterMarketJobsPage
  }))
);
const RecruiterOrganizationPage = lazy(() =>
  import('./pages/RecruiterOrganizationPage').then((m) => ({
    default: m.RecruiterOrganizationPage
  }))
);
const RecruiterAccountSettingsPage = lazy(() =>
  import('./pages/RecruiterAccountSettingsPage').then((m) => ({
    default: m.RecruiterAccountSettingsPage
  }))
);
const RecruiterPostJobPage = lazy(() =>
  import('./pages/RecruiterPostJobPage').then((m) => ({ default: m.RecruiterPostJobPage }))
);

export const homePublicRoutes: RouteObject[] = [
  {
    element: <HomePublicRoot />,
    children: [
      {
        element: <HomeLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'home', element: <HomePage /> }
        ]
      },
      {
        element: <UserLayout />,
        children: [
          { path: 'user/onboarding', element: <Navigate to="/user" replace /> },
          { path: 'user', element: <FindJobsPage /> },
          {
            // Every profile-side section shares one sidebar, mounted once by this layout route.
            element: <UserProfileLayout />,
            children: [
              { path: 'user/profile', element: <MyProfilePage /> },
              { path: 'user/applications', element: <MyApplicationsPage /> },
              { path: 'user/resume', element: <MyResumePage /> },
              { path: 'user/resume/preview', element: <ResumePreviewPage /> },
              { path: 'user/documents', element: <MyDocumentsPage /> },
              { path: 'user/settings', element: <AccountSettingsPage /> }
            ]
          }
        ]
      },
      {
        element: <RecruiterLayout />,
        children: [
          { path: 'recruiter', element: <RecruiterHomePage /> },
          { path: 'recruiter/organization', element: <RecruiterOrganizationPage /> },
          { path: 'recruiter/account-settings', element: <RecruiterAccountSettingsPage /> },
          { path: 'recruiter/post-job', element: <RecruiterPostJobPage /> },
          { path: 'recruiter/applications', element: <RecruiterApplicationsPage /> },
          {
            path: 'recruiter/my-applications',
            element: <Navigate to="/recruiter/applications" replace />
          },
          { path: 'recruiter/market-jobs', element: <RecruiterMarketJobsPage /> }
        ]
      }
    ]
  }
];
