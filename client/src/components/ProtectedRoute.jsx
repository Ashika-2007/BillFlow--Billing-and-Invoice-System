import React from 'react';
import {Navigate,useLocation} from 'react-router-dom';import {useAuth} from '../context/AuthContext';import LoadingSpinner from './LoadingSpinner';
export default function ProtectedRoute({children,roles}){const {user,loading}=useAuth();const loc=useLocation();if(loading)return <LoadingSpinner full/>;if(!user)return <Navigate to="/login" state={{from:loc}} replace/>;if(roles&&!roles.includes(user.role))return <Navigate to="/dashboard" replace/>;return children}
