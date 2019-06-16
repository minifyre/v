import {changed,curry} from './util.js'
import {evtEmit,evtsSet,evtsUpdate} from './events.js'
import {propsSet,propUpdates} from './props.js'

export const
element=(node='')=>
{
	if(typeof node==='string'||typeof node==='number')
		return document.createTextNode(node)

	const el=document.createElement(node.type)

	propsSet(el,node.props)//@todo chain these
	evtsSet(el,node.on)
	node.children.forEach(child=>el.appendChild(element(child)))

	return el
},
updateElement=(parent,newNode,oldNode,child=parent.childNodes[0])=>
{
	if(oldNode==null) evtEmit(parent.appendChild(element(newNode)))
	else if(newNode==null) return parent.removeChild(child),-1
	else if(changed(newNode,oldNode)) parent.replaceChild(element(newNode),child)
	else if(newNode.type)
	{
		const changes=
		[
			...evtsUpdate(child,newNode.on,oldNode.on),
			...propUpdates(child,newNode.props,oldNode.props)
		]
		if(changes.length) evtEmit(child,changes)
		const max=Math.max(newNode.children.length,oldNode.children.length)
		let adj=0
		for (let i=0;i<max;i++)
		{
			adj+=updateElement
			(
				child,
				newNode.children[i],
				oldNode.children[i],
				child.childNodes[i+adj]
			)
		}
	}
	return 0//element has not been removed
},
updateElements=(root,newNodes,oldNodes=[])=>
{
	const update=curry(updateElement,root)

	newNodes.forEach((node,i)=>update
	(
		node,
		oldNodes[i]||null,//null does not trigger default params
		root.childNodes[i]||null
	))
	return newNodes
}