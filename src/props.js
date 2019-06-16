import {curry,exists,setAll,updateFactory} from './util.js'

export const
propDel=(el,prop,val)=>
{
	if(prop==='value') el[prop]=''
	else if(typeof val==='boolean') el[prop]=false
	el.removeAttribute(prop)
},
propSet=(el,prop,val)=>
{
	if(prop==='value') el[prop]=val
	else if(typeof val==='boolean') el[prop]=val
	el.setAttribute(prop,val)
},
propUpdate=(el,prop,newVal,oldVal)=>
{
	if(!exists(newVal)) propDel(el,prop,oldVal)
	else if(!exists(oldVal)||newVal!==oldVal) propSet(el,prop,newVal)
	else return 1//same
},
propsSet=curry(setAll,propSet),
propUpdates=curry(updateFactory,propUpdate)