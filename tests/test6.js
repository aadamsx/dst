// test function yielding array section

import {dst, item} from '../dst.js'

let a = v=>[{name:"Moe"},{name:"Larry"},{name:"Curly"}]

export 
let result = dst`Stooges:${{a}} ${item.name} ${{}}`,
	correct = `Stooges: Moe  Larry  Curly `,
	ok = result==correct