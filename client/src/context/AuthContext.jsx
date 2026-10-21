import React from 'react';
import {createContext,useContext,useEffect,useState} from 'react';import api from '../services/api';
const AuthContext=createContext(null);export const AuthProvider=({children})=>{const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
 const load=async()=>{const t=localStorage.getItem('billing_token');if(!t){setLoading(false);return}try{const r=await api.get('/auth/me');setUser(r.data.data.user)}catch{localStorage.removeItem('billing_token');setUser(null)}finally{setLoading(false)}};
 useEffect(()=>{load();const h=()=>{setUser(null);setLoading(false)};window.addEventListener('billing:logout',h);return()=>window.removeEventListener('billing:logout',h)},[]);
 const login=async(form)=>{const r=await api.post('/auth/login',form);localStorage.setItem('billing_token',r.data.data.token);setUser(r.data.data.user);return r.data.data.user};
 const register=async(form)=>{const r=await api.post('/auth/register',form);localStorage.setItem('billing_token',r.data.data.token);setUser(r.data.data.user);return r.data.data.user};
 const logout=()=>{localStorage.removeItem('billing_token');setUser(null)};return <AuthContext.Provider value={{user,loading,login,register,logout}}>{children}</AuthContext.Provider>};export const useAuth=()=>useContext(AuthContext);
