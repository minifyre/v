import {curry,equal,exists,setAll,updateFactory} from './util.js'

export const
evtDel=(el,type,args)=>el.removeEventListener(type,...args),
//todo:make more generic of onchange emits? (and should this be here?)
evtEmit=(el,changes={})=>el.dispatchEvent(new CustomEvent('render',{bubbles:false,detail:{changes}})),
evtSet=(el,type,args)=>el.addEventListener(type,...args),
evtUpdate=(el,type,newVal=[],oldVal=[])=>
{
	const
	[newFn,...newOpts]=newVal,
	[oldFn,...oldOpts]=oldVal
	if(!exists(newFn)) evtDel(el,type,oldVal)
	else if(!exists(oldFn)) evtSet(el,type,newVal)
	else if ((''+newFn)!==(''+oldFn)||!equal(newOpts,oldOpts))
	{
		evtDel(el,type,oldVal)
		evtSet(el,type,newVal)
	}
	else return 1//same
},
evtsSet=curry(setAll,evtSet),
evtsUpdate=curry(updateFactory,evtUpdate)