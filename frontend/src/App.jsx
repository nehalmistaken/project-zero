import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
const SubmitComplaint = lazy(() => import('./pages/SubmitComplaint'));
const History = lazy(() => import('./pages/History'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CitizenAccount = lazy(() => import('./pages/CitizenAccount'));
const ActivityBoard = lazy(() => import('./pages/ActivityBoard'));
const Technology = lazy(() => import('./pages/Technology'));
function ScrollToTop(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[pathname]);return null;}
function Workspace() {
  const location = useLocation();
  const signedIn = localStorage.getItem('admin_token') || sessionStorage.getItem('project_guest');
  if (!signedIn) return <Navigate to="/login" replace state={{from:location.pathname+location.search}}/>;
  return <div className="cf-app"><Navbar/><main id="content" tabIndex="-1" className="cf-content">{sessionStorage.getItem('project_mode') === 'local' && <div className="project-local-note"><span className="project-dot"/>Local workspace <span>Saved in this browser · Not sent to a public authority</span></div>}<Outlet/></main><Footer/></div>;
}
export default function App(){return <BrowserRouter><ScrollToTop/><Suspense fallback={<div className="project-loading" role="status">Opening workspace…</div>}><Routes>
<Route path="/" element={<Navigate to="/login" replace/>}/><Route path="/account" element={<CitizenAccount/>}/><Route path="/login" element={<Login/>}/><Route path="/admin/login" element={<Navigate to="/login" replace/>}/>
<Route element={<Workspace/>}><Route path="/activity" element={<ActivityBoard/>}/><Route path="/submit" element={<SubmitComplaint/>}/><Route path="/history" element={<History/>}/><Route path="/admin/dashboard" element={<Dashboard/>}/><Route path="/technology" element={<Technology/>}/></Route>
<Route path="*" element={<Navigate to="/login" replace/>}/></Routes></Suspense></BrowserRouter>}

