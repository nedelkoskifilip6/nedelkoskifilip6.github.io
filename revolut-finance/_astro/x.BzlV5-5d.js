import{r as l}from"./index.CuJDCyoJ.js";var d={exports:{}},i={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var c;function f(){if(c)return i;c=1;var o=Symbol.for("react.transitional.element"),t=Symbol.for("react.fragment");function n(s,r,e){var u=null;if(e!==void 0&&(u=""+e),r.key!==void 0&&(u=""+r.key),"key"in r){e={};for(var a in r)a!=="key"&&(e[a]=r[a])}else e=r;return r=e.ref,{$$typeof:o,type:s,key:u,ref:r!==void 0?r:null,props:e}}return i.Fragment=t,i.jsx=n,i.jsxs=n,i}var x;function k(){return x||(x=1,d.exports=f()),d.exports}var A=k();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=o=>o.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),p=(...o)=>o.filter((t,n,s)=>!!t&&t.trim()!==""&&s.indexOf(t)===n).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var h={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=l.forwardRef(({color:o="currentColor",size:t=24,strokeWidth:n=2,absoluteStrokeWidth:s,className:r="",children:e,iconNode:u,...a},m)=>l.createElement("svg",{ref:m,...h,width:t,height:t,stroke:o,strokeWidth:s?Number(n)*24/Number(t):n,className:p("lucide",r),...a},[...u.map(([v,R])=>l.createElement(v,R)),...Array.isArray(e)?e:[e]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=(o,t)=>{const n=l.forwardRef(({className:s,...r},e)=>l.createElement(w,{ref:e,iconNode:t,className:p(`lucide-${E(o)}`,s),...r}));return n.displayName=`${o}`,n};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=j("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);export{_ as X,j as c,A as j};
