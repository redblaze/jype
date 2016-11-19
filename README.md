# jype

jype provides an approach to define formal schemas that precisely
describe JSON data structures.

  * The schema is defined in JSON format.     
  * JSON values can be validate against the schema.
  * Static checking is provided to validate whether the schema is well
    formed.
  * A package system is built in to facilitate modular design.  A
    "depackaging" compilation is provided to transform a schema with
    packages to one without packages, while preserving the semantics.


## Install

```text
npm install jype
```

### Dependencies

```json
    "dependencies": {
        "better-js-class": "*",
        "underscore": "*"
    }
```

## Use

There are three exported values from jype package:
  * Compile: A class for static checking of a schema.
  * TypeCheck: A class for type checking a value against a schema.
  * merge: A function that merges modular schema defintions.

```javascript
var jype = require('jype');
var Compile = jype.Compile;
var TypeCheck = jype.TypeCheck;
var merge = jype.merge;
```

### Compile
```js
var compile = new compile(scope, validators);
compile.compile;
```

### TypeCheck
```js
var typeCheck = new TypeCheck(scope, validators);
typeCheck.run(value, type);
```

### merge

## Types

### String

A JSON value can be a string, who type is represented by the following schema:

```json
{"type": "String"}
```

With this schema, we can have the following validations:

```js
typeCheck.run("abc", {"type": "String"}); // ok
typeCheck.run(123, {"type": "String"});   // error
```

### Number

A JSON value can be a Number, who type is represented by the following schema:

```json
{"type": "Number"}
```

With this schema, we can have the following validations:

```js
typeCheck.run(123, {"type": "Number"});   // ok
typeCheck.run("abc", {"type": "Number"}); // error
```

### Boolean

A JSON value can be a Boolean, who type is represented by the following schema:

```json
{"type": "Boolean"}
```

With this schema, we can have the following validations:

```js
TypeCheck.run(true, {"type": "Boolean"});    // ok
TypeCheck.run(false, {"type": "Boolean"});   // ok
TypeCheck.run("abc", {"type": "Boolean"});   // error
TypeCheck.run(100, {"type": "Boolean"});     // error
```

### Void

A JSON value can be a Void, which means it is free to be anything.  Such type is represented by the following schema:

```json
{"type": "Void"}
```

With this schema, we can have the following validations:

```js
TypeCheck.run(true, {"type": "Void"});    // ok
TypeCheck.run(false, {"type": "Void"});   // ok
TypeCheck.run("abc", {"type": "Void"});   // ok
TypeCheck.run(100, {"type": "Void"});     // ok
```

This type is only useful when used in combination with Union type.

### Array

A JSON value can be an array of elements of a certain type.  We represent the schema of array by:

```json
{
    "type": "Array",
    "element": ElementType
}
```

### Object

### Union

### Alias

## Package

### Enhanced Alias

### Scope

### Module


