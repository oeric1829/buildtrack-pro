import { useState, useEffect } from "react";

const DEFAULT_JOBS = [
  { id: "J001", name: "Essex Fells CC", color: "#F97316" },
  { id: "J002", name: "Spring Brook", color: "#3B82F6" },
  { id: "J003", name: "Fairmount CC", color: "#10B981" },
  { id: "J004", name: "DU Process Golf Club", color: "#8B5CF6" },
  { id: "J005", name: "C2 - 58 Paris St", color: "#EC4899" },
];

const DEFAULT_SUBS = [
  { id: "S01", name: "Xtreme contractors", trade: "Framing", payType: "hourly", rate: 35, pin: "1111" },
  { id: "S02", name: "Black Builder", trade: "Metal Framing", payType: "hourly", rate: 30, pin: "2222" },
  { id: "S03", name: "Fabiano Construction", trade: "Metal Framing", payType: "hourly", rate: 33, pin: "3333" },
  { id: "S04", name: "Dennis Drywall", trade: "Sheetrock", payType: "daily", rate: 270, pin: "4444" },
  { id: "S05", name: "Wilmer Construction", trade: "General", payType: "hourly", rate: 33, pin: "5555" },
  { id: "S06", name: "Guicho's Construction", trade: "General", payType: "hourly", rate: 33, pin: "6666" },
];

const DEFAULT_WORKERS = [
  { id: "W01", name: "Thomaz", subId: "S01", trade: "Framing" },
  { id: "W02", name: "Luiz", subId: "S01", trade: "Framing" },
  { id: "W03", name: "Guilherme", subId: "S01", trade: "Framing" },
  { id: "W04", name: "Tiele", subId: "S01", trade: "Framing" },
  { id: "W05", name: "Vinicius", subId: "S02", trade: "Metal Framing" },
  { id: "W06", name: "Chris", subId: "S02", trade: "Metal Framing" },
  { id: "W07", name: "Emerson", subId: "S02", trade: "Metal Framing" },
  { id: "W08", name: "Wagner", subId: "S03", trade: "Metal Framing" },
  { id: "W09", name: "Wipson", subId: "S03", trade: "Metal Framing" },
  { id: "W10", name: "Cowboy", subId: "S03", trade: "Metal Framing" },
  { id: "W11", name: "Marcelo", subId: "S03", trade: "Metal Framing" },
  { id: "W12", name: "Fabiano", subId: "S03", trade: "Metal Framing" },
  { id: "W13", name: "Tio", subId: "S03", trade: "Metal Framing" },
  { id: "W14", name: "Dennis", subId: "S04", trade: "Sheetrock" },
  { id: "W15", name: "Joao", subId: "S04", trade: "Sheetrock" },
  { id: "W20", name: "Dennis JR", subId: "S04", trade: "Sheetrock" },
  { id: "W21", name: "Carlos", subId: "S04", trade: "Sheetrock" },
  { id: "W16", name: "Wilmer", subId: "S05", trade: "General" },
  { id: "W17", name: "Jose", subId: "S06", trade: "General" },
  { id: "W18", name: "Primo", subId: "S06", trade: "General" },
  { id: "W19", name: "Joel", subId: "S06", trade: "General" },
];

const ADMIN_PIN = "8282";
const OVERTIME_AFTER = 8;
const OT_MULT = 1.5;
const JOB_COLORS = ["#F97316","#3B82F6","#10B981","#8B5CF6","#EC4899","#EAB308","#14B8A6","#F43F5E"];
const SK = { entries:"bt_entries", nextId:"bt_nextId", jobs:"bt_jobs", subs:"bt_subs", workers:"bt_workers" };

function fTime(d) { return new Date(d).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true}); }
function fDate(d) { return new Date(d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); }
function fDateLong(s) { return new Date(s+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}); }
function calcHrs(e) { return (new Date(e.clockOut)-new Date(e.clockIn))/3600000; }
function ini(n) { return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2); }
function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
function lsGet(key, fb) { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fb; } catch { return fb; } }
function lsSet(key, val) { try { localStorage.setItem(key,JSON.stringify(val)); } catch {} }

function calcPay(entry, sub) {
  if (!entry || !entry.clockOut || !sub) return 0;
  if (sub.payType === "daily") {
    const days = Math.max(1, Math.round((calcHrs(entry)/8)*2)/2);
    return days * sub.rate;
  }
  const h = calcHrs(entry);
  return Math.min(h, OVERTIME_AFTER)*sub.rate + Math.max(0,h-OVERTIME_AFTER)*sub.rate*OT_MULT;
}

function calcOT(entry, sub) {
  if (!sub || sub.payType==="daily" || !entry || !entry.clockOut) return 0;
  return Math.max(0, calcHrs(entry)-OVERTIME_AFTER);
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0F1117; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #F97316; border-radius: 2px; }
  .card { background: #1A1D27; border: 1px solid #252836; border-radius: 16px; }
  .btn { border: none; border-radius: 11px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .18s; font-family: inherit; }
  .btn-or { background: #F97316; color: #fff; }
  .btn-or:hover { background: #EA6C10; transform: translateY(-1px); }
  .btn-or:disabled { background: #252836; color: #444; cursor: not-allowed; transform: none; }
  .btn-gr { background: #10B981; color: #fff; }
  .btn-gr:hover { background: #059669; }
  .btn-rd { background: #EF4444; color: #fff; }
  .btn-rd:hover { background: #DC2626; }
  .btn-ghost { background: #252836; color: #E8E9F0; border: 1px solid #33364A; }
  .btn-ghost:hover { background: #2A2D3A; }
  .btn-sm { padding: 5px 11px; font-size: 12px; border-radius: 8px; }
  .tab { background: none; border: none; color: #8B8FA8; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; padding: 8px 15px; border-radius: 9px; transition: all .18s; }
  .tab.on { background: #F97316; color: #fff; }
  .tab:hover:not(.on) { color: #E8E9F0; background: #252836; }
  .sc { background: #252836; border: 2px solid transparent; border-radius: 12px; padding: 12px 14px; cursor: pointer; transition: all .18s; display: flex; align-items: center; gap: 11px; }
  .sc:hover { border-color: #F97316; }
  .sc.on { border-color: #F97316; background: rgba(249,115,22,.1); }
  .pill { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .fade { animation: fi .28s ease; }
  @keyframes fi { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }
  .shake { animation: shk .4s ease; }
  @keyframes shk { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
  input, select { background: #252836; border: 1px solid #33364A; border-radius: 10px; color: #E8E9F0; padding: 9px 13px; font-family: inherit; font-size: 14px; outline: none; transition: border .15s; width: 100%; }
  input:focus, select:focus { border-color: #F97316; }
  input[type=number] { width: 78px; text-align: center; }
  select option { background: #1A1D27; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 9px 11px; color: #8B8FA8; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; border-bottom: 1px solid #252836; }
  td { padding: 11px; border-top: 1px solid #1E2130; }
  tr:hover td { background: rgba(255,255,255,.015); }
  .key { background:#1A1D27; border:1px solid #252836; border-radius:14px; width:72px; height:72px; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:600; cursor:pointer; transition:all .12s; color:#E8E9F0; user-select:none; font-family:inherit; }
  .key:hover { background:#252836; transform:scale(1.05); }
  .key:active { background:#F97316; transform:scale(.96); }
  .key.empty { background:transparent; border:none; cursor:default; pointer-events:none; }
  label { display:block; font-size:12px; color:#8B8FA8; font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; margin-top:14px; }
  label:first-child { margin-top:0; }
`;

function PinScreen({ subs, onLogin }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [label, setLabel] = useState("Enter your PIN");

  function tryPin(p) {
    if (p === ADMIN_PIN) { onLogin("admin", null); return; }
    const s = subs.find(x => x.pin === p);
    if (s) { onLogin("sub", s.id); return; }
    setShake(true);
    setLabel("Wrong PIN — try again");
    setPin("");
    setTimeout(() => { setShake(false); setLabel("Enter your PIN"); }, 1000);
  }

  function press(v) {
    if (v === "del") { setPin(p => p.slice(0,-1)); return; }
    if (pin.length >= 4) return;
    const n = pin + v;
    setPin(n);
    if (n.length === 4) setTimeout(() => tryPin(n), 120);
  }

  const KEYS = ["1","2","3","4","5","6","7","8","9","","0","del"];

  return (
    <div style={{minHeight:"100vh",background:"#0F1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{CSS}</style>
      <div style={{width:320,textAlign:"center"}}>
        <div style={{width:56,height:56,background:"#F97316",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 20px"}}>🏗️</div>
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:22,color:"#fff",marginBottom:4}}>BuildTrack Pro</div>
        <div style={{fontSize:13,color:"#8B8FA8",marginBottom:36}}>Xtreme contractors</div>
        <div style={{fontSize:13,color:shake?"#EF4444":"#8B8FA8",marginBottom:18,fontWeight:500}}>{label}</div>
        <div className={shake ? "shake" : ""} style={{display:"flex",justifyContent:"center",gap:16,marginBottom:36}}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{width:16,height:16,borderRadius:"50%",background:pin.length>i?"#F97316":"#252836",border:"2px solid",borderColor:pin.length>i?"#F97316":"#33364A",transition:"all .15s"}} />
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,justifyItems:"center"}}>
          {KEYS.map((k,i) => (
            <div key={i} className={`key ${k===""?"empty":""}`} onClick={() => k && press(k)}>
              {k === "del" ? "⌫" : k}
            </div>
          ))}
        </div>
        <div style={{marginTop:32,fontSize:12,color:"#444"}}>Contact your supervisor if you forgot your PIN</div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#1A1D27",border:"1px solid #252836",borderRadius:18,padding:28,width:"100%",maxWidth:460,maxHeight:"85vh",overflowY:"auto"}} onClick={e => e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:17}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#8B8FA8",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [jobs, setJobs] = useState(() => lsGet(SK.jobs, DEFAULT_JOBS));
  const [subs, setSubs] = useState(() => lsGet(SK.subs, DEFAULT_SUBS));
  const [workers, setWorkers] = useState(() => lsGet(SK.workers, DEFAULT_WORKERS));
  const [entries, setEntries] = useState(() => lsGet(SK.entries, []));
  const [nextId, setNextId] = useState(() => lsGet(SK.nextId, 1));
  const [selectedJob, setSelectedJob] = useState(null);
  const [crewHours, setCrewHours] = useState({});
  const [crewDate, setCrewDate] = useState(new Date().toISOString().slice(0,10));
  const [submitted, setSubmitted] = useState(false);
  const [adminTab, setAdminTab] = useState("overview");
  const [filterJob, setFilterJob] = useState("all");
  const [filterSub, setFilterSub] = useState("all");
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => lsSet(SK.entries, entries), [entries]);
  useEffect(() => lsSet(SK.nextId, nextId), [nextId]);
  useEffect(() => lsSet(SK.jobs, jobs), [jobs]);
  useEffect(() => lsSet(SK.subs, subs), [subs]);
  useEffect(() => lsSet(SK.workers, workers), [workers]);

  function showToast(msg, type="success") { setToast({msg,type}); setTimeout(() => setToast(null), 3000); }
  function closeModal() { setModal(null); setEditing(null); setForm({}); }

  function saveJob() {
    if (!form.name || !form.name.trim()) { showToast("Enter a job name","error"); return; }
    if (editing) {
      setJobs(prev => prev.map(j => j.id===editing.id ? {...j,...form} : j));
      showToast("Job updated");
    } else {
      const color = JOB_COLORS[jobs.length % JOB_COLORS.length];
      setJobs(prev => [...prev, {id:"J"+uid(), name:form.name.trim(), color:form.color||color}]);
      showToast("Job added");
    }
    closeModal();
  }

  function removeJob(id) {
    if (!window.confirm("Remove this job?")) return;
    setJobs(prev => prev.filter(j => j.id !== id));
    showToast("Job removed","error");
  }

  function saveSub() {
    const { name, trade, payType, rate, pin } = form;
    if (!name || !name.trim() || !pin || !pin.trim()) { showToast("Name and PIN required","error"); return; }
    if (pin.length !== 4 || isNaN(Number(pin))) { showToast("PIN must be 4 digits","error"); return; }
    if (pin === ADMIN_PIN) { showToast("That PIN is reserved for Admin","error"); return; }
    const conflict = subs.find(s => s.pin === pin && s.id !== (editing && editing.id));
    if (conflict) { showToast("PIN already in use","error"); return; }
    if (editing) {
      setSubs(prev => prev.map(s => s.id===editing.id ? {...s, name:name.trim(), trade:trade||s.trade, payType:payType||s.payType, rate:parseFloat(rate)||s.rate, pin} : s));
      showToast("Sub updated");
    } else {
      setSubs(prev => [...prev, {id:"S"+uid(), name:name.trim(), trade:trade||"General", payType:payType||"hourly", rate:parseFloat(rate)||0, pin}]);
      showToast("Sub added");
    }
    closeModal();
  }

  function removeSub(id) {
    if (!window.confirm("Remove this subcontractor?")) return;
    setSubs(prev => prev.filter(s => s.id !== id));
    setWorkers(prev => prev.filter(w => w.subId !== id));
    showToast("Sub removed","error");
  }

  function saveWorker() {
    if (!form.name || !form.name.trim() || !form.subId) { showToast("Name and company required","error"); return; }
    const sub = subs.find(s => s.id === form.subId);
    setWorkers(prev => [...prev, {id:"W"+uid(), name:form.name.trim(), subId:form.subId, trade:sub ? sub.trade : "General"}]);
    showToast("Worker added");
    closeModal();
  }

  function removeWorker(id) {
    if (!window.confirm("Remove this worker?")) return;
    setWorkers(prev => prev.filter(w => w.id !== id));
    showToast("Worker removed","error");
  }

  function approveEntry(id) { setEntries(prev => prev.map(e => e.id===id ? {...e,approved:true} : e)); showToast("Approved"); }
  function deleteEntry(id) { setEntries(prev => prev.filter(e => e.id !== id)); showToast("Removed","error"); }
  function approveAll() { setEntries(prev => prev.map(e => !e.approved ? {...e,approved:true} : e)); showToast("All approved!"); }

  function submitCrewHours() {
    if (!session || !session.subId || !selectedJob) return;
    const crew = workers.filter(w => w.subId === session.subId);
    const base = new Date(crewDate+"T07:00:00");
    let id = nextId;
    const newE = [];
    crew.forEach(w => {
      const h = parseFloat(crewHours[w.id] || 0);
      if (h > 0) {
        newE.push({
          id: id++, workerId: w.id, jobId: selectedJob, subId: w.subId,
          clockIn: base.toISOString(),
          clockOut: new Date(base.getTime() + h*3600000).toISOString(),
          approved: false, submittedAt: new Date().toISOString()
        });
      }
    });
    if (!newE.length) { showToast("Enter hours for at least one worker","error"); return; }
    setEntries(prev => [...prev, ...newE]);
    setNextId(id);
    setCrewHours({});
    setSubmitted(true);
    showToast(newE.length + " worker(s) submitted!");
    setTimeout(() => setSubmitted(false), 4000);
  }

  function exportCSV() {
    const rows = [["Subcontractor","Worker","Trade","Job Site","Date","Hours","Rate","OT Hours","Total Pay","Status"]];
    entries.forEach(e => {
      const w = workers.find(x => x.id===e.workerId);
      const s = subs.find(x => x.id===e.subId);
      const j = jobs.find(x => x.id===e.jobId);
      const h = calcHrs(e);
      const ot = calcOT(e,s);
      const pay = calcPay(e,s);
      rows.push([
        s ? s.name : "", w ? w.name : "", w ? w.trade : "", j ? j.name : "",
        fDate(e.clockIn), h.toFixed(2),
        s ? (s.payType==="daily" ? "$"+s.rate+"/day" : "$"+s.rate+"/hr") : "",
        ot > 0 ? ot.toFixed(2) : "0",
        "$"+pay.toFixed(2),
        e.approved ? "Approved" : "Pending"
      ]);
    });
    const csv = rows.map(r => r.map(v => '"'+String(v||"").replace(/"/g,'""')+'"').join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "Prodigy_" + crewDate + ".csv";
    a.click();
    showToast("CSV exported!");
  }

  if (!session) return <PinScreen subs={subs} onLogin={(role,subId) => setSession({role,subId})} />;

  const isAdmin = session.role === "admin";
  const subObj = isAdmin ? null : subs.find(s => s.id === session.subId);
  const crewWorkers = isAdmin ? [] : workers.filter(w => w.subId === session.subId);
  const filledWorkers = crewWorkers.filter(w => parseFloat(crewHours[w.id]||0) > 0).length;
  const totalCrewHrs = crewWorkers.reduce((a,w) => a + parseFloat(crewHours[w.id]||0), 0);
  const totalCost = entries.reduce((a,e) => { const s=subs.find(x=>x.id===e.subId); return a+(s?calcPay(e,s):0); }, 0);
  const totalHrs = entries.reduce((a,e) => a+calcHrs(e), 0);
  const pending = entries.filter(e => !e.approved).length;
  const jobStats = jobs.map(j => {
    const je = entries.filter(e => e.jobId===j.id);
    return {
      ...j,
      hrs: je.reduce((a,e) => a+calcHrs(e), 0),
      cost: je.reduce((a,e) => { const s=subs.find(x=>x.id===e.subId); return a+(s?calcPay(e,s):0); }, 0)
    };
  });
  const subStats = subs.map(s => {
    const se = entries.filter(e => e.subId===s.id);
    return {...s, hrs:se.reduce((a,e)=>a+calcHrs(e),0), cost:se.reduce((a,e)=>a+calcPay(e,s),0)};
  }).filter(s => s.hrs > 0);
  const filteredEntries = entries.filter(e => {
    if (filterJob !== "all" && e.jobId !== filterJob) return false;
    if (filterSub !== "all" && e.subId !== filterSub) return false;
    return true;
  });

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",background:"#0F1117",color:"#E8E9F0"}}>
      <style>{CSS}</style>

      {toast && (
        <div className="fade" style={{position:"fixed",top:20,right:20,zIndex:500,background:toast.type==="error"?"#EF4444":"#10B981",color:"#fff",padding:"13px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 10px 36px rgba(0,0,0,.5)"}}>
          {toast.msg}
        </div>
      )}

      {modal === "addJob" && (
        <Modal title={editing ? "Edit Job" : "Add New Job"} onClose={closeModal}>
          <label>Job Name</label>
          <input placeholder="e.g. Sunrise at Randolph" value={form.name||""} onChange={e => setForm(p => ({...p, name:e.target.value}))} />
          <label style={{marginTop:14}}>Color</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
            {JOB_COLORS.map(c => (
              <div key={c} onClick={() => setForm(p => ({...p, color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:"3px solid "+(form.color===c?"#fff":"transparent")}} />
            ))}
          </div>
          <div style={{display:"flex",gap:10,marginTop:22}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={closeModal}>Cancel</button>
            <button className="btn btn-or" style={{flex:1}} onClick={saveJob}>{editing ? "Save Changes" : "Add Job"}</button>
          </div>
        </Modal>
      )}

      {modal === "addSub" && (
        <Modal title={editing ? "Edit Subcontractor" : "Add Subcontractor"} onClose={closeModal}>
          <label>Company Name</label>
          <input placeholder="e.g. Marco Painting" value={form.name||""} onChange={e => setForm(p => ({...p, name:e.target.value}))} />
          <label>Trade</label>
          <input placeholder="e.g. Painting, Electrical" value={form.trade||""} onChange={e => setForm(p => ({...p, trade:e.target.value}))} />
          <label>Pay Type</label>
          <select value={form.payType||"hourly"} onChange={e => setForm(p => ({...p, payType:e.target.value}))}>
            <option value="hourly">Hourly ($/hr per person)</option>
            <option value="daily">Daily ($/day per person)</option>
          </select>
          <label>Rate ($)</label>
          <input type="number" placeholder="0" value={form.rate||""} onChange={e => setForm(p => ({...p, rate:e.target.value}))} />
          <label>4-Digit PIN</label>
          <input type="number" placeholder="e.g. 7777" value={form.pin||""} onChange={e => setForm(p => ({...p, pin:e.target.value.slice(0,4)}))} />
          <div style={{fontSize:12,color:"#8B8FA8",marginTop:6}}>Send this PIN privately to the subcontractor</div>
          <div style={{display:"flex",gap:10,marginTop:22}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={closeModal}>Cancel</button>
            <button className="btn btn-or" style={{flex:1}} onClick={saveSub}>{editing ? "Save Changes" : "Add Sub"}</button>
          </div>
        </Modal>
      )}

      {modal === "addWorker" && (
        <Modal title="Add Worker" onClose={closeModal}>
          <label>Worker Name</label>
          <input placeholder="e.g. Pedro" value={form.name||""} onChange={e => setForm(p => ({...p, name:e.target.value}))} />
          <label>Company</label>
          <select value={form.subId||""} onChange={e => setForm(p => ({...p, subId:e.target.value}))}>
            <option value="">Select company...</option>
            {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div style={{display:"flex",gap:10,marginTop:22}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={closeModal}>Cancel</button>
            <button className="btn btn-or" style={{flex:1}} onClick={saveWorker}>Add Worker</button>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div style={{background:"#13151E",borderBottom:"1px solid #1E2130",padding:"0 24px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:62}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:34,height:34,background:"#F97316",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🏗️</div>
            <div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,color:"#fff"}}>BuildTrack Pro</div>
              <div style={{fontSize:11,color:"#8B8FA8"}}>{isAdmin ? "👑 Admin" : "👷 "+(subObj ? subObj.name : "")}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {isAdmin && <div style={{fontSize:12,color:"#8B8FA8",background:"#1A1D27",borderRadius:8,padding:"5px 10px"}}>{fTime(now)}</div>}
            <button className="btn btn-ghost btn-sm" onClick={() => { setSession(null); setSelectedJob(null); setCrewHours({}); }}>🔒 Logout</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px"}}>

        {/* SUB VIEW */}
        {!isAdmin && (
          <div className="fade">
            <div style={{marginBottom:22}}>
              <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:21,fontWeight:700}}>Daily Hours — {subObj ? subObj.name : ""}</h1>
              <p style={{color:"#8B8FA8",fontSize:13,marginTop:4}}>Select job site and enter hours for your crew</p>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
              <div className="card" style={{padding:20}}>
                <div style={{fontSize:11,color:"#8B8FA8",fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Step 1 — Job Site</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {jobs.map(j => (
                    <div key={j.id} className={"sc"+(selectedJob===j.id?" on":"")} onClick={() => setSelectedJob(j.id)}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:j.color,flexShrink:0}} />
                      <div style={{flex:1,fontWeight:600,fontSize:14}}>{j.name}</div>
                      {selectedJob===j.id && <span style={{color:"#F97316"}}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{padding:20}}>
                <div style={{fontSize:11,color:"#8B8FA8",fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Step 2 — Work Date</div>
                <input type="date" value={crewDate} onChange={e => setCrewDate(e.target.value)} style={{marginBottom:10}} />
                {crewDate && <div style={{fontSize:12,color:"#F97316",fontWeight:500,marginBottom:16}}>{fDateLong(crewDate)}</div>}
                <div style={{fontSize:11,color:"#8B8FA8",fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Your Crew</div>
                {crewWorkers.map(w => (
                  <div key={w.id} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 0",borderBottom:"1px solid #1E2130"}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:"#252836",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#F97316"}}>{ini(w.name)}</div>
                    <span style={{fontSize:13,fontWeight:500}}>{w.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedJob && (
              <div className="card fade" style={{padding:22}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{fontSize:11,color:"#8B8FA8",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Step 3 — Enter Hours</div>
                    <div style={{fontWeight:700,fontSize:15,color:"#F97316"}}>{jobs.find(j=>j.id===selectedJob) ? jobs.find(j=>j.id===selectedJob).name : ""}</div>
                  </div>
                  <div style={{background:"#252836",borderRadius:9,padding:"7px 13px",fontSize:13}}>
                    <span style={{color:"#F97316",fontWeight:700}}>{totalCrewHrs.toFixed(1)} hrs</span>
                    <span style={{color:"#555",margin:"0 5px"}}>·</span>
                    <span style={{color:"#10B981",fontWeight:600}}>{filledWorkers}/{crewWorkers.length} workers</span>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:11,marginBottom:20}}>
                  {crewWorkers.map(w => {
                    const h = parseFloat(crewHours[w.id]||0);
                    const active = h > 0;
                    return (
                      <div key={w.id} style={{background:"#1E2130",borderRadius:12,padding:15,border:"2px solid "+(active?"#F97316":"transparent"),transition:"border .2s"}}>
                        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:11}}>
                          <div style={{width:30,height:30,borderRadius:"50%",background:active?"#F97316":"#252836",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{ini(w.name)}</div>
                          <div style={{fontWeight:600,fontSize:13}}>{w.name}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <input type="number" min="0" max="24" step="0.5" placeholder="0" value={crewHours[w.id]||""} onChange={e => setCrewHours(p => ({...p, [w.id]:e.target.value}))} style={{width:72}} />
                          <span style={{color:"#8B8FA8",fontSize:12}}>hrs</span>
                        </div>
                        {active && h > OVERTIME_AFTER && <div style={{marginTop:7,fontSize:11,color:"#FBBF24",fontWeight:700}}>⚠ Overtime</div>}
                        {active && h <= OVERTIME_AFTER && <div style={{marginTop:7,fontSize:11,color:"#10B981",fontWeight:600}}>✓ {h}h</div>}
                      </div>
                    );
                  })}
                </div>

                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <button className="btn btn-or" onClick={submitCrewHours} disabled={filledWorkers===0} style={{fontSize:15,padding:"12px 28px"}}>✅ Submit Hours</button>
                </div>
                {submitted && (
                  <div className="fade" style={{marginTop:14,background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.4)",borderRadius:10,padding:13,color:"#10B981",fontWeight:600,fontSize:13,textAlign:"center"}}>
                    ✓ Hours submitted! The office will review and approve.
                  </div>
                )}
              </div>
            )}

            {entries.filter(e => e.subId===session.subId).length > 0 && (
              <div className="card" style={{padding:20,marginTop:16}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>📋 Recent Submissions</div>
                <table>
                  <thead><tr>{["Worker","Job","Date","Hours","Status"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {entries.filter(e => e.subId===session.subId).slice().reverse().slice(0,8).map(e => {
                      const w = workers.find(x => x.id===e.workerId);
                      const j = jobs.find(x => x.id===e.jobId);
                      return (
                        <tr key={e.id}>
                          <td style={{fontWeight:600}}>{w ? w.name : ""}</td>
                          <td><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:j?j.color:"#555"}} />{j ? j.name : ""}</div></td>
                          <td style={{color:"#8B8FA8"}}>{fDate(e.clockIn)}</td>
                          <td style={{fontWeight:700,color:"#F97316"}}>{calcHrs(e).toFixed(1)}h</td>
                          <td><span className="pill" style={{background:e.approved?"rgba(16,185,129,.14)":"rgba(249,115,22,.14)",color:e.approved?"#10B981":"#F97316"}}>{e.approved?"✓ Approved":"Pending"}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADMIN VIEW */}
        {isAdmin && (
          <div className="fade">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:12}}>
              <div>
                <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:21,fontWeight:700}}>Admin Dashboard</h1>
                <p style={{color:"#8B8FA8",fontSize:13,marginTop:3}}>Xtreme contractors — full control panel</p>
              </div>
              <button className="btn btn-or" onClick={exportCSV} style={{fontSize:13}}>⬇ Export CSV (QuickBooks)</button>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
              {[
                {label:"Total Entries", value:entries.length, icon:"📋", color:"#3B82F6"},
                {label:"Total Hours", value:totalHrs.toFixed(1)+"h", icon:"⏱️", color:"#F97316"},
                {label:"Pending", value:pending, icon:"⚠️", color:"#FBBF24"},
                {label:"Est. Labor Cost", value:"$"+totalCost.toLocaleString("en-US",{maximumFractionDigits:0}), icon:"💰", color:"#10B981"}
              ].map(s => (
                <div className="card" key={s.label} style={{padding:16}}>
                  <div style={{fontSize:18,marginBottom:8}}>{s.icon}</div>
                  <div style={{fontSize:22,fontWeight:700,color:s.color,fontFamily:"'Space Grotesk',sans-serif"}}>{s.value}</div>
                  <div style={{fontSize:11,color:"#8B8FA8",marginTop:3}}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:4,marginBottom:16,background:"#1A1D27",borderRadius:11,padding:4,width:"fit-content",flexWrap:"wrap"}}>
              {[["overview","📊 Overview"],["timesheets","📋 Timesheets"],["costs","💰 Costs"],["manage","⚙️ Manage"]].map(([t,l]) => (
                <button key={t} className={"tab"+(adminTab===t?" on":"")} onClick={() => setAdminTab(t)}>{l}</button>
              ))}
            </div>

            {/* Overview */}
            {adminTab === "overview" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div className="card" style={{padding:20}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>🏢 By Subcontractor</div>
                  {subStats.length === 0 && <div style={{color:"#444",fontSize:13}}>No entries yet.</div>}
                  {subStats.map(s => {
                    const pct = totalHrs > 0 ? (s.hrs/totalHrs)*100 : 0;
                    return (
                      <div key={s.id} style={{marginBottom:13}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <div>
                            <span style={{fontSize:13,fontWeight:600}}>{s.name}</span>
                            <span style={{fontSize:11,color:"#555",marginLeft:5}}>{s.payType==="daily"?"$"+s.rate+"/day":"$"+s.rate+"/hr"}</span>
                          </div>
                          <span style={{fontSize:13,fontWeight:700}}>
                            <span style={{color:"#F97316"}}>{s.hrs.toFixed(1)}h</span>
                            <span style={{color:"#444",margin:"0 3px"}}>·</span>
                            <span style={{color:"#10B981"}}>${s.cost.toFixed(0)}</span>
                          </span>
                        </div>
                        <div style={{height:4,background:"#252836",borderRadius:2}}>
                          <div style={{height:"100%",width:pct+"%",background:"#F97316",borderRadius:2}} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="card" style={{padding:20}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>📍 By Job Site</div>
                  {jobStats.map(j => {
                    const pct = totalHrs > 0 ? (j.hrs/totalHrs)*100 : 0;
                    return (
                      <div key={j.id} style={{marginBottom:13}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:j.color}} />
                            <span style={{fontSize:13,fontWeight:600}}>{j.name}</span>
                          </div>
                          <span style={{fontSize:13,fontWeight:700}}>
                            <span style={{color:j.color}}>{j.hrs.toFixed(1)}h</span>
                            <span style={{color:"#444",margin:"0 3px"}}>·</span>
                            <span style={{color:"#10B981"}}>${j.cost.toFixed(0)}</span>
                          </span>
                        </div>
                        <div style={{height:4,background:"#252836",borderRadius:2}}>
                          <div style={{height:"100%",width:pct+"%",background:j.color,borderRadius:2}} />
                        </div>
                      </div>
                    );
                  })}
                  {totalHrs === 0 && <div style={{color:"#444",fontSize:13}}>No entries yet.</div>}
                </div>
              </div>
            )}

            {/* Timesheets */}
            {adminTab === "timesheets" && (
              <div className="card" style={{padding:20}}>
                <div style={{display:"flex",gap:9,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
                  <select value={filterJob} onChange={e => setFilterJob(e.target.value)}>
                    <option value="all">All Jobs</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                  <select value={filterSub} onChange={e => setFilterSub(e.target.value)}>
                    <option value="all">All Subs</option>
                    {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {entries.some(e => !e.approved) && (
                    <button className="btn btn-gr btn-sm" onClick={approveAll} style={{marginLeft:"auto"}}>✓ Approve All</button>
                  )}
                </div>
                {filteredEntries.length === 0 ? (
                  <div style={{textAlign:"center",color:"#444",padding:"36px 0",fontSize:13}}>No entries yet.</div>
                ) : (
                  <div style={{overflowX:"auto"}}>
                    <table>
                      <thead>
                        <tr>{["Sub","Worker","Job","Date","Hrs","Rate","OT","Pay","Status",""].map(h => <th key={h}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {filteredEntries.slice().reverse().map(e => {
                          const w = workers.find(x => x.id===e.workerId);
                          const s = subs.find(x => x.id===e.subId);
                          const j = jobs.find(x => x.id===e.jobId);
                          const h = calcHrs(e);
                          const ot = calcOT(e,s);
                          const pay = calcPay(e,s);
                          return (
                            <tr key={e.id}>
                              <td style={{fontWeight:600}}>{s ? s.name : ""}</td>
                              <td>{w ? w.name : ""}</td>
                              <td>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{width:7,height:7,borderRadius:"50%",background:j?j.color:"#555"}} />
                                  {j ? j.name : ""}
                                </div>
                              </td>
                              <td style={{color:"#8B8FA8",whiteSpace:"nowrap"}}>{fDate(e.clockIn)}</td>
                              <td style={{fontWeight:700,color:"#F97316"}}>{h.toFixed(1)}h</td>
                              <td style={{color:"#8B8FA8",fontSize:11}}>{s ? (s.payType==="daily"?"$"+s.rate+"/day":"$"+s.rate+"/hr") : ""}</td>
                              <td style={{color:ot>0?"#FBBF24":"#444",fontWeight:ot>0?700:400}}>{s && s.payType==="daily" ? "—" : ot>0 ? "+"+ot.toFixed(1)+"h" : "—"}</td>
                              <td style={{color:"#10B981",fontWeight:700}}>${pay.toFixed(0)}</td>
                              <td>
                                <span className="pill" style={{background:e.approved?"rgba(16,185,129,.14)":"rgba(249,115,22,.14)",color:e.approved?"#10B981":"#F97316"}}>
                                  {e.approved ? "✓" : "Pending"}
                                </span>
                              </td>
                              <td>
                                <div style={{display:"flex",gap:4}}>
                                  {!e.approved && <button className="btn btn-gr btn-sm" onClick={() => approveEntry(e.id)}>✓</button>}
                                  <button className="btn btn-rd btn-sm" onClick={() => deleteEntry(e.id)}>✕</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Costs */}
            {adminTab === "costs" && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
                {jobStats.map(j => {
                  const sb = subs.map(s => {
                    const se = entries.filter(e => e.jobId===j.id && e.subId===s.id);
                    if (!se.length) return null;
                    return {...s, hrs:se.reduce((a,e)=>a+calcHrs(e),0), cost:se.reduce((a,e)=>a+calcPay(e,s),0)};
                  }).filter(Boolean);
                  return (
                    <div className="card" key={j.id} style={{padding:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:j.color}} />
                        <div style={{fontWeight:700,fontSize:15}}>{j.name}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
                        <div style={{background:"#252836",borderRadius:9,padding:12}}>
                          <div style={{fontSize:19,fontWeight:700,color:j.color,fontFamily:"'Space Grotesk',sans-serif"}}>{j.hrs.toFixed(1)}h</div>
                          <div style={{fontSize:10,color:"#8B8FA8",marginTop:2}}>Total Hours</div>
                        </div>
                        <div style={{background:"#252836",borderRadius:9,padding:12}}>
                          <div style={{fontSize:19,fontWeight:700,color:"#10B981",fontFamily:"'Space Grotesk',sans-serif"}}>${j.cost.toFixed(0)}</div>
                          <div style={{fontSize:10,color:"#8B8FA8",marginTop:2}}>Labor Cost</div>
                        </div>
                      </div>
                      {sb.length > 0 && (
                        <div>
                          <div style={{fontSize:10,color:"#8B8FA8",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>By Sub</div>
                          {sb.map(s => (
                            <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #1E2130",fontSize:12}}>
                              <div>
                                <div style={{fontWeight:500}}>{s.name}</div>
                                <div style={{fontSize:10,color:"#555"}}>{s.payType==="daily"?"$"+s.rate+"/day":"$"+s.rate+"/hr"}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <div style={{color:"#F97316",fontWeight:600}}>{s.hrs.toFixed(1)}h</div>
                                <div style={{color:"#10B981",fontWeight:700}}>${s.cost.toFixed(0)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {j.hrs === 0 && <div style={{color:"#444",fontSize:12}}>No hours yet.</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Manage */}
            {adminTab === "manage" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div className="card" style={{padding:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div style={{fontWeight:700,fontSize:15}}>📍 Job Sites</div>
                    <button className="btn btn-or btn-sm" onClick={() => { setForm({}); setEditing(null); setModal("addJob"); }}>+ Add Job</button>
                  </div>
                  {jobs.map(j => (
                    <div key={j.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #1E2130"}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:j.color,flexShrink:0}} />
                      <div style={{flex:1,fontSize:13,fontWeight:500}}>{j.name}</div>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setForm({name:j.name,color:j.color}); setEditing(j); setModal("addJob"); }}>✏️</button>
                      <button className="btn btn-rd btn-sm" onClick={() => removeJob(j.id)}>✕</button>
                    </div>
                  ))}
                </div>

                <div className="card" style={{padding:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div style={{fontWeight:700,fontSize:15}}>🏢 Subcontractors</div>
                    <button className="btn btn-or btn-sm" onClick={() => { setForm({payType:"hourly"}); setEditing(null); setModal("addSub"); }}>+ Add Sub</button>
                  </div>
                  {subs.map(s => (
                    <div key={s.id} style={{padding:"9px 0",borderBottom:"1px solid #1E2130"}}>
                      <div style={{display:"flex",alignItems:"center",gap:9}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:"#252836",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#F97316",flexShrink:0}}>{ini(s.name)}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:600}}>{s.name}</div>
                          <div style={{fontSize:11,color:"#8B8FA8"}}>
                            {s.trade} · <span style={{color:"#10B981"}}>{s.payType==="daily"?"$"+s.rate+"/day":"$"+s.rate+"/hr"}</span> · PIN: <span style={{color:"#F97316",fontWeight:700}}>{s.pin}</span>
                          </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setForm({name:s.name,trade:s.trade,payType:s.payType,rate:s.rate,pin:s.pin}); setEditing(s); setModal("addSub"); }}>✏️</button>
                        <button className="btn btn-rd btn-sm" onClick={() => removeSub(s.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{padding:20,gridColumn:"1/-1"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div style={{fontWeight:700,fontSize:15}}>👷 Workers</div>
                    <button className="btn btn-or btn-sm" onClick={() => { setForm({}); setModal("addWorker"); }}>+ Add Worker</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                    {subs.map(s => {
                      const sw = workers.filter(w => w.subId === s.id);
                      if (!sw.length) return null;
                      return (
                        <div key={s.id} style={{background:"#252836",borderRadius:11,padding:14}}>
                          <div style={{fontSize:11,color:"#F97316",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:9}}>{s.name}</div>
                          {sw.map(w => (
                            <div key={w.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #1E2130"}}>
                              <div style={{width:22,height:22,borderRadius:"50%",background:"#1A1D27",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#F97316",flexShrink:0}}>{ini(w.name)}</div>
                              <span style={{flex:1,fontSize:12,fontWeight:500}}>{w.name}</span>
                              <button className="btn btn-rd" style={{padding:"2px 7px",fontSize:11,borderRadius:6}} onClick={() => removeWorker(w.id)}>✕</button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
