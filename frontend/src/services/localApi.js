import { analyzeWithModel } from './analysisClient.js';
const KEY = 'project.local.grievances.v1';
const departments = { Water: 'Water Supply Department', Electricity: 'Electricity Department', Road: 'Public Works Department', Garbage: 'Sanitation/Waste Management Department', Others: 'General/Public Grievance Department' };
function readAll() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try { const rows = JSON.parse(raw); if (!Array.isArray(rows)) throw new Error(); return rows; }
  catch { throw new Error('Saved records could not be read. Export or recover browser data before clearing storage.'); }
}
function owner(){try{return JSON.parse(sessionStorage.getItem('project_profile')||'null')?.id || 'guest';}catch{return 'guest';}}
function read(){return readAll().filter(row=>(row.owner_id||'guest')===owner());}
function save(rows) { try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch { throw new Error('This browser could not save the grievance. Allow browser storage or use the connected API.'); } }
const classify = analyzeWithModel;
function history(record) { return record.history || [{ new_status: 'SUBMITTED', changed_at: record.timestamp, changed_by: 'Local guest', remark: 'Saved on this device. Awaiting connection to a service authority.' }]; }
export const localApi = {
  async predict(text) { return { status: 'success', data: await classify(text) }; },
  async submitComplaint(payload) {
    if (!payload.complaint_text?.trim()) throw new Error('Describe the issue before submitting.');
    const rows = readAll(), now = new Date();
    const analysis=await classify(payload.complaint_text);
    const category = departments[payload.category] ? payload.category : analysis.category;
    const record = { ...analysis, category, department: departments[category], id: crypto.randomUUID(), owner_id: owner(), grievance_id: 'LOCAL-' + now.getFullYear() + '-' + crypto.randomUUID().slice(0,8).toUpperCase(), complaint_text: payload.complaint_text, status: 'SUBMITTED', timestamp: now.toISOString(), sla_status: 'PENDING', sla_deadline: null, related_grievances: [] };
    save([record,...rows]); return { status:'success', complaint:record };
  },
  async getComplaints(params={}) {
    let rows = read();
    for (const k of ['category','priority','status','department']) if(params[k] && params[k] !== 'All') rows=rows.filter(r=>r[k]?.toLowerCase()===params[k].toLowerCase());
    if(params.search) rows=rows.filter(r=>(r.grievance_id+' '+r.complaint_text).toLowerCase().includes(params.search.toLowerCase()));
    const total=rows.length, limit=Math.max(1,Number(params.limit)||10),page=Math.max(1,Number(params.page)||1);
    return {status:'success',complaints:rows.slice((page-1)*limit,page*limit),total,page,limit};
  },
  async getComplaintByGrievanceId(id) { const record=read().find(r=>r.grievance_id.toLowerCase()===id.trim().toLowerCase()); if(!record)throw new Error('No record with this reference was found in this browser.');return {status:'success',complaint:record,history:history(record)}; },
  async getComplaintHistory(id){const record=read().find(r=>r.id===id);return {status:'success',history:record?history(record):[]};},
  async getNotifications(){return {status:'success',notifications:[],unread_count:0};},
  async markNotificationAsRead(){return {status:'success'};},
  async markAllNotificationsAsRead(){return {status:'success'};}
};

