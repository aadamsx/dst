
// dst = dead simple templates. Based on tagged templates


function valueof(section) {
	// a section is a substituted object literal with a single item e.g. {a} 
	// valueof({a}) returns a
	return Object.values(section)[0]
}

function is(v) {
	// returns the type of substitution we have in the template:
	// 'loop' - an object
	// 'end' - an empty object
	// 'var' - item or function
	if (typeof v == 'function') {
		return 'var'
	}
	if (typeof v == 'object') {
		return valueof(v) == undefined ? 'end' : 'section'
	}
}

export function dst(strings, ...values) {
	// dst - dead simple templates. 
	
	// detect the begin and end of each section
	// contained in the values array
	let sections = {}, 
		stack = []
	for (let i = 0; i < values.length; i++) {
		switch (is(values[i])) {
			case 'section':
				// start of section at values[i]
				stack.push(i)
				break
			case 'end':
				// end of section that started at stack[-1]
				if (stack.length==0) {
					throw `End section at position ${i} has no start`
				}
				sections[stack.pop()] = i
				break
		}
	}
	if (stack.length>0) {
		throw `Start section at position ${stack.pop()} has no matching end`
	}
	
	// render the template
	return render(strings, values, sections, [], 0, strings.length)
}

function render(strings, values, sections, loopstack, start, end) {
	// render the dst
	// strings, values are the template string elements
	// sections[i] gives the value which ends the section
	// loopstack holds the loop variables
	// start, end are the indices into the strings for the current section
	
	let output = ''

	// loop over (string, value) pairs
	for (let i = start; i < end - 1; i++) {
		// add string
		output += strings[i]
		// process paired value
		let val = values[i]
		switch (is(val)) {
			case 'section':
				val = valueof(val)
				// check for nested or function sections
				if (is(val) == 'var') {
					// val is a function reference to the outer loop variate
					val = val(...[].concat(loopstack.at(-1)))
				}
				if (Array.isArray(val)) {
					// a loop section
					for (let k = 0; k < val.length; k++) {
						loopstack.push([val[k], k, val])
						output += render(strings, values, sections, loopstack, i + 1, sections[i] + 1)
						loopstack.pop()
					}
				} else if (val) {
					// a boolean section
					loopstack.push([val])
					output += render(strings, values, sections, loopstack, i + 1, sections[i] + 1)
					loopstack.pop()
				}
				i = sections[i]
				break
			case 'var':
				// var is an item/function called on the current loopstack values
				output += val(...[].concat(loopstack.at(-1)))
				break
			default:
				// normal template literal behaviour
				output += val
		}
	}
	// add the unpaired string
	return output + strings[end - 1]
}

// item handler
let handler = {
	apply: function (target, thisarg, args) {
		if (typeof args[0] == 'function') {
			// composit the function with the existing one in target
			return new Proxy((v,i,a) => args[0](target(v,i,a)), handler)
		} else {
			// called by render
			return target(...args)
		}
	},
	get: function (target, prop, receiver) {
		// access properties of the loopvar
		return new Proxy((v,i,a) => target(v,i,a)[prop], handler)
	}
}

// item proxy; note that is(item)=='var' because it's typed as a function
export let item = new Proxy((v,i,a) => v, handler)

