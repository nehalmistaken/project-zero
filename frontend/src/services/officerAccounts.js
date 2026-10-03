import { digest } from './citizenAccounts.js';
const KEY='projectzero.officers.v1';
const SESSION='project_officer';
const read=()=>JSON.parse(localStorage.getItem(KEY)||'[]');
export function officerSession(){try{return JSON.parse(sessionStorage.getItem(SESSION)||'null');}catch{return null;}}
export function requireOfficer(admin=false){const user=officerSession();if(!user || (admin&&user.role!=='admin'))throw new Error('Administrator access is required.');return user;}
export async function registerOfficer({name,email,department,username,password}){
 username=username.trim().toLowerCase();
 if(!name.trim()||!/^\S+@\S+\.\S+$/.test(email)||!department.trim()||!/^\w{3,30}$/.test(username)||password.length<8)throw new Error('Complete your details, use a username with 3–30 letters/numbers, and a password of at least 8 characters.');
 const rows=read();if(username==='admin'||rows.some(r=>r.username===username))throw new Error('This username is already reserved.');
 const salt=crypto.randomUUID(),hash=await digest(password,salt);
 localStorage.setItem(KEY,JSON.stringify([...rows,{id:crypto.randomUUID(),name:name.trim(),email:email.trim(),department,username,salt,hash,approved:false}]));
}
export async function loginOfficer(username,password){
 username=username.trim().toLowerCase();let user;
 if(username==='admin'&&password==='admin123')user={id:'local-admin',name:'Administrator',role:'admin'};
 else {const row=read().find(r=>r.username===username);if(!row||await digest(password,row.salt)!==row.hash)throw new Error('Username or password is incorrect.');if(!row.approved)throw new Error('Your officer account is awaiting administrator approval.');user={id:row.id,name:row.name,department:row.department,role:'officer'};}
 sessionStorage.setItem(SESSION,JSON.stringify(user));sessionStorage.setItem('project_mode','local');sessionStorage.removeItem('project_guest');sessionStorage.removeItem('project_profile');localStorage.removeItem('admin_token');localStorage.removeItem('admin_user');return user;
}
export function listOfficers(){requireOfficer(true);return read().map(({hash:_hash,salt:_salt,...r})=>r);}
export function approveOfficer(id){requireOfficer(true);const rows=read();const row=rows.find(r=>r.id===id);if(!row)throw new Error('Officer not found.');row.approved=true;localStorage.setItem(KEY,JSON.stringify(rows));}
export function officerCases(){requireOfficer();return JSON.parse(localStorage.getItem('project.local.grievances.v1')||'[]');}
export function reviewCase(id,{status,priority,remark}){
 const actor=requireOfficer(),rows=officerCases(),row=rows.find(r=>r.id===id);
 if(!row)throw new Error('Grievance not found.');
 if(!['SUBMITTED','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'].includes(status)||!['Low','Medium','High'].includes(priority)||remark.trim().length<5)throw new Error('Choose a valid status and priority, and explain your decision (at least 5 characters).');
 const allowed={SUBMITTED:['SUBMITTED','ASSIGNED'],ASSIGNED:['ASSIGNED','IN_PROGRESS'],IN_PROGRESS:['IN_PROGRESS','RESOLVED'],RESOLVED:['RESOLVED','CLOSED'],CLOSED:['CLOSED']};
 if(!allowed[row.status]?.includes(status))throw new Error('Advance this grievance one stage at a time.');
 row.history=row.history||[{new_status:'SUBMITTED',changed_at:row.timestamp,changed_by:'Citizen',remark:'Grievance saved on this device.'}];
 row.history.push({new_status:status,changed_at:new Date().toISOString(),changed_by:actor.name,remark:remark.trim()+' · Priority: '+row.priority+' → '+priority});
 row.status=status;row.priority=priority;row.updated_at=new Date().toISOString();localStorage.setItem('project.local.grievances.v1',JSON.stringify(rows));return row;
}
