const {assign,entries,keys}=Object
export default function v(selector,props={},...children)
{
	const
	[nodeType,...classes]=selector.split('.'),
	type=(nodeType||'div').toLowerCase(),
	on=entries(props.on||{})
	.reduce((obj,[type,fn])=>assign(obj,{[type]:Array.isArray(fn)?fn:[fn]}),{})
	//@todo map objs to args arrays
	delete props.on
	entries(props.data||{}).forEach(([prop,val])=>props['data-'+prop]=val)
	delete props.data
	classes.length?props.class=(props.class||'')
	.split(' ').filter(x=>x.length).concat(classes).join(' '):''
	return {type,props,children,on}
}
v.util=
{
	equal:(a,b)=>JSON.stringify(a)===JSON.stringify(b)
}
v.util.update=function(fn,el,newObj,oldObj={})
{
	keys(assign({},newObj,oldObj))
	.forEach(prop=>fn(el,prop,newObj[prop],oldObj[prop]))
}

v.changed=(a,b)=>typeof a!==typeof b||typeof a==='string'&&a!==b||a.type!==b.type
v.el=function(node)
{
	if(typeof node==='string') return document.createTextNode(node)

	const el=document.createElement(node.type)
	v.propsSet(el,node.props)//@todo chain these
	v.evtsSet(el,node.on)

	node.children
	.map(v.el)
	.forEach(el.appendChild.bind(el))

	return el
}
v.evtDel=(el,type,args)=>el.removeEventListener(type,...args)
v.evtSet=(el,type,args)=>el.addEventListener(type,...args)
v.evtsSet=function(el,evts)
{
	entries(evts)
	.forEach(([evt,args])=>v.evtSet(el,evt,args))//@todo use reduce here
}
v.propDel=function(el,prop,val)
{
	if(prop==='value') el[prop]=''
	else if(typeof val==='boolean') el[prop]=false
	el.removeAttribute(prop)
}
v.propSet=function(el,prop,val)//@todo handle checked & value
{
	if(prop==='value') el[prop]=val
	else if(typeof val==='boolean') el[prop]=val
	el.setAttribute(prop,val)
}
v.propsSet=function(el,props)//@todo use reduce here
{
	entries(props).forEach(([prop,val])=>v.propSet(el,prop,val))
}
v.update=function(parent,newNode,oldNode,child=parent.childNodes[0])
{
	if(oldNode==null) parent.appendChild(v.el(newNode))
	//@todo remove event listeners as well (for both remove & replace)
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
	return 0// suggest that an element has not been removed
}
v.updateEvts=(...args)=>v.util.update(v.updateEvt,...args)
v.updateEvt=function(el,type,[newFn,...newOpts],[oldFn,...oldOpts])
{
	if(!newFn) removeEvt(el,type,oldVal)
	else if(!oldFn||((''+newFn)!==(''+oldFn)&&v.util.equal(newOpts,oldOpts)))
	{
		v.evtSet(el,type,newVal)
	}
}
v.updateProps=(...args)=>v.util.update(v.updateProp,...args)
v.updateProp=function(el,prop,newVal,oldVal)
{
	if(!newVal) v.propDel(el,prop,oldVal)
	else if(!oldVal||newVal!==oldVal) v.propSet(el,prop,newVal)
}