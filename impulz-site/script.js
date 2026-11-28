document.querySelectorAll('[data-wa]').forEach(a=>{a.href='https://wa.me/94779443656?text='+encodeURIComponent('Hi IMPULZ! I would like to discuss '+a.dataset.wa+'.');a.target='_blank';a.rel='noopener'});
const groups=[
{name:'Logos & Brand Identity Kits',ids:Array.from({length:21},(_,i)=>String(i))},
{name:'Flyers & Postcards',ids:Array.from({length:28},(_,i)=>'flyer-'+String(i+1).padStart(2,'0'))},
{name:'Social Media',ids:Array.from({length:18},(_,i)=>'Socialmedia/'+(i+1))},
{name:'Display Graphics',ids:Array.from({length:9},(_,i)=>'Displaygraphics/'+(i+1))},
{name:'Magazines & eBooks',ids:Array.from({length:16},(_,i)=>'magazines/'+(i+1))}
];
const pathFor=n=>typeof n==='string'?'assets/portfolio/'+n+'.webp':'assets/portfolio/project-'+String(n).padStart(2,'0')+'.webp';
const grid=document.getElementById('gallery'),dialog=document.getElementById('lightbox'),large=document.getElementById('large'),thumbs=document.getElementById('gallery-thumbs'),counter=document.getElementById('gallery-count');
let current=null,index=0,opener=null,touchX=null;
function show(n){if(!current)return;index=(n+current.ids.length)%current.ids.length;large.src=pathFor(current.ids[index]);large.alt=current.name+' — project '+(index+1);counter.textContent=(index+1)+' / '+current.ids.length;Array.from(thumbs.children).forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-current',i===index?'true':'false')});const b=thumbs.children[index];if(b)thumbs.scrollLeft=b.offsetLeft-thumbs.offsetLeft-(thumbs.clientWidth-b.clientWidth)/2;}
function openGallery(g,b){dialog.classList.toggle('social-gallery',g.name==='Social Media Designs'||g.name==='Display Graphics'||g.name==='Magazines & eBooks');current=g;opener=b;document.getElementById('gallery-title').textContent=g.name;thumbs.replaceChildren(...g.ids.map((id,i)=>{const t=document.createElement('button');t.type='button';t.setAttribute('aria-label','View project '+(i+1));const im=document.createElement('img');im.src=pathFor(id);im.alt='';im.loading='lazy';t.append(im);t.onclick=()=>show(i);return t}));dialog.showModal();document.body.classList.add('gallery-open');show(0);}
groups.forEach(g=>{const b=document.createElement('button');b.type='button';b.className='category-card'+(g.name==='Flyers & Postcards'?' flyer-category-card':g.name==='Logos & Brand Identity Kits'?' logo-category-card':(g.name==='Social Media Designs'||g.name==='Display Graphics'||g.name==='Magazines & eBooks')?' social-category-card':'');const im=document.createElement('img');if(g.ids.length)im.src=pathFor(g.name==='Flyers & Postcards'?'flyer-13':g.name==='Logos & Brand Identity Kits'?'8':g.name==='Social Media Designs'?'Socialmedia/4':g.name==='Magazines & eBooks'?'magazines/14':g.ids[0]);im.alt='';im.loading='lazy';const label=document.createElement('div');label.className='category-label';const title=document.createElement('strong');title.textContent=g.name;label.append(title);if(g.ids.length){const arrow=document.createElement('span');arrow.className='gallery-open-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');label.append(arrow);b.setAttribute('aria-label','Open '+g.name+' gallery')}else{b.setAttribute('aria-label',g.name+' — Coming soon')}if(g.ids.length){b.append(im,label);b.onclick=()=>openGallery(g,b);startPortfolioPreview(b,im,g,groups.indexOf(g))}else{const placeholder=document.createElement('div');placeholder.className='category-placeholder';b.append(placeholder,label);b.disabled=true;}grid.append(b)});
document.getElementById('prev').onclick=()=>show(index-1);document.getElementById('next').onclick=()=>show(index+1);document.getElementById('close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{document.body.classList.remove('gallery-open');if(opener)opener.focus()});dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowLeft'?-1:1))}});large.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});large.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>45)show(index+(dx<0?1:-1));touchX=null},{passive:true});
document.getElementById('menu').onclick=()=>{const n=document.getElementById('nav');document.getElementById('menu').setAttribute('aria-expanded',n.classList.toggle('open'))};

/* Direct ordering option: scroll to and highlight the services section. */
const directServicesTrigger=document.querySelector('.direct-services-trigger');
if(directServicesTrigger){let servicesHighlightTimer;directServicesTrigger.addEventListener('click',()=>{const services=document.getElementById('services');if(!services)return;services.classList.remove('services-selected');void services.offsetWidth;services.classList.add('services-selected');clearTimeout(servicesHighlightTimer);servicesHighlightTimer=setTimeout(()=>services.classList.remove('services-selected'),4500)})}

// Service cards: responsive, swipeable carousel with previous/next controls.
const serviceSlider=document.getElementById('pricing-slider');
if(serviceSlider){const prev=document.querySelector('.pricing-prev'),next=document.querySelector('.pricing-next');const getStep=()=>{const card=serviceSlider.querySelector('.price-card');return card?card.getBoundingClientRect().width+parseFloat(getComputedStyle(serviceSlider).gap||0):serviceSlider.clientWidth};const update=()=>{prev.disabled=serviceSlider.scrollLeft<=2;next.disabled=serviceSlider.scrollLeft+serviceSlider.clientWidth>=serviceSlider.scrollWidth-3};prev.addEventListener('click',()=>serviceSlider.scrollBy({left:-getStep(),behavior:'smooth'}));next.addEventListener('click',()=>serviceSlider.scrollBy({left:getStep(),behavior:'smooth'}));serviceSlider.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);serviceSlider.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();serviceSlider.scrollBy({left:(e.key==='ArrowRight'?1:-1)*getStep(),behavior:'smooth'})}});update()}


/* Scroll-activated slow crossfades. */
function startPortfolioPreview(card,img,group,order){
 if(group.ids.length<2||!('IntersectionObserver' in window))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,busy=false,timer,position=group.ids.findIndex(id=>img.getAttribute('src')===pathFor(id));
 const back=img.cloneNode(false);back.removeAttribute('src');back.removeAttribute('loading');back.alt='';
 card.style.position='relative';
 for(const layer of [img,back])Object.assign(layer.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:getComputedStyle(img).objectFit,pointerEvents:'none',transition:'none'});
 Object.assign(img.style,{opacity:'1',zIndex:'0'});Object.assign(back.style,{opacity:'0',zIndex:'1'});card.insertBefore(back,img.nextSibling);
 let front=img,hidden=back;
 const eligible=()=>visible&&!document.hidden&&!dialog.open&&!reduced.matches;
 function schedule(delay=4000+order*180){clearTimeout(timer);if(visible&&!reduced.matches)timer=setTimeout(tick,delay)}
 async function tick(){
  if(!eligible()||busy){schedule();return}busy=true;
  const next=(position+1)%group.ids.length;
  try{
   hidden.style.transition='none';hidden.style.opacity='0';hidden.style.zIndex='1';front.style.zIndex='0';
   hidden.src=pathFor(group.ids[next]);
   await hidden.decode();
   if(!eligible())return;
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   hidden.style.transition='opacity 3200ms ease-in-out';hidden.style.opacity='1';
   await new Promise(resolve=>setTimeout(resolve,3300));
   hidden.style.transition='none';hidden.style.zIndex='0';front.style.transition='none';front.style.opacity='0';front.style.zIndex='1';
   [front,hidden]=[hidden,front];position=next;
  }catch{position=next}finally{busy=false;schedule()}
 }
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule(3000+order*850);else clearTimeout(timer)},{threshold:.15});observer.observe(card);
 reduced.addEventListener('change',()=>{if(reduced.matches)clearTimeout(timer);else schedule(100)});
}
