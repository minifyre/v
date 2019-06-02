import { terser } from "rollup-plugin-terser";

export default {
	input: 'src/index.js',
	output:
	{
		file: 'index.js',
		format: 'esm',
		sourcemap:true
	},
	//perserves v.render, but mangles private utils
	plugins:[terser({keep_fnames:true})]
}