import {useSyncExternalStore} from 'react';
let now=Date.now(),timer;
const listeners=new Set();
function subscribe(listener){listeners.add(listener);if(!timer){now=Date.now();timer=setInterval(()=>{now=Date.now();listeners.forEach(fn=>fn());},1000);}return()=>{listeners.delete(listener);if(!listeners.size){clearInterval(timer);timer=null;}};}
export default function ServiceClock({large=false}){
 const tick=useSyncExternalStore(subscribe,()=>now),date=new Date(tick);
 const india=new Date(tick+330*60000),s=india.getUTCSeconds(),m=india.getUTCMinutes()+s/60,h=india.getUTCHours()%12+m/60;
 const display=date.toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit'});
 return <div className={'zero-clock'+(large?' large':'')}><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5"/>{[0,90,180,270].map(a=><path key={a} d="M24 5v4" stroke="currentColor" transform={`rotate(${a} 24 24)`}/>)}<path d="M24 24V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${h*30} 24 24)`}/><path d="M24 24V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${m*6} 24 24)`}/><path d="M24 28V7" stroke="#829773" strokeWidth="1" transform={`rotate(${s*6} 24 24)`}/><circle cx="24" cy="24" r="2" fill="currentColor"/></svg><div><time dateTime={date.toISOString()}>{display}</time><small>India Standard Time</small></div></div>;
}
