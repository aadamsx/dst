# `dst` - dead simple templates.

`dst` is a very simple template system inspired by [mustaches.js](https://github.com/janl/mustache.js/), but built on top of javascript tagged templates.

## Usage.

Here is a quick example showing how to use `dst`

```javascript
import {dst, item} from './path/to/dst.js'

let a = ["Moe","Larry","Curly"],
    str = dst`Stooges:\n${{a}}  ${item}\n${{}}`
```
The value of `str` is then:
```
Stooges:
  Moe
  Larry
  Curly
```

A `dst` template is a javascript tagged template which understands **sections**, that can be included, excluded, or repeated multiple times. In the above example, the section starts with `${{a}}` and ends with `${{}}`. The start of the section is a template placeholder `${     }` containing the object literal `{a}`. The end of the section is a placeholder containing an empty object `{}`. When `a` is an array, the inside of the section is repeated as many times as there are items in the array. Within the section being repeated, `item` refers to the current item in the loop.

`dst` handles most other substitutions as if it were a normal template literal.

There are two kinds of section in `dst`: boolean and array. 

## Boolean Sections.
A boolean section is shown or omitted depending on the value of a boolean variable. For example, the code below:
```javascript
let p = false,
    str = dst`shown ${{p}} not shown ${{}}`
```
will give `str` the following value:

```
shown 
```
The part of the template between the start of the section `${{p}}` and the end `${{}}` is only processed and output if `p` is true.

## Array Sections.

When the variable in the section is an array, the inside of the section is repeated multiple times. For example:

```javascript
let a = ["Moe","Larry","Curly"],
    str = dst`Stooges:\n<ul>\n${{a}}   <li>${item}</li>\n${{}}</ul>`
```
The value of `str` is then
```
Stooges:
<ul>
   <li>Moe</li>
   <li>Larry</li>
   <li>Curly</li>
</ul>
```
The start of the array section is indicated by `${{a}}` and the end of the section is indicated by `${{}}`. You can optionally put a comment inside the end to link it visually to the start, for example `${{/*a*/}}`. The template string between the start and end is looped over as often as there are elements in `a`. Within the loop section, the special object `item` refers to the array element in the loop. 

If the array elements are objects, then we can reference parts of those objects using `item`. For example:

```javascript
let a = [{name:"Moe"},{name:"Larry"},{name:"Curly"}],
    str = dst`Stooges:\n<ul>\n${{a}}   <li>${item.name}</li>\n${{}}</ul>`
```
also gives:
```
Stooges:
<ul>
   <li>Moe</li>
   <li>Larry</li>
   <li>Curly</li>
</ul>
```

## Template Line Removal.

It can aid readability to put the sections and ends on lines by themselves. This would ordinarily create line breaks in the template output so to avoid this, `dst` spots sections that are on lines by themselves and removes the newline. For example
```javascript
str = dst`Stooges:
<ul>
${{a}}
   <li>${item.name}</li>
${{}}
</ul>`
```
...will produce the same output as the previous example; no extra lines are inserted where the section start `${{a}}` and end `${{}}` are in the template because they are on lines by themselves. 

If you actually **do** want a newline next to a section start or end, you have to insert an extra new line in the template to create it.

## Nested Sections.

The `item` object can be used to start another section within the existing one. For example:

```javascript
let a = [[1,2,3], [4,5,6], [7,8]],
    str = dst`${{a}} * ${{item}} element = ${item}, ${{}}\n${{}}`
```
gives `str` the following value:
```
 *  element = 1,  element = 2,  element = 3, 
 *  element = 4,  element = 5,  element = 6, 
 *  element = 7,  element = 8, 
```
The first occurrence of `item` is `${{item}}` which starts a new array section, since in this case the item is an array. Within the nested `${{item}}...${{}}` section, the `${item}` causes substitution of the item value.

The nested section doesn't have to be an array. If it evaluated to a boolean value, the nested section would be included or omitted.

## Functions.

A function can be used in a template substitution or to start a section. 
When used in a template substitution, the function is given the current array item. For example
```javascript
let a = [1,2,3,4],
    str = dst`${{a}} ${item} squared is ${i=>i**2}\n${{}}`
```
gives `str` the value
```
 1 squared is 1
 2 squared is 4
 3 squared is 9
 4 squared is 16
```

When a function is used as a section, it is called using the current array item as an argument (even if inside a boolean section), and the return value of that is used as the section value. (If there is no current array item, it is passed `undefined`). 

For example:
```javascript
let a = [1,2,3,4],
    stars = v=>Array(v).fill('*'),
    str = dst`${{a}} ${{stars}} ${item} ${{}}\n${{}}`
```
gives `str` the value
```
  * 
  *  * 
  *  *  * 
  *  *  *  * 
```
The outer section `${{a}}...${{}}` loops over `a`. The inner section starts with `${{stars}}`. The function `stars` is passed the current item of `a` (1 or 2 or 3 or 4), and returns an array of stars. This array creates an array section which is then looped over to produce each line in the output.

Functions in a template are called with three arguments:
* the array element (i.e. the `item`).
* the array index, `undefined` if in a boolean section.
* the array being looped over, `undefined` if in a boolean section.

much like a `map` callback. You can use as many or as few of these arguments as you want.

> Note that `item` is actually a proxy for the identity function `v=>v`, and `item.prop` is a proxy
> for `v=>v[prop]`.

## Using `${[  ]}` instead of `${{  }}` 

A section is marked by a template placeholder containing an object literal. Since arrays are also objects in javascript, a section can start instead with a placeholder containing an array. This is useful if we want to use anonymous variables. For example
```javascript
let str = dst`${[ [1,2,3] ]} ${item} ${{}}`
```
gives `str` the value ``' 1  2  3 '``. 

This feature means you **can't** substitute arrays directly into `dst`, since `${[1,2,3]}` is going to be interpreted as a section (and a *boolean* section, for that matter, with a value of 1). Instead, to substitute an array, you need to make it a string by joining it, as `${[1,2,3].join(',')}`. This is what happens to arrays anyway in ordinary template literals.

## Re-using Templates.

The only way to reuse a `dst` template is to put it in a function. Thus:

```javascript
function stooges(a) {
   return dst`Stooges:\n<ul>\n${{a}}   <li>${item.name}</li>\n${{}}</ul>`
}
stooges([{name:"Moe"},{name:"Larry"},{name:"Curly"}])
```
Writing templates as functions lets you to insert templates within templates. If you put the function in a template substitution, it is called with the current array item or section variable. 

For example
```javascript
let li = value => dst`<li>${value.name}</li>`, // dst doesn't do anything special here
    a = [{name:"Moe"},{name:"Larry"},{name:"Curly"}],
    str = dst`Stooges:\n<ul>\n${{a}} ${li}\n${{}}</ul>`
```
does the same as before.

## Join elements.

Sometimes you will want to run an array section where something is inserted between elements, but not after the last one. You can do this by defining a function `j` which detects whether its at the end of the array, and use it to define a boolean section. The function is:
```javascript
let j = (v,i,arr)=>(i<arr.length-1)
```
These can be used as follows:
```javascript
let a = [1,2,3],
    str = dst`${{a}} ${item}${{j}},${{}}${{}}`
```
The `${{j}}` section contains a comma. When `j` evaluates to true, the comma is inserted in the result, and when false (at the end of the array) the comma isn't inserted. The example gives `str` the value `' 1,  2,  3'`.