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

```javascript
var jype = require('jype');
var Compile = jype.Compile;
var TypeCheck = jype.TypeCheck;
var merge = jype.merge;
```

## Types

### String

A JSON value can be a string, who type is represented by the following schema:

```json
{"type": "String"}
```

With this schema, we can have the following validations:

```js
TypeCheck.run("abc", {"type": "String"}); // returns true;
TypeCheck.run(123, {"type": "String"});   // returns false;
```

### Number

A JSON value can be a Number, who type is represented by the following schema:

```json
{"type": "Number"}
```

With this schema, we can have the following validations:

```js
TypeCheck.run(123, {"type": "Number"});   // returns true;
TypeCheck.run("abc", {"type": "Number"}); // returns false;
```

### Boolean

A JSON value can be a Boolean, who type is represented by the following schema:

```json
{"type": "Boolean"}
```

With this schema, we can have the following validations:

```js
TypeCheck.run(true, {"type": "Number"});   // returns true;
TypeCheck.run(false, {"type": "Number"});   // returns true;
TypeCheck.run("abc", {"type": "Number"}); // returns false;
TypeCheck.run(100, {"type": "Number"}); // returns false;
```

### Void

A JSON value can be a Void, which means it is free to be anything.  Such type is represented by the following schema:

```json
{"type": "Void"}
```

With this schema, we can have the following validations:

```js
TypeCheck.run(true, {"type": "Number"});   // returns true;
TypeCheck.run(false, {"type": "Number"});   // returns true;
TypeCheck.run("abc", {"type": "Number"}); // returns true;
TypeCheck.run(100, {"type": "Number"}); // returns true;
```

This type is only useful when used in combination with Union type.

### Array

A JSON value can be an array of elements of a certain type.  We represent the schema of array by:

```json
{
    "type": "Array",
    "element": [ElementType]
}
```

### Object

### Union

### Alias

## Package

### Enhanced Alias

### Scope

### Module


