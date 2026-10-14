var u={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p;function l(){if(p)return n;p=1;var t=Symbol.for("react.transitional.element"),s=Symbol.for("react.fragment");function i(c,e,r){var a=null;if(r!==void 0&&(a=""+r),e.key!==void 0&&(a=""+e.key),"key"in e){r={};for(var o in e)o!=="key"&&(r[o]=e[o])}else r=e;return e=r.ref,{$$typeof:t,type:c,key:a,ref:e!==void 0?e:null,props:r}}return n.Fragment=s,n.jsx=i,n.jsxs=i,n}var v;function x(){return v||(v=1,u.exports=l()),u.exports}var k=x();const m="/miku-vancouver/".replace(/\/$/,""),R=(t="")=>`${m}/${t.replace(/^\//,"")}`,E=(t,s=!1)=>R(`images/${t}${s?"-mobile":""}.webp`),d={menu:"https://mikurestaurant.com/menu/",booking:"https://www.opentable.ca/r/miku-restaurant-vancouver-reservations-vancouver?restref=24787&lang=en-CA&ot_source=Restaurant%20website&ot_campaign=homepagebutton"};export{E as i,k as j,d as o};
