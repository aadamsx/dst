# `dst` - dead simple templates.

`dst` is a very simple template system inspired by mustaches, but built on top of javascript tagged templates.

## Usage.

Here is a quick example showing how to use `dst`

```javascript
import {dst, item} from './path/to/dst.js'

let a = ["Moe","Larry","Curly"],
    str = dst`Stooges:\n${{a}}  ${item}\n${{}}`
```
The value of `str` is:

```
Stooges:
  Moe
  Larry
  Curly
```

A `dst` template is a javascript tagged template which understands **sections**, that can be included, excluded, or repeated multiple times. In the above template, the section starts with `${{a}}` and ends with `${{}}`. The start of the section is a template placeholder `${     }` containing the object literal `{a}`. The end of the section is a placeholder containing an empty object `{}`. Since `a` is an array, the inside of the section is repeated as many times as there are items in the array. Within the section, `item` refers to the current item in the loop.

`dst` handles most other substitutions as if it were a normal template literal.

There are two kinds of section in `dst`: boolean and array. They have the same "syntax".

## Boolean Sections.
A boolean section is a section that is shown or omitted depending on the value of a boolean variable. For example, the code below:
```javascript
let p = false,
    str = dst`shown ${{p}}\n not shown ${{}}`
```
will give `str` the following value:

```
shown
```
The part of the template between the start of the section `${{p}}` and the end `${{}}` is only processed and output if `p` is true.

## Array Sections.

When the variable in the section start is an array, the section is repeated multiple times. For example:

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
The start of the array section in the template is indicated by `${{a}}` and the end of the section is indicated by `${{}}`. The template string between the start and end is looped over as often as there are elements in `a`. Within the loop section, the special object `item` refers to the array element in the loop. 

If the array elements are objects, then we can reference parts of those objects using `item`. For example:

```javascript
let a = [{name:"Moe"},{name:"Larry"},{name:"Curly"}],
    str = dst`Stooges:\n<ul>\n${{a}}   <li>${item.name}</li>\n${{}}</ul>`
```
also gives `str` the same value:
```
Stooges:
<ul>
   <li>Moe</li>
   <li>Larry</li>
   <li>Curly</li>
</ul>
```

## Nested Sections.

The `item` in an array section can be used to start another section. For example:

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
The first occurrence of `item` is `${{item}}` which starts a new array section, since the item is an array.
Within the nested section `${{item}}...${{}}` section, the second occurrence of `item`, namely `${item}`,causes substitution.

The nested section doesn't have to be an array. If it evaluated to a boolean value, the nested section would be included or omitted.

## Functions.

A function can be used in a template substitution or to start a section. 
When used in a template substitution, it takes the current array element or section variable. For example
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

When a function is used as a section, it is called on the current array item or section variable, and the result of that is used as the section value. (If there is no current array item or section, it is passed `undefined`). 

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
The outer section `${{a}}...${{}}` loops over `a`. The inner section starts with `${{stars}}`. The function `stars` is passed the current item of `a`, and returns an array of stars. This array is then looped over to produce each line in the output.

The main use for functions is to process the current array item. However, functions are actually called with the array element (`item`), the array index, and the array, much like a `map` callback. You can use as many or as few of these arguments as you want.

## Using `${[  ]}` instead of `${{  }}` 

A section is marked by a template placeholder containing an object literal. Since arrays are also objects in javascript, a section can start instead with a placeholder containing an array. This is useful if we want to use anonymous variables. For example
```javascript
let str = dst`${[ [1,2,3] ]} ${item} ${{}}`
```
gives `str` the value ``' 1  2  3 '``. 

This feature means you **can't** substitute arrays directly into `dst`, since `${[1,2,3]}` is going to be interpreted as a section (and a *boolean* section, for that matter). Instead, to substitute an array, you need to make it a string by joining it, as `${[1,2,3].join(',')}`. This is what happens to arrays anyway in ordinary template literals.

The main use for this alternative section start `${[  ]}` is if you want to use an anonymous function for the section. The stars example above could then be written as 
```javascript
dst`${{a}} ${[v=>Array(v).fill('*')]} ${item} ${{}}\n${{}}` 
```

## Re-using Templates.

The only way to reuse a `dst` template is to put it in a function. Thus:

```javascript
function stooges(a) {
   return dst`Stooges:\n<ul>\n${{a}}   <li>${item.name}</li>\n${{}}</ul>`
}
stooges([{name:"Moe"},{name:"Larry"},{name:"Curly"}])
```
Writing templates as functions lets you to insert templates within templates. If you pass the function, it is called with the current array item or section variable. If instead you call the function, its output is inserted into the template, as normal.

For example
```javascript
let li = value => dst`<li>${value.name}</li>`, // dst isn't really useful here
    a = [{name:"Moe"},{name:"Larry"},{name:"Curly"}],
    str = dst`Stooges:\n<ul>\n${{a}} ${li}\n${{}}</ul>`
```
does the same as before.

## `item`
The `item` object is a proxy for an identity function `v=>v`. The proxy allows you to access elements of the array element using dot notation. In addition, you can apply additional functions to item by calling it  as if it were a function. For example
```
item.name(n=>'name='+n)
```
will produce an item object that first gets the `.name` property of the array element and then prefixes it with `'name='`. This is a bit clumsy but it's unfortunately the only way an element property can be further modified.

## Join elements, last element.

Sometimes you will want to run an array section where the last element is treated a little differently, or where something is inserted between elements, but not after the last one. You can do this by defining two functions `join` and `last` and using them as boolean sections. The functions are:
```javascript
let join = (v,i,arr)=>(i<arr.length-1),
    last = (v,i,arr)=>(i==arr.length-1)
```
These can be used as follows:
```javascript
let a = [1,2,3],
    str = dst`${{a}} ${item}${{join}},${{}} ${{}}`
```
gives `str` the value `' 1,  2,  3 '`, and
```javascript
let a = [1,2,3],
    str = dst`${{a}} ${item}${{join}},${{}}${{last}}!${{}}${{}}`
```
gives `str` the value `' 1, 2, 3!'`. (However, this could be achieved without using `last`.)
