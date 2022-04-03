# Dead Simple Templates.

`dst` is a very simple template system built on top of javascript tagged templates.

## Usage.

Here is a quick example showing how to use `dst`

```javascript
import {dst, item} from './path/to/dst.js'

let title = "Joe",
    calc = ()=>2+4

var output = dst`${title} spends ${calc()}`
```

Wait, that's just template literals! It is, but `dst` also gives you lightweight mustache-like templating in about 70 lines of code. Read on:

## `dst` Templates.

A `dst` template is a javascript tagged template which understands **sections**, that can be included, excluded, or repeated multiple times. A **section** is a part of the template literal which starts with something that looks like `${{...}}` and ends with `${{}}`.

The outer part of the section, `${     }`, is just a standard template substitution syntax. The inner curly brackets `{...}` create an object which is interpreted by the `dst` function as a section start.

The section end `${{}}` is a template substitution `${...}` of an empty object `{}`.

## Boolean Sections.
A boolean section is shown or omitted depending on the value of a boolean variable. For example:
```javascript
let p = false

console.log(dst`
shown
${{p}}
not shown
${{}}`
```
gives the following output

```
shown

```
Note that `${{p}}` is a template substitution `${...}` of the object literal `{p}`. The `dst` tagged template function picks out objects as sections, since objects aren't any use in normal template literals.

## Array Sections.

When the variable in the section is an array, the section is repeated multiple times. For example:

```javascript
let a = ["Moe","Larry","Curly"]

console.log(dst`Stooges:\n<ul>\n${{a}}   <li>${item}</li>\n${{}}</ul>`)
```
gives the following output:

```
Stooges:
<ul>
   <li>Moe</li>
   <li>Larry</li>
   <li>Curly</li>
</ul>
```
The start of the array section in the template is indicated by `${{a}}` and the end of the section is again indicated by `${{}}`. The template between the start and end is looped over as often as there are elements in `a`. Within the loop section, the special object `item` refers to the array element in the loop. 

If the array elements are objects, then we can reference parts of those objects using `item`. For example:

```javascript
let a = [{name:"Moe"},{name:"Larry"},{name:"Curly"}]

console.log(dst`Stooges:\n<ul>\n${{a}}   <li>${item.name}</li>\n${{}}</ul>`)
```
also gives the following output:

```
Stooges:
<ul>
   <li>Moe</li>
   <li>Larry</li>
   <li>Curly</li>
</ul>
```

## Nested Sections.

If the `item` in an array is itself an array, it can be used to start another section. For example:

```javascript
let a = [[1,2,3], [4,5,6], [7,8]]

console.log(dst`${{a}} * ${{item}} element = ${item}, ${{}}\n${{}}`)
```

gives the following output:

```
 *  element = 1,  element = 2,  element = 3, 
 *  element = 4,  element = 5,  element = 6, 
 *  element = 7,  element = 8, 
```

Within the `${{a}}...${{}}` section, `${item}` refers to the current item in `a`, say `a[i]` However, `${{item}} ...${{}}` is interpreted as a **section** using the current item in `a`. Within that section `${item}` now refers to an element of `a[i]`.

The nexted section doesn't have to be an array. If it evaluated to a boolean value, the nested section would be included or omitted. For example:

```javascript
let a = [[1,2,3], [4,5,6], false, [7,8], true]

console.log(dst`${{a}} * ${{item}} element = ${item}, ${{}}\n${{}}`)
```

gives

```
 *  element = 1,  element = 2,  element = 3, 
 *  element = 4,  element = 5,  element = 6, 
 * 
 *  element = 7,  element = 8, 
 *  element = true, 
```

## Functions.

A function can be used in substitution or as a section. When used in a substitution, it takes the current array element or section variable. For example

```javascript
let a = [1,2,3,4]

console.log(dst`${{a}} ${item} squared is ${v=>v**2}\n${{}}`)
```
gives
```
 1 squared is 1
 2 squared is 4
 3 squared is 9
 4 squared is 16
```

`item` is interpreted as a function `v=>v`, although it's actually a Proxy object.

When a function is used as a section, it also calls the current array item or section variable, and the result of that is used as the section value. (If there is no current array item or section, it is passed `undefined`). For example
```javascript
let a = [1,2,3,4]

console.log(dst`${{a}} ${{x:v=>Array(v).fill('*')}} ${item} ${{}}\n${{}}`)
```
gives
```
  * 
  *  * 
  *  *  * 
  *  *  *  * 
```

Notice in this case we have to give the function a name `x` so the object literal `{x:v=>Array(v).fill('*')}` makes sense as a javascript object. We could pass the function within an array rather than an object and it would also work, i.e. ``${[v=>Array(v).fill('*')]}`` does the same thing as `${{x:v=>Array(v).fill('*')}}`; the only downside to this is you lose the mustaches `{{` and `}}`. 

## Re-using Templates.

The only way to reuse a `dst` template is to put it in a function. Thus:

```javascript
function stooges(a) {
   return dst`Stooges:\n<ul>\n${{a}}   <li>${item.name}</li>\n${{}}</ul>`
}
console.log(stooges([{name:"Moe"},{name:"Larry"},{name:"Curly"}]))
```

Doing this allows you to insert templates within templates. If you pass the function, it is called with the current array item or section variable. If you call the function, its output is inserted into the template, as normal.

For example
```javascript
let li = value => dst`<li>${value.name}</li>`, // dst isn't really useful here
    a = [{name:"Moe"},{name:"Larry"},{name:"Curly"}]

console.log(dst`Stooges:\n<ul>\n${{a}} ${li}\n${{}}</ul>`)
```
does the same as before.