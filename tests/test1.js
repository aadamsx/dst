// test simple boolean sections

import {dst, item} from '../dst.js'

let a = true,
	b = false

export 
let result = dst`start ${{a}} included ${{}} ${{b}} not included ${{}}`,
	correct = `start  included  `,
	ok = result==correct