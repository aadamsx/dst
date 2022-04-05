// test simple array section with functions

import {dst, item} from '../dst.js'

let a = [{name:"Moe"},{name:"Larry"},{name:"Curly"}]

export 
let result = dst`Stooges:${{a}} ${v=>v.name+'*'} ${{}}`,
	correct = `Stooges: Moe*  Larry*  Curly* `,
	ok = result==correct