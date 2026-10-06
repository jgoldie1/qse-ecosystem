const SUPABASE_URL='https://fxluchtdfpediivhoksl.supabase.co';
const SUPABASE_KEY='sb_publishable_y2OadDy1zy8QlWy-YAcdlg_uzAYMLzj';
const OWNER_EMAIL='tashaashe0@gmail.com';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
let installPrompt=null;
let siteSettings={};
const iconMap={'body-sculpting':'✨','massage-therapy':'💆🏾‍♀️','hot-stone-massage':'🪨','reiki':'🫶🏾','holistic-wellness':'🌿','acupressure':'🤲🏾'};
const productIcons={'aftercare':'🧴','student-kit':'🧰','wellness-products':'🛍️','gift-cards-packages':'🎁'};

function safe(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function money(v){return v==null?'':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v));}
function setStatus(id,msg,bad=false){const el=$(id);if(!el)return;el.textContent=msg;el.style.color=bad?'#ff8c9b':'#87e4ab';}

async function loadSettings(){
  const {data,error}=await db.from('sculptify_site_settings').select('*').eq('id','primary').maybeSingle();
  if(error||!data)return;
  siteSettings=data;
  $('#brand-title').textContent=data.business_name||'SculptifyLTD';
  $('#business-email').textContent=data.business_email||'Add in Owner Studio';
  $('#business-phone').textContent=data.business_phone||'Add in Owner Studio';
  $('#business-location').textContent=data.location||'San Diego, California';
  $('#footer-contact').textContent=[data.business_phone,data.business_email].filter(Boolean).join(' • ')||'Business contact can be added in Owner Studio';
  if(data.hero_title)$('#hero-title').innerHTML=safe(data.hero_title).replace(/\. /g,'.<br>');
  if(data.hero_subtitle)$('#hero-subtitle').textContent=data.hero_subtitle;
}

async function loadServices(){
  const {data,error}=await db.from('sculptify_services').select('*').order('sort_order');
  const rail=$('#services-rail'), select=$('#book-service');
  if(error){rail.innerHTML='<div class="loading-card">Service catalog is temporarily unavailable.</div>';return;}
  rail.innerHTML=(data||[]).map(s=>'<article class="service-card"><div class="service-visual">'+(iconMap[s.slug]||'✨')+'</div><div class="service-body"><span class="mini-tag">'+safe(s.category||'Wellness')+'</span><h3>'+safe(s.name)+'</h3><p>'+safe(s.short_description||'')+'</p><div class="service-meta">'+(s.duration_minutes?'<span>'+s.duration_minutes+' min</span>':'')+(s.price_from?'<span>From '+money(s.price_from)+'</span>':'')+'<span>Provider bio</span></div><a class="button purple service-book" href="#booking" data-slug="'+safe(s.slug)+'" data-name="'+safe(s.name)+'">Book</a></div></article>').join('');
  select.innerHTML='<option value="">Choose service</option>'+(data||[]).map(s=>'<option value="'+safe(s.slug)+'" data-name="'+safe(s.name)+'">'+safe(s.name)+'</option>').join('');
  $$('.service-book').forEach(a=>a.onclick=()=>{select.value=a.dataset.slug;});
}

async function loadCourses(){
  const {data,error}=await db.from('sculptify_courses').select('*').order('sort_order');
  const el=$('#courses-grid');
  if(error){el.innerHTML='<div class="loading-card">Academy catalog is temporarily unavailable.</div>';return;}
  el.innerHTML=(data||[]).map(c=>'<article class="lux-card"><div class="big-icon">🎓</div><span class="mini-tag">Academy</span><h3>'+safe(c.title)+'</h3><p>'+safe(c.short_description||'')+'</p><div class="service-meta">'+(c.duration_text?'<span>'+safe(c.duration_text)+'</span>':'')+(c.price?'<span>'+money(c.price)+'</span>':'')+'</div><button class="button gold course-interest" data-title="'+safe(c.title)+'">I’m Interested</button></article>').join('');
  $$('.course-interest').forEach(b=>b.onclick=()=>{location.hash='hologpt';appendMessage('coach','I can help you with '+b.dataset.title+'. Ask about enrollment, requirements or the next available class.');});
}

async function loadProducts(){
  const {data,error}=await db.from('sculptify_products').select('*').order('sort_order');
  const el=$('#products-grid');
  if(error){el.innerHTML='<div class="loading-card">Store is temporarily unavailable.</div>';return;}
  el.innerHTML=(data||[]).map(p=>'<article class="product-card"><div class="product-art">'+(productIcons[p.slug]||'🛍️')+'</div><div class="product-body"><span class="mini-tag">'+safe(p.category||'Store')+'</span><h3>'+safe(p.name)+'</h3><p>'+safe(p.short_description||'')+'</p><div class="service-meta">'+(p.price?'<span>'+money(p.price)+'</span>':'')+'<span>'+safe(p.supplier_type||'owned')+'</span></div>'+(p.checkout_url?'<a class="button gold" rel="noopener" href="'+safe(p.checkout_url)+'">Buy Now</a>':'<button class="button outline" data-demo="Stripe checkout becomes active when the owner adds a payment link for '+safe(p.name)+'.">Coming Online</button>')+'</div></article>').join('');
  $$('[data-demo]').forEach(b=>b.onclick=()=>appendMessage('coach',b.dataset.demo));
}

async function loadFaqs(){
  const {data,error}=await db.from('sculptify_faqs').select('*').order('sort_order');
  const el=$('#faq-list');
  if(error){el.innerHTML='<div class="loading-card">FAQs are temporarily unavailable.</div>';return;}
  el.innerHTML=(data||[]).map(f=>'<details class="faq-item"><summary>'+safe(f.question)+'</summary><p>'+safe(f.answer)+'</p></details>').join('');
}

function appendMessage(type,text){
  const box=$('#chat-messages'),div=document.createElement('div');
  div.className='chat-msg '+type;div.textContent=text;box.appendChild(div);box.scrollTop=box.scrollHeight;
}
async function sendHolo(){
  const input=$('#coach-input'),message=input.value.trim();if(!message)return;
  input.value='';appendMessage('user',message);
  try{
    const res=await fetch('/api/ai/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,context:'sculptify-hologpt'})});
    if(!res.ok)throw new Error('offline');
    const data=await res.json();appendMessage('coach',data.reply||'How can I help?');
  }catch{
    const q=message.toLowerCase();
    let reply='I can help with services, booking, Sculptify Academy, staffing, the store and approved FAQs.';
    if(q.includes('certif')||q.includes('academy')||q.includes('school'))reply='Sculptify Academy includes body sculpting certification and professional wellness education. I can help you find the right pathway.';
    else if(q.includes('job')||q.includes('work')||q.includes('staff'))reply='Sculptify Staffing is designed to connect qualified graduates and providers with opportunities.';
    else if(q.includes('book')||q.includes('massage')||q.includes('reiki')||q.includes('sculpt'))reply='I can route you to booking. Choose the service and preferred date below. For medical symptoms or emergencies, contact an appropriate licensed professional or emergency service.';
    else if(q.includes('store')||q.includes('product'))reply='The Sculptify Store supports wellness products, student kits, gift cards, packages and approved dropship products.';
    appendMessage('coach',reply+' HoloGPT is powered by Stubbs AI.');
  }
}
$('#coach-send').onclick=sendHolo;$('#coach-input').addEventListener('keydown',e=>{if(e.key==='Enter')sendHolo();});
$$('.quick-chips button').forEach(b=>b.onclick=()=>{$('#coach-input').value=b.dataset.q;sendHolo();});
$$('.demo-action').forEach(b=>b.onclick=()=>appendMessage('coach',b.dataset.message));

$('#booking-form').onsubmit=async e=>{
  e.preventDefault();setStatus('#booking-status','Saving your request…');
  const service=$('#book-service'),opt=service.options[service.selectedIndex];
  const payload={full_name:$('#book-name').value.trim(),email:$('#book-email').value.trim(),phone:$('#book-phone').value.trim()||null,service_slug:service.value,service_name:opt?.dataset.name||opt?.text||service.value,session_type:$('#book-session').value,preferred_date:$('#book-date').value,notes:$('#book-notes').value.trim()||null,source:new URLSearchParams(location.search).get('utm_source')||'website',status:'requested'};
  const {error}=await db.from('sculptify_bookings').insert(payload);
  if(error){setStatus('#booking-status','Could not save the booking yet. Please try again.',true);return;}
  setStatus('#booking-status','Appointment request received. Sculptify can follow up by email or phone.');e.target.reset();
};

$('#provider-form').onsubmit=async e=>{
  e.preventDefault();setStatus('#provider-status','Submitting profile…');
  const payload={full_name:$('#provider-name').value.trim(),email:$('#provider-email').value.trim(),phone:$('#provider-phone').value.trim()||null,specialty:$('#provider-specialty').value.trim(),license_number:$('#provider-license').value.trim()||null,insurance_provider:$('#provider-insurance').value.trim()||null,status:'submitted'};
  const {error}=await db.from('sculptify_provider_applications').insert(payload);
  if(error){setStatus('#provider-status','Could not submit the profile yet. Please try again.',true);return;}
  setStatus('#provider-status','Profile received. Credentials can be reviewed before publication.');e.target.reset();
};

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
$('#install-app').onclick=async()=>{
  if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;return;}
  $('#install-help').textContent=/iphone|ipad|ipod/i.test(navigator.userAgent)?'On iPhone: tap Share → Add to Home Screen.':'Open your browser menu → Install app / Add to Home screen.';
};

const drawer=$('#owner-drawer');function openOwner(){drawer.classList.add('open')}$('#owner-fab').onclick=openOwner;$('#owner-open').onclick=openOwner;$('#owner-close').onclick=()=>drawer.classList.remove('open');

async function refreshOwner(){
  const {data:{user}}=await db.auth.getUser();
  if(!user){$('#owner-login').hidden=false;$('#owner-tools').hidden=true;return;}
  const {data:admin}=await db.from('sculptify_admins').select('email').eq('user_id',user.id).maybeSingle();
  if(!admin){$('#owner-login').hidden=false;$('#owner-tools').hidden=true;setStatus('#owner-login-status','Signed in, but this account is not the Sculptify owner.',true);return;}
  $('#owner-login').hidden=true;$('#owner-tools').hidden=false;
  $('#setting-name').value=siteSettings.business_name||'SculptifyLTD';
  $('#setting-email').value=siteSettings.business_email||'';
  $('#setting-phone').value=siteSettings.business_phone||'';
  $('#setting-location').value=siteSettings.location||'San Diego, California';
  $('#setting-url').value=siteSettings.site_url||'';
  $('#setting-hero').value=siteSettings.hero_title||'Sculpt Your Body. Heal Your Mind. Build Your Future.';
}
$('#owner-login-btn').onclick=async()=>{
  setStatus('#owner-login-status','Sending secure sign-in link…');
  const redirectTo=location.origin+location.pathname;
  const {error}=await db.auth.signInWithOtp({email:OWNER_EMAIL,options:{emailRedirectTo:redirectTo,shouldCreateUser:true}});
  if(error){setStatus('#owner-login-status','Could not send sign-in link: '+error.message,true);return;}
  setStatus('#owner-login-status','Check '+OWNER_EMAIL+' for the secure Sculptify sign-in link.');
};
$('#settings-form').onsubmit=async e=>{
  e.preventDefault();setStatus('#settings-status','Saving…');
  const changes={business_name:$('#setting-name').value.trim(),business_email:$('#setting-email').value.trim(),business_phone:$('#setting-phone').value.trim()||null,location:$('#setting-location').value.trim(),site_url:$('#setting-url').value.trim()||null,hero_title:$('#setting-hero').value.trim(),updated_at:new Date().toISOString()};
  const {error}=await db.from('sculptify_site_settings').update(changes).eq('id','primary');
  if(error){setStatus('#settings-status','Could not save: '+error.message,true);return;}
  setStatus('#settings-status','Live Sculptify settings saved.');await loadSettings();
};
$('#owner-signout').onclick=async()=>{await db.auth.signOut();await refreshOwner();};

db.auth.onAuthStateChange(()=>setTimeout(refreshOwner,0));
appendMessage('coach','Welcome to SculptifyLTD. I am HoloGPT, powered by Stubbs AI. Ask me about services, booking, certification, staffing or the store.');

Promise.all([loadSettings(),loadServices(),loadCourses(),loadProducts(),loadFaqs()]).then(refreshOwner);
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));