import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Post from './Post';
import ExpandedPost from './ExpandedPost';
import ExpandedImage from './ExpandedImage';
import EditPost from './EditPost';
import Profile from './Profile';
import EditProfile from './EditProfile';
import { AuthProvider } from './AuthContext';
import NotFound from './NotFound';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const basename = "/CodeIn";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: '/users/:id/edit',
        element: <EditProfile />
      }, 
      {
        path: '/users/:id',
        element: <Profile />
      },    
      {
        path: '/post',
        element: <Post />
      },
      {
        path: '/posts/:id/edit',
        element: <EditPost />
      },
      {
        path: '/posts/:id',
        element: <ExpandedPost />,
        children: [
          {
            path: 'image/:imageId',
            element: <ExpandedImage />
          }
        ]
      },
      {
        path:'*',
        element: <NotFound />
      }
    ]
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} basename="/CodeIn" />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
