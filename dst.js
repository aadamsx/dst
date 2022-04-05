
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
	
	//strings is read only so we make a copy so dropline will work
	strings = [...strings]
	
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
	
	// change strings so isolated sections and ends don't make it into the final product
	let strs = [...strings]
	for (let i=0; i<values.length; i++) {
		if (['section', 'end'].includes(is(values[i])) && strings[i].endsWith('\n') && strings[i+1].startsWith('\n')) {
			strs[i+1] = strs[i+1].slice(1)
		}
	}
	// deal with the first value, which might be `${{...}}\n or `\n${{..}}\n 
	if (['section', 'end'].includes(is(values[0])) && ['','\n'].includes(strings[0]) && strings[1].startsWith('\n')) {
		strs[1] = strings[1].slice(1)
		if (strs[0]=='\n') {
			strs[0]=''
		}
	}
	// render the template
	return render(strs, values, sections, [], 0, strings.length)
}

function render(strings, values, sections, loopvar, start, end) {
	// render the dst
	// strings, values are the template string elements
	// sections[i] gives the value which ends the section
	// loopvar holds the current loop variable
	// start, end are the indices into the strings for the current section
	
	let output = ''

	// loop over (string, value) pairs
	for (let i = start; i < end-1; i++) {
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
					val = val(...[].concat(loopvar))
				}
				if (Array.isArray(val)) {
					// a loop section
					for (let k = 0; k < val.length; k++) {
						output += render(strings, values, sections, [val[k], k, val], i + 1, sections[i] + 1)
					}
				} else if (val) {
					// a boolean section
					output += render(strings, values, sections, [val], i + 1, sections[i] + 1)
				}
				i = sections[i]
				break
			case 'var':
				// var is an item/function called on the current loopvar
				output += val(...[].concat(loopvar))
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
		return target(...args)
	},
	get: function (target, prop, receiver) {
		// access properties of the loopvar
		return new Proxy((v,i,a) => target(v,i,a)[prop], handler)
	}
}

// item proxy; note that is(item)=='var' because it's typed as a function
export let item = new Proxy((v,i,a) => v, handler)

