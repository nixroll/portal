import React,{useRef,useState,useEffect,useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {BorderBeam} from 'border-beam';
import {MetalFx,MetalBadge} from 'metal-fx';
import {Liquid} from 'liquid-gooey';

/* Slot переносит существующий DOM-узел ванильного приложения внутрь React-обёртки */
function Slot({el}){const r=useRef(null);useLayoutEffect(()=>{r.current.appendChild(el)},[el]);return <div ref={r} className="ld-slot"/>}

let st={enabled:true,dirty:false},islands=[],lib='base';
function island(target,where,render){
  const host=document.createElement('div');host.className='ld-host';
  if(where==='wrap')target.parentNode.insertBefore(host,target);else where(host);
  const root=createRoot(host);
  const o={host,root,target,where,draw(){root.render(render(where==='wrap'?<Slot el={target}/>:null))}};
  o.draw();islands.push(o);return o;
}
function teardown(){
  islands.forEach(o=>{if(o.where==='wrap'&&o.host.parentNode)o.host.parentNode.insertBefore(o.target,o.host);o.root.unmount();o.host.remove()});
  islands=[];
}
function mountLD(){
  const $=s=>document.querySelector(s);
  const card=$('.prev .card'),barIn=$('#bar .barin'),save=$('#save'),cap=$('.prev .cap');
  island(card,'wrap',c=><BorderBeam size="md" colorVariant="colorful" theme="dark" borderRadius={16} strength={0.85} duration={3.2} active={st.enabled}>{c}</BorderBeam>);
  island(barIn,'wrap',c=><BorderBeam size="line" colorVariant="mono" theme="dark" borderRadius={14} active={st.dirty}>{c}</BorderBeam>);
  island(null,h=>save.after(h),()=><MetalFx preset="chromatic" theme="dark" strength={1}><button className="ld-save" onClick={()=>save.click()}>Сохранить</button></MetalFx>);
  island(null,h=>cap.appendChild(h),()=>st.enabled?<MetalBadge theme="dark">Live</MetalBadge>:<span className="ld-off">Выключено</span>);
}

/* Переключатель версий: «капля» Liquid Gooey перетекает между вариантами */
const OPTS=[['base','Базовый'],['ld','Libraries.dev']];
function Switch({value,onChange}){
  const refs=[useRef(null),useRef(null)];const [p,setP]=useState({x:4,w:0});
  const measure=()=>{const b=refs[value==='ld'?1:0].current;if(b)setP({x:b.offsetLeft,w:b.offsetWidth})};
  useLayoutEffect(measure,[value]);
  useEffect(()=>{if(document.fonts)document.fonts.ready.then(measure)},[]);
  return <div className="libsw" role="radiogroup" aria-label="Версия дизайна">
    <div className="libsw-goo"><Liquid fill="#F4F4F5" blur={6} contrast={18} filterPadding={160} style={{width:"100%",height:"100%"}}>
      <Liquid.Item effect="move"><div className="libsw-blob" style={{width:p.w,transform:`translate(${p.x}px,4px)`}}/></Liquid.Item>
    </Liquid></div>
    {OPTS.map(([v,l],i)=><button key={v} ref={refs[i]} role="radio" aria-checked={value===v} className="libsw-opt" onClick={()=>onChange(v)}>{l}</button>)}
  </div>
}

let swRoot,onLib;
function renderSwitch(){swRoot.render(<Switch value={lib} onChange={v=>apply(v)}/>)}
function apply(v){
  lib=v;document.documentElement.dataset.lib=v;try{localStorage.setItem('bron-lib',v)}catch(e){}
  teardown();if(v==='ld')mountLD();renderSwitch();onLib&&onLib(v);
}
window.LD={
  init(cb){onLib=cb;let v='base';try{v=localStorage.getItem('bron-lib')||'base'}catch(e){}
    const h=document.createElement('div');h.id='libswHost';document.body.appendChild(h);swRoot=createRoot(h);apply(v)},
  refresh(s){const ch=s.enabled!==st.enabled||s.dirty!==st.dirty;st=s;if(ch)islands.forEach(o=>o.draw())}
};
