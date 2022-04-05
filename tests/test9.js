// test simple array section with nested item properties

import {dst, item} from '../dst.js'

let a = [{props:{name:"Moe"}},{props:{name:"Larry"}},{props:{name:"Curly"}}]

export 
let result = dst`Stooges:${{a}} ${item.props.name} ${{}}`,
	correct = `Stooges: Moe  Larry  Curly `,
	ok = result==correct