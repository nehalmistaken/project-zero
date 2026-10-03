import {useEffect,useState} from 'react';
import {initialFeed,advanceFeed} from './activityFeed';
export default function useSimulation(){
 const [feed,setFeed]=useState(()=>{try{return JSON.parse(sessionStorage.getItem('zero.activity.feed'))||initialFeed();}catch{return initialFeed();}});
 useEffect(()=>{let timer;function tick(){setFeed(state=>advanceFeed(state));timer=setTimeout(tick,3000+Math.random()*4000);}timer=setTimeout(tick,3000);return()=>clearTimeout(timer);},[]);
 useEffect(()=>{sessionStorage.setItem('zero.activity.feed',JSON.stringify(feed));},[feed]);
 return [feed,setFeed];
}
