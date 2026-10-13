import{r as c}from"./index.CuJDCyoJ.js";var d={exports:{}},u={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var m;function y(){if(m)return u;m=1;var n=Symbol.for("react.transitional.element"),t=Symbol.for("react.fragment");function r(a,o,e){var i=null;if(e!==void 0&&(i=""+e),o.key!==void 0&&(i=""+o.key),"key"in o){e={};for(var s in o)s!=="key"&&(e[s]=o[s])}else e=o;return o=e.ref,{$$typeof:n,type:a,key:i,ref:o!==void 0?o:null,props:e}}return u.Fragment=t,u.jsx=r,u.jsxs=r,u}var f;function R(){return f||(f=1,d.exports=y()),d.exports}var l=R();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=n=>n.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),E=(...n)=>n.filter((t,r,a)=>!!t&&t.trim()!==""&&a.indexOf(t)===r).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=c.forwardRef(({color:n="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:a,className:o="",children:e,iconNode:i,...s},h)=>c.createElement("svg",{ref:h,...w,width:t,height:t,stroke:n,strokeWidth:a?Number(r)*24/Number(t):r,className:E("lucide",o),...s},[...i.map(([g,b])=>c.createElement(g,b)),...Array.isArray(e)?e:[e]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=(n,t)=>{const r=c.forwardRef(({className:a,...o},e)=>c.createElement(C,{ref:e,iconNode:t,className:E(`lucide-${k(n)}`,a),...o}));return r.displayName=`${n}`,r};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=j("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);let p=0,v="",x="";function N(n){c.useEffect(()=>{if(n){if(p++===0){v=document.body.style.overflow,x=document.body.style.paddingRight;const t=window.innerWidth-document.documentElement.clientWidth;t>0&&(document.body.style.paddingRight=`${parseFloat(getComputedStyle(document.body).paddingRight)+t}px`),document.body.style.overflow="hidden"}return()=>{--p===0&&(document.body.style.overflow=v,document.body.style.paddingRight=x)}}},[n])}function T(n){const t=c.useRef(null),r=c.useRef(null);N(n);const a=e=>{r.current=e??(document.activeElement instanceof HTMLElement?document.activeElement:null)},o=e=>{const i=document.getElementById(e);i&&(i.hasAttribute("tabindex")||(i.tabIndex=-1),r.current=i)};return c.useEffect(()=>{if(!n)return;const e=()=>t.current?.querySelector("button, a[href], input, select")?.focus({preventScroll:!0}),i=s=>{s.target instanceof Node&&!t.current?.contains(s.target)&&e()};return e(),document.addEventListener("focusin",i),()=>{document.removeEventListener("focusin",i),r.current?.isConnected&&r.current.focus({preventScroll:!0})}},[n]),{dialog:t,captureOpener:a,focusSectionOnClose:o}}function O(){const[n,t]=c.useState(""),{dialog:r,captureOpener:a,focusSectionOnClose:o}=T(!!n);return c.useEffect(()=>{const e=i=>{const s=document.activeElement;a(document.querySelector(".nav-actions .login")??(s instanceof HTMLElement&&s!==document.body?s:null)),t(i.detail)};return window.addEventListener("orbit-demo",e),()=>window.removeEventListener("orbit-demo",e)},[]),n?l.jsx("div",{className:"modal-backdrop",onClick:()=>t(""),children:l.jsxs("div",{ref:r,className:"demo-modal",role:"dialog","aria-modal":"true","aria-label":"Demo account",onClick:e=>e.stopPropagation(),children:[l.jsx("button",{autoFocus:!0,className:"close-modal","aria-label":"Close demo",onClick:()=>t(""),children:l.jsx(L,{})}),l.jsx("span",{className:"label",children:"INDEPENDENT PORTFOLIO CONCEPT"}),l.jsx("h3",{children:n}),l.jsx("p",{children:"Your demo is ready. All balances, cards and transactions are fictional. No authentication or personal information is needed."}),l.jsx("a",{className:"button",href:"#banking",onClick:()=>{o("banking"),t("")},children:"Enter the experience"})]})}):null}export{O as D,L as X,T as a,j as c,l as j,N as u};
