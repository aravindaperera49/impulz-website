/* Single source of truth for monthly partnership packages on both pages. */
const partnershipPackages = [
  {name:"Starter",price:"$99",features:["Up to 4 promotional flyers per month (print or digital)","OR","Up to 4 social media posts per month","10% off additional design requests"]},
  {name:"Business",price:"$149",features:["Up to 6 promotional flyers per month (print or digital)","Consistent branding across all designs","Premium stock imagery included","10% off additional design requests"],featured:true},
  {name:"Enterprise",price:"$299",features:["$450 in monthly design credits to use across any design services*","Premium, brand-focused designs across all projects","A fresh social media cover design every month","Same-day delivery for urgent requests (subject to availability)","Complimentary minor updates to previously completed designs"]}
];
document.querySelectorAll('[data-partnership-packages]').forEach(mount=>{
  const offers=document.createElement('div');offers.className='partner-offers';
  offers.innerHTML='<span class="eyebrow">OUR PACKAGES</span><h2>'+ 'Ongoing Creative <em class="review-gradient">Partnerships</em>' +'</h2><p>Flexible monthly plans for ongoing design support.</p>';
  const grid=document.createElement('div');grid.className='partner-grid';
  partnershipPackages.forEach(plan=>{
    const card=document.createElement('article');card.className='partner-card'+(plan.featured?' featured':'');
    if(plan.featured){const highlight=document.createElement('span');highlight.className='partner-highlight';highlight.textContent='Most Popular';card.append(highlight)}
    const title=document.createElement('h3');title.textContent=plan.name;card.append(title);
    const price=document.createElement('div');price.className='partner-price';price.textContent=plan.price;const unit=document.createElement('small');unit.textContent='/month';price.append(unit);card.append(price);
    const list=document.createElement('ul');plan.features.forEach(feature=>{const item=document.createElement('li');if(feature==='OR'){item.textContent='OR';item.className='partner-feature-or';}else if(plan.name==='Enterprise'&&feature.startsWith('$450 in monthly design credits')){const strong=document.createElement('strong');strong.textContent='$450 in design credits';item.append(strong,document.createTextNode(feature.slice('$450 in monthly design credits'.length)))}else{item.textContent=feature}list.append(item)});card.append(list);
    if(plan.name==='Enterprise'){const disclaimer=document.createElement('small');disclaimer.className='enterprise-credit-disclaimer';disclaimer.textContent='* Credits are deducted at published service prices. Unused credits expire at the end of each month.';disclaimer.style.cssText='display:block;margin:12px 0;color:#aeb6c7;font-size:11px;line-height:1.55';card.append(disclaimer)}
    const link=document.createElement('a');link.className='partner-cta';link.textContent='Get Started →';link.href='https://wa.me/94779443656?text='+encodeURIComponent('Hi IMPULZ! I would like to discuss the '+plan.name+' Partnership monthly plan ('+plan.price+'/month).');link.target='_blank';link.rel='noopener';card.append(link);grid.append(card);
  });
  offers.append(grid);const note=document.createElement('p');note.className='partner-note';note.textContent='USD per month. Final scope, request complexity, turnaround and revisions are agreed before work begins. Publishing, ad spend and account management are not included.';offers.append(note);mount.replaceChildren(offers);
});
