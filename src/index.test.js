import cherub from '../../cherub/'
import {performance} from 'perf_hooks'
import v from './index.js';
import {wrapInArray} from './util.js'

//setup clientside env
import {JSDOM} from 'jsdom'
const dom=new JSDOM(`<!DOCTYPE html>`)
//can't destructure these without losing this context
global.document=dom.window.document
global.CustomEvent=dom.window.CustomEvent

const
anchor=
{
	type:'a',
	props:{href:'#id'},
	children:['link'],
	on:{}
},
selectorClass=
{
	type:'div',
	props:{class:'class name'},
	children:[],
	on:{}
},
data=
{
	type:'a',
	props:{'data-bool': true, 'data-num': 0 },
	children:[],
	on:{}
},
evtHandler=x=>x,
hasEventHandlers={
	type:'a',
	props:{ href: '#id' },
	children:[],
	on:{touchstart:[evtHandler]}
},
renderRtn=`<a lang="es">link</a>`,

tests=
[
	[v('a',{href:'#id'},'link'),anchor,'v'],
	//todo:bind this selector with the value defined earlier
	[v('.class.name'),selectorClass,'v(.selectorOnly)'],
	[v('a',{data:{bool:true,num:0}}),data,'data-props'],
	[v('a',{href:'#id',on:{touchstart:evtHandler}}),hasEventHandlers,'evtHandlers'],
	[function()
	{
		const
		state={type:'a',props:{class:'class name',href:'#id',title:''},txt:'link'},
		mkView=({type,props,txt})=>[v(type,props,txt)],
		condition=()=>true,//todo: needs to return false sometimes for full coverage
		renderer=v.render(document.body,state,mkView,condition)

		delete state.props.title
		renderer()//deleted prop

		state.props.title='new content'
		renderer()//changed prop todo: (doesn't work because state mutated?)

		state.props.on={click:[x=>x,{}]}
		state.props.lang='en'
		renderer()//new prop

		state.props={lang:'es'}
		renderer()

		renderer()//same

		return document.body.innerHTML

	},renderRtn,'render'],
	//todo: why doesn't istanbul think wrapInArray is called?
	[()=>wrapInArray(1),[1],'wrapInArray (unwrapped)'],
	[()=>wrapInArray([1]),[1],'wrapInArray (prewraped)']
]

cherub(tests,{now:()=>performance.now()})