
// dst = dead simple templates. Based on tagged templates


function valueof(section) {
	return Object.values(section)[0]
}

function is(v) {
	// section: {array} or {item-type} or {value}
	// end: {}
	// var: item-type (seen as a function)
	if (typeof v == 'function') {
		return 'var'
	}
	if (typeof v == 'object') {
		return valueof(v) == undefined ? 'end' : 'section'
	}
}

export function dst(strings, ...values) {
	// compile the sections
	let sections = {}, stack = []
	for (let i = 0; i < values.length; i++) {
		if (is(values[i]) == 'section') {
			stack.push(i)
		} else if (is(values[i]) == 'end') {
			sections[stack.pop()] = i
		}
	}
	return render(strings, values, sections, [], 0, strings.length)
}

function render(strings, values, sections, loopstack, start, end) {
	let output = ''

	for (let i = start; i < end - 1; i++) {
		// add string
		output += strings[i]
		// process paired value
		let val = values[i]
		switch (is(val)) {
			case 'section':
				// check for loop var
				val = valueof(val, is(val))
				if (is(val) == 'var') {
					// reference to the outer loop variate
					val = val(...loopstack.at(-1))
				}
				if (Array.isArray(val)) {
					// a loop section
					for (let k = 0; k < val.length; k++) {
						loopstack.push([val[k], k, val])
						output += render(strings, values, sections, loopstack, i + 1, sections[i] + 1)
						loopstack.pop()
					}
				} else if (val) {
					// an if section
					loopstack.push([val])
					output += render(strings, values, sections, loopstack, i + 1, sections[i] + 1)
					loopstack.pop()
				}
				i = sections[i]
				break
			case 'var':
				output += val(...loopstack.at(-1))
				break
			default:
				// direct substitution - normal template literal behaviour
				output += val
		}
	}
	return output + strings[end - 1]
}

let handler = {
	apply: function (target, thisarg, args) {
		if (typeof args[0] == 'function') {
			return new Proxy((v,i,a) => args[0](target(v,i,a)), handler)
		} else {
			// call the target function
			return target(...args)
		}
	},
	get: function (target, prop, receiver) {
		return new Proxy((v,i,a) => target(v,i,a)[prop], handler)
	}
}
export let item = new Proxy((v,i,a) => v, handler) // typeof item is 'function'

window.dst = dst
window.item = item
