// test nested array section

import {dst, item} from '../dst.js'

let a = [["Moe","Howard"],["Larry","Fine"],["Curly","Joe","deRita"]]

export 
let result = dst`Stooges:${{a}} ${{item}} ${item} ${{}}${{}}`,
	correct = `Stooges:  Moe  Howard   Larry  Fine   Curly  Joe  deRita `,
	ok = result==correct