import http from 'node:http';
import {analyze,initialize,fallback} from './engine.mjs';
const port=Number(process.env.ANALYSIS_PORT||5001);let state='loading',failure='',queue=Promise.resolve(),pending=0;
initialize().then(()=>{state='ready';console.log('Multilingual MiniLM ready.');}).catch(e=>{state='unavailable';failure=e.message;console.error('Model unavailable:',failure);});
http.createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 const send=(status,data)=>{res.writeHead(status);res.end(JSON.stringify(data));};
 if(req.method==='GET'&&req.url==='/health')return send(200,{service:'project-zero-analysis',state,error:failure||undefined});
 if(req.method!=='POST'||req.url!=='/analyze')return send(404,{message:'Not found'});
 if(req.headers.origin&&!/^http:\/\/(localhost|127\.0\.0\.1):(5173|5174|4173)$/.test(req.headers.origin))return send(403,{message:'Origin not allowed'});
 if(pending>=8)return send(503,{message:'Analysis queue is busy. Please retry.'});
 let body='';try{for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>32000)return send(413,{message:'Request too large'});}const payload=JSON.parse(body);if(typeof payload.text!=='string'||payload.text.length<5||payload.text.length>6000)return send(400,{message:'Description must contain 5–6000 characters.'});
 pending++;const task=queue.then(async()=>{try{return await analyze(payload.text);}catch(e){state='unavailable';failure=e.message;return fallback(payload.text);}});queue=task.catch(()=>{});let data;try{data=await task;}finally{pending--;}send(200,{status:'success',data});
 }catch{send(400,{message:'Invalid analysis request'});}
}).listen(port,'127.0.0.1',()=>console.log(`PROJECT ZERO analysis: http://127.0.0.1:${port}`));
