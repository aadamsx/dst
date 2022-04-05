// test simple array section

import {dst, item} from '../dst.js'

let a = ["Moe","Larry","Curly"]

export 
let result = dst`Stooges:${{a}} ${item} ${{}}`,
	correct = `Stooges: Moe  Larry  Curly `,
	ok = result==correct