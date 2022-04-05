// test line removal part 2

import {dst, item} from '../dst.js'

let a = [1,2,3,4]

export 
let result = dst`
${{a}}
${item}
${{}}
`,
	correct = `1
2
3
4
`,
	ok = result==correct