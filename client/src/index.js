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
import LikedPosts from './LikedPosts';
import Settings from './Settings';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider } from './ThemeContext';

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
        path: '/liked',
        element: <LikedPosts />
      },
      {
        path: '/users/:id/edit',
        element: <EditProfile />
      }, 
      {
        path: '/users/:profileId',
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
        path: '/settings',
        element: <Settings />
      },
      {
        path: '/posts/:postId',
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
], {
  basename: basename
}
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
          <RouterProvider router={router}/>
        </ThemeProvider>   
      </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
