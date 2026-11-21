// Node 22+, no dependencies. Never log credential-bearing request URLs.
const fs = require('node:fs/promises');
const queries = ['hospitality','retail','warehouse','admin','office','IT'];
const rules = [
 ['pr_required', /\b(PR required|permanent residency|permanent resident|citizenship|citizen only|full working rights|unrestricted working rights)\b/i],
 ['sponsor', /\b(sponsorship available|visa sponsorship|willing to sponsor|482|TSS)\b/i],
 ['friendly', /\b(student visa|working holiday|visa holders)\b/i]
];
function classify(text){for(const [visaStatus,re] of rules){const match=text.match(re);if(match)return {visaStatus,badgeReason:match[0]};}return {visaStatus:'friendly',badgeReason:'No visa-related requirements mentioned in the listing.'};}
const clean = text => String(text||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
async function main(){
 const id=process.env.ADZUNA_APP_ID, key=process.env.ADZUNA_APP_KEY;
 if(!id||!key)throw new Error('Missing ADZUNA_APP_ID or ADZUNA_APP_KEY repository secret.');
 const jobs=[], seen=new Set();
 for(const category of queries){
  const url=new URL('https://api.adzuna.com/v1/api/jobs/au/search/1');
  url.search=new URLSearchParams({app_id:id,app_key:key,where:'Melbourne, Victoria',distance:'30',what:category,results_per_page:'10','content-type':'application/json'});
  let response;try{response=await fetch(url,{signal:AbortSignal.timeout(30000)});}catch{throw new Error('Adzuna request failed or timed out; existing jobs.json preserved.');}
  if(!response.ok)throw new Error('Adzuna HTTP '+response.status+'; check credentials/quota. Existing jobs.json preserved.');
  let data;try{data=await response.json();}catch{throw new Error('Invalid Adzuna JSON response.');}
  if(!Array.isArray(data.results))throw new Error('Adzuna results missing.');
  for(const job of data.results){
   if(!job.title||!job.redirect_url||seen.has(job.id||job.redirect_url))continue;
   seen.add(job.id||job.redirect_url);
   const title=clean(job.title), description=clean(job.description);
   const salary=[job.salary_min,job.salary_max].filter(v=>Number.isFinite(v)&&v>0).map(v=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0}).format(v));
   jobs.push({title,company:clean(job.company?.display_name)||'Company not supplied',pay:salary.length?salary.join(' – ')+' / year'+(String(job.salary_is_predicted)==='1'?' (Adzuna estimate)':''):'Salary not listed',suburb:clean(job.location?.display_name)||'Melbourne',description:description.slice(0,350),posting:description,category,icon:'▤',url:job.redirect_url,...classify(title+' '+description)});
  }
 }
 if(!jobs.length)throw new Error('Adzuna returned no usable jobs; existing jobs.json preserved.');
 const temp='jobs.json.tmp';await fs.writeFile(temp,JSON.stringify(jobs.slice(0,60),null,2)+'\n');await fs.rename(temp,'jobs.json');
 console.log('Saved '+Math.min(jobs.length,60)+' Melbourne jobs.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
