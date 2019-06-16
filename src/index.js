import {assign,entries,toString,wrapInArray} from './util.js'
import {updateElements} from './elements.js'

const curry=(fn,...xs)=>xs.length>=fn.length?fn(...xs):(...ys)=>curry(fn,...xs,...ys)

export default function v(selector,props={},...children)
{
	const
	[nodeType,...classes]=selector.split('.'),
	type=(nodeType||'div').toLowerCase(),

	on=entries(props.on||{})
		.reduce((obj,[type,fn])=>assign(obj,{[type]:wrapInArray(fn)}),{})
	delete props.on

	entries(props.data||{})
		.forEach(([prop,val])=>props['data-'+prop]=val)
	delete props.data

	classes.length?
		props.class=(props.class||'')
			.split(' ')
			.filter(x=>x.length)
			.concat(classes)
			.join(' '):
		''

	return {type,props,children:children.map(toString),on}
}
v.render=curry((root,mkView,state,condition=()=>true)=>
{
	let oldNodes=updateElements(root,mkView(state))

	if(!Array.isArray(oldNodes))
	throw new Error(`The view generator funciton must return an array`)

	return (...args)=>
	{
		if(condition(...args)) oldNodes=updateElements(root,mkView(state),oldNodes)
	}
})