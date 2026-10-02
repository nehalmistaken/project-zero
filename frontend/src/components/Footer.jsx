import React from 'react';
import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer className="cf-footer" id="contact"><span>PROJECT ZERO <span>/</span> Public grievance desk</span><div>React · Vite · Tailwind CSS <Link to="/technology">Project details</Link></div></footer>;
}
