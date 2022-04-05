# Examples.
`dst` in action

### Boolean Sections.

The outer boolean section gets rendered but the inner one doesn't
#### Input
```javascript
let bool = true, 
    notbool = false,
    result = dst`${{bool}}
This line gets rendered
${{notbool}}
but this one does not
${{}}
${{}}`
```
#### Result
```
This line gets rendered
```

### Array Section.
`item` inside the array section is replaced with the array element on each iteration.
#### Input
```javascript
let a = ["Moe","Larry","Curly"],
    result = dst`Stooges:\n${{a}}  ${item}\n${{}}`
```
#### Result
```
Stooges:
  Moe
  Larry
  Curly

```

## Array section with property access on the `item`
#### Input
```javascript
let a = [{name:"Moe"},{name:"Larry"},{name:"Curly"}],
    result = dst`Stooges:\n${{a}}  ${item.name}\n${{}}`
```
#### Result
```
Stooges:
  Moe
  Larry
  Curly

```

## Boolean Section based on a function.
This marks even numbers in an array. 
#### Input
```javascript
let a = [1,2,3,4,5,6],
    even = v=>v%2==0,
    odd = v=>v%2==1,
    result = dst`${{a}}${item}${{even}} is even${{}}${{odd}} is odd${{}}\n${{}}`
```
#### Result
```
1 is odd
2 is even
3 is odd
4 is even
5 is odd
6 is even
```

## Boolean Section as a Filter.
The `item` refers to the last array section.
#### Input
```javascript
let a = [1,2,3,4,5,6],
    even = v=>v%2==0
    result = dst`${{a}}${{even}}${item} is even\n${{}}${{}}`
```
#### Result
```
2 is even
4 is even
6 is even

```
## Function Substitution.
#### Input:
```javascript
let a = [1,2,3,4],
    result = dst`${{a}} ${item} squared is ${i=>i**2}\n${{}}`
```
#### Result
```
 1 squared is 1
 2 squared is 4
 3 squared is 9
 4 squared is 16
```
## Nested Array Sections.
An array of arrays can be printed out in a table-like template.
#### Input:
```javascript
let a = [[1,2,3], [4,5,6], [7,8]],
    result = dst`${{a}} * ${{item}} element = ${item}, ${{}}\n${{}}`
```
#### Result
```
 *  element = 1,  element = 2,  element = 3, 
 *  element = 4,  element = 5,  element = 6, 
 *  element = 7,  element = 8, 
```
## Getting the Array Index.
You can substitute a function to get the index
#### Input:
```javascript
let a = [1,2,3,4],
    result = dst`${{a}}array[${(v,i)=>i}] = ${item}\n${{}}`
```
#### Result
```
array[0] = 1
array[1] = 2
array[2] = 3
array[3] = 4
```
## Getting the Outer Array item.
The object `item` only reports on the current array item. To get information about the outer one, we have to define a function to save and retrieve it.
#### Input:
```javascript
let a = [[1,2,3],[4,5,6]],
    rowno,
    saverow = (v,i)=>{rowno=i+1;return ''},
    getrow = v=>rowno,
    result = dst`
${{a}}
${saverow}${{item}} (${getrow}, ${item})  ${{}}
${{}}`
```
#### Result
```
 (1, 1)   (1, 2)   (1, 3)  
 (2, 4)   (2, 5)   (2, 6)  
```
## Example of Automatic Line Removal
Lines containing just sections or ends are not passed into the result.
#### Input:
```javascript
let a = [{name:"Moe"},{name:"Larry"},{name:"Curly"}],
    result = dst`Stooges:
<ul>
${{a}}
   <li>${item.name}</li>
${{}}
</ul>`
```
#### Result
```
Stooges:
<ul>
   <li>Moe</li>
   <li>Larry</li>
   <li>Curly</li>
</ul>
```
## Template for a Table.
The template is put inside a function, so it can be called on different table data.
#### Input:
```javascript
function table(headers, body) {
	return dst`<table>
${[v=>headers.length>0]/*header on-off*/}
   <tr>
${{headers}}
${{item}}
       <th>${item}</th>
${{/*of items*/}}
${{/*of headers*/}}
    </tr>
${{/*of header on-off*/}}
${{body}}
    <tr>
${{item}}
       <td>${item}</td>
${{/*of items*/}}
    </tr>
${{/* of body*/}}
</table>`
}

let result = table(['a','b','c'], [[1,2,3],[4,5,6],[7,8,9]])
```
#### Result
```
<table>
   <tr>
       <th>a</th>
       <th>b</th>
       <th>c</th>
    </tr>
    <tr>
       <td>1</td>
       <td>2</td>
       <td>3</td>
    </tr>
    <tr>
       <td>4</td>
       <td>5</td>
       <td>6</td>
    </tr>
    <tr>
       <td>7</td>
       <td>8</td>
       <td>9</td>
    </tr>
</table>
```
