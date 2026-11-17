import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
// Trace supplied brush artwork into native SVG silhouettes, without replacing its lettering.
const source=new URL('../public/brand/miku-vancouver-logo-20261117.jpg',import.meta.url);
const {data,info}=await sharp(fileURLToPath(source)).removeAlpha().raw().toBuffer({resolveWithObject:true});
const {width:w,height:h,channels}=info,N=w*h;
const red=new Uint8Array(N),ink=new Uint8Array(N),white=new Uint8Array(N),reds=[];
for(let i=0;i<N;i++){
 const [r,g,b]=data.subarray(i*channels,i*channels+3);
 red[i]=r-g>45&&r-b>35&&r>110?1:0;
 ink[i]=Math.max(r,g,b)<155&&Math.max(r,g,b)-Math.min(r,g,b)<55?1:0;
 white[i]=Math.min(r,g,b)>180?1:0;
 if(red[i]&&r>150&&g>20&&g<100)reds.push([r,g,b]);
}
const exterior=new Uint8Array(N),queue=[];
for(let x=0;x<w;x++)queue.push(x,(h-1)*w+x);
for(let y=0;y<h;y++)queue.push(y*w,y*w+w-1);
for(let j=0;j<queue.length;j++){
 const i=queue[j];if(i<0||i>=N||exterior[i]||!white[i])continue;exterior[i]=1;
 const x=i%w;if(x>0)queue.push(i-1);if(x<w-1)queue.push(i+1);if(i>=w)queue.push(i-w);if(i<N-w)queue.push(i+w);
}
const kanji=new Uint8Array(N);
for(let i=0;i<N;i++){const x=i%w,y=Math.floor(i/w);if(white[i]&&!exterior[i]&&x<305&&x>45&&y>95&&y<322)kanji[i]=1;}
function clean(mask,minArea){
 const seen=new Uint8Array(N);
 for(let i=0;i<N;i++)if(mask[i]&&!seen[i]){
  const q=[i];seen[i]=1;
  for(let j=0;j<q.length;j++){
   const p=q[j],x=p%w;for(const n of [x?p-1:-1,x<w-1?p+1:-1,p-w,p+w])if(n>=0&&n<N&&mask[n]&&!seen[n]){seen[n]=1;q.push(n)}
  }
  if(q.length<minArea)for(const p of q)mask[p]=0;
 }
}
clean(red,4);clean(ink,4);clean(kanji,8);
function trace(mask){
 const edges=[],starts=new Map(),stride=w+1;
 const edge=(ax,ay,bx,by,dir)=>{const e={a:ay*stride+ax,b:by*stride+bx,dir,used:false};edges.push(e);const q=starts.get(e.a)||[];q.push(e);starts.set(e.a,q)};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(mask[y*w+x]){
  if(y===0||!mask[(y-1)*w+x])edge(x,y,x+1,y,0);
  if(x===w-1||!mask[y*w+x+1])edge(x+1,y,x+1,y+1,1);
  if(y===h-1||!mask[(y+1)*w+x])edge(x+1,y+1,x,y+1,2);
  if(x===0||!mask[y*w+x-1])edge(x,y+1,x,y,3);
 }
 const paths=[];
 for(const first of edges)if(!first.used){
  let e=first;const points=[];
  do{
   e.used=true;points.push([e.a%stride,Math.floor(e.a/stride)]);
   const candidates=(starts.get(e.b)||[]).filter(t=>!t.used);if(!candidates.length)break;
   const order=[(e.dir+1)%4,e.dir,(e.dir+3)%4,(e.dir+2)%4];candidates.sort((a,b)=>order.indexOf(a.dir)-order.indexOf(b.dir));e=candidates[0];
  }while(e!==first&&!e.used);
  if(points.length<4)continue;
  const compact=points.filter((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0])});
  if(compact.length>=3)paths.push('M'+compact.map(p=>p.join(' ')).join('L')+'Z');
 }
 return paths.join('');
}
const median=c=>reds.map(p=>p[c]).sort((a,b)=>a-b)[Math.floor(reds.length/2)];
const sealColor='#'+[0,1,2].map(c=>median(c).toString(16).padStart(2,'0')).join('');
const paths={seal:trace(red),calligraphy:trace(kanji),lettering:trace(ink)};
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="12 30 624 324"><g id="seal" fill="${sealColor}" fill-rule="evenodd"><path d="${paths.seal}"/></g><g id="calligraphy" fill="#fff" fill-rule="evenodd"><path d="${paths.calligraphy}"/></g><g id="lettering" fill="currentColor" fill-rule="evenodd"><path d="${paths.lettering}"/></g></svg>\n`;
await writeFile(new URL('../public/brand/miku-vancouver-art-20261117.svg',import.meta.url),svg);
console.log(JSON.stringify({source:[w,h],sealColor,svgBytes:Buffer.byteLength(svg),pathLengths:Object.fromEntries(Object.entries(paths).map(([k,v])=>[k,v.length]))}));
