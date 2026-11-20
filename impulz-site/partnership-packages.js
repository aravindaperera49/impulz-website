/* Single source of truth for monthly partnership packages on both pages. */
const partnershipPackages = [
  {name:"Starter",price:"$99",features:["Up to 5 design requests","Social media graphics","Basic marketing materials"]},
  {name:"Business",price:"$149",features:["Up to 10 design requests","Social media & marketing","Priority support"],featured:true},
  {name:"Enterprise",price:"$299",features:["Up to 20 design requests","Campaign graphics","Dedicated support"]}
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
    const list=document.createElement('ul');plan.features.forEach(feature=>{const item=document.createElement('li');item.textContent=feature;list.append(item)});card.append(list);
    const link=document.createElement('a');link.className='partner-cta';link.textContent='Get Started →';link.href='https://wa.me/94719696094?text='+encodeURIComponent('Hi IMPULZ! I would like to discuss the '+plan.name+' Partnership monthly plan ('+plan.price+'/month).');link.target='_blank';link.rel='noopener';card.append(link);grid.append(card);
  });
  offers.append(grid);const note=document.createElement('p');note.className='partner-note';note.textContent='USD per month. Final scope, request complexity, turnaround and revisions are agreed before work begins. Publishing, ad spend and account management are not included.';offers.append(note);mount.replaceChildren(offers);
});
