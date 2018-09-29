const
{assign,entries,keys}=Object,
curry=(fn,...xs)=>xs.length>=fn.length?fn(...xs):(...ys)=>curry(fn,...xs,...ys)
export default function v(selector,props={},...children)
{
	const
	[nodeType,...classes]=selector.split('.'),
	type=(nodeType||'div').toLowerCase(),
	on=entries(props.on||{})
	.reduce((obj,[type,fn])=>assign(obj,{[type]:Array.isArray(fn)?fn:[fn]}),{})
	delete props.on
	entries(props.data||{}).forEach(([prop,val])=>props['data-'+prop]=val)
	delete props.data
	classes.length?props.class=(props.class||'')
	.split(' ').filter(x=>x.length).concat(classes).join(' '):''
	return {type,props,children,on}
}
v.util=
{
	curry,
	equal:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
	setAll:(fn,el,obj)=>entries(obj).forEach(([prop,val])=>fn(el,prop,val)),
	update:function(fn,el,newObj,oldObj={})
	{
		keys(assign({},newObj,oldObj))
		.forEach(prop=>fn(el,prop,newObj[prop],oldObj[prop]))
	}
}
v.changed=(a,b)=>typeof a!==typeof b||typeof a==='string'&&a!==b||a.type!==b.type
v.el=function(node)
{
	if(typeof node==='string') return document.createTextNode(node)

	const el=document.createElement(node.type)
	v.setProps(el,node.props)//@todo chain these
	v.setEvts(el,node.on)
	node.children.forEach(child=>el.appendChild(v.el(child)))
	return el
}
v.evtDel=(el,type,args)=>el.removeEventListener(type,...args)
v.evtSet=(el,type,args)=>el.addEventListener(type,...args)
v.propDel=function(el,prop,val)
{
	if(prop==='value') el[prop]=''
	else if(typeof val==='boolean') el[prop]=false
	el.removeAttribute(prop)
}
v.propSet=function(el,prop,val)
{
	if(prop==='value') el[prop]=val
	else if(typeof val==='boolean') el[prop]=val
	el.setAttribute(prop,val)
}
v.update=function(parent,newNode,oldNode,child=parent.childNodes[0])
{
	if(oldNode==null) parent.appendChild(v.el(newNode))
	else if(newNode==null) return parent.removeChild(child),-1
	else if(v.changed(newNode,oldNode)) parent.replaceChild(v.el(newNode),child)
	else if(newNode.type)
	{
		v.updateEvts(child,newNode.on,oldNode.on)
		v.updateProps(child,newNode.props,oldNode.props)
		const max=Math.max(newNode.children.length,oldNode.children.length)
		let adj=0
		for (let i=0;i<max;i++)
		{
			adj+=v.update
			(
				child,
				newNode.children[i],
				oldNode.children[i],
				child.childNodes[i+adj]
			)
		}
	}
	return 0//element has not been removed
}
v.updateEvt=function(el,type,[newFn,...newOpts],[oldFn,...oldOpts])
{
	if(!newFn) v.evtDel(el,type,oldVal)
	else if(!oldFn) v.evtSet(el,type,newVal)
	else if ((''+newFn)!==(''+oldFn)||!v.util.equal(newOpts,oldOpts))
	{
		v.evtDel(el,type,oldVal)
		v.evtSet(el,type,newVal)
	}
}
v.updateProp=function(el,prop,newVal,oldVal)
{
	if(!newVal) v.propDel(el,prop,oldVal)
	else if(!oldVal||newVal!==oldVal) v.propSet(el,prop,newVal)
}
v.setEvts=curry(v.util.setAll,v.evtSet)
v.setProps=curry(v.util.setAll,v.propSet)
v.updateEvts=curry(v.util.update,v.updateEvt)
v.updateProps=curry(v.util.update,v.updateProp)