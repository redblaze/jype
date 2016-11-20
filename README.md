# jype

jype provides an approach to define formal schemas that precisely
describe JSON data structures.
  * The schema is defined in JSON format.
  * JSON values can be validate against the schema.
  * Static checking is provided to validate whether the schema is well formed.
  * A package system is built in to facilitate modular design.  A "depackaging" compilation is provided to transform a schema with packages to one without packages, while preserving the semantics.

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

To use the Compile class, a compile object needs to be created first, with a scope and a set of validators.  Scope and Validators will be introduced in details in later sections of this document.

```js
var compile = new Compile(scope, validators);
compile.compile();
```

Calling compile method of the compile object will perform a static analysis on the given scope to check its well-formedness.  Detailed error messages will be given if the scope has errors in it.

### TypeCheck

To use the TypeCheck class, a typeCheck object needs to be created first, with a scope and a set of validators.  Scope and validators will be introduced in details in later sections of this document.

```js
var typeCheck = new TypeCheck(scope, validators);
typeCheck.run(value, type);
```

Calling run method of the typeCheck object will check, in the given scope and with the given validators, if the given value matches the given type.  Detailed error messages will be given if the value does not match the type.

### merge

## Types

A type is itself a JSON value that represents the type of a certain type of JSON values.  We list all possible types as follows.

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
    "element": [ElementType]
}
```

where [ElementType] is also a type definition.  For instance, the type of arrays of strings can be represented as follows:

```js
var ArrayOfString = {
    "type": "Array",
    "element": {"type": "String"}
};
typeCheck.run(["a", "bc", "def"], ArrayOfString); // ok
typeCheck.run(["a", 2, "bc"], ArrayOfString);     // error, because 2 is not a string
```

### Object

A JSON value can be an object consisting of a list of fields.  This can be represented by the following type:

```json
{
    "type": "Object",
    "fields": {
        "fieldName1": [FieldType1],
        "fieldName2": [FieldType2],
        // ...
    }
}
```

where [FieldType1], [FieldType2] are also type defnitions.  For instace, the type of an employee can be represented as follows:

```js
var Employee = {
    "type": "Object",
    "fields": {
        "firstName": {"type": "String"},
        "lastName": {"type": "String"},
        "age": {"type": "Number"}
    }
};

typeCheck.run({
    "firstName": "Mike",
    "lastName": "Lee",
    "age": 35
}, Employee); // ok

typeCheck.run({
    "firstName": "Mike",
    "lastName": "Lee",
    "age": "thirty-five"
}, Employee); // error, age field needs to be a number.
```

### Union

A JSON value can be an union presenting a certain type of value among a given list of predefined variants.  This can be represented by the following type:

```json
{
    "type": "Union",
    "variants": {
        "variantName1": [VariantType1],
        "variantName2": [VariantType2],
        // ...
    }
}
```

where [VariantType1], [VariantType2] are also type defnitions.  For instance, the type of roles can be repsented by the following type:

```js
var Role = {
    "type": "Union",
    "variants": {
        "developer": {
            "type": "Object",
            "fields": {
                "programmingLanguage": {"type": "String"}
            }
        },
        "marketing": {
            "type": "Object",
            "fields": {
                "socialNetwork": {"type": "String"},
                "CRM": {"type": "String"}
            }
        },
        "projectManager": {
            "type": "Object",
            "fields": {
                "process": {"type": "String"}
            }
        }
    }
};

typeCheck.run({"developer": {"programmingLanguage": "Javascript"}, Role};  // ok
typeCheck.run({"marketing": {"socialNetwork": "twitter", "CRM": "ExactTarget"}, Role};  // ok
typeCheck.run({"projectManager": {"process": "agile"}, Role};  // ok
typeCheck.run({"developer": {"process": "agile"}, Role};  // error, developer variant does not have process field
```

Note that each JSON value with of union type is a singleton object, where the unique key identifies the variant.  Particularly, enumerations can be defined as a union.  For instance:

```js
var Gender = {
    "type": "Union",
    "variants": {
        "male": {"type": "Void"},
        "female": {"type": "Void"}
    }
};
```

So the JSON value representing male would be:

```json
{"male": 1}
```

For female it would be:

```json
{"female": 1}
```

## Scope

### Alias

## Validators

## Package

### Enhanced Alias

### Module

