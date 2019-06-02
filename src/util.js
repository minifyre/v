export const
{assign,entries,keys}=Object,
changed=(a,b)=>typeof a!==typeof b||typeof a==='string'&&a!==b||a.type!==b.type,
curry=(fn,...xs)=>(...ys)=>fn(...xs,...ys),
equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
exists=x=>x!==null&&x!==undefined,
setAll=(fn,el,obj)=>entries(obj).forEach(([prop,val])=>fn(el,prop,val)),
toString=x=>typeof x==='number'?''+x:x,
updateFactory=(fn,el,newObj,oldObj={})=>
{
	return keys(assign({},newObj,oldObj))
	.filter(prop=>!fn(el,prop,newObj[prop],oldObj[prop]))
},
wrapInArray=x=>Array.isArray(x)?x:[x]
//todo: figure out why istanbul thinks wrapInArray isn't called