import { invariant, processAdditionalPropArgs } from "../utils/utils"
import { _defaultPrimitiveProp } from "../constants"

function defaultRegisterFunction(id, value, context) {
    context.rootContext.resolve(context.modelSchema, id, context.target)
}

/**
 *
 *
 * Similar to primitive, but this field will be marked as the identifier for the given Model type.
 * This is used by for example `reference()` to serialize the reference
 *
 * Identifier accepts an optional `registerFn` with the signature:
 * `(id, target, context) => void`
 * that can be used to register this object in some store. note that not all fields of this object might
 * have been deserialized yet.
 *
 * @example
 * var todos = {};
 *
 * var s = _.createSimpleSchema({
 *     id: _.identifier((id, object) => (todos[id] = object)),
 *     title: true,
 * });
 *
 * _.deserialize(s, {
 *     id: 1,
 *     title: 'test0',
 * });
 * _.deserialize(s, [{ id: 2, title: 'test2' }, { id: 1, title: 'test1' }]);
 *
 * t.deepEqual(todos, {
 *     1: { id: 1, title: 'test1' },
 *     2: { id: 2, title: 'test2' },
 * });
 *
 * @param { RegisterFunction | AdditionalPropArgs } arg1 optional registerFn: function to register this object during creation.
 * @param {AdditionalPropArgs} arg2 optional object that contains beforeDeserialize and/or afterDeserialize handlers
 *
 * @returns {PropSchema}
 */
export default function identifier(arg1, arg2) {
    var registerFn, additionalArgs
    if (typeof arg1 === "function") {
        registerFn = arg1
        additionalArgs = arg2
    } else {
        additionalArgs = arg1
    }
    invariant(!additionalArgs || typeof additionalArgs === "object", "Additional property arguments should be an object, register function should be omitted or a funtion")
    var result = {
        identifier: true,
        serializer: _defaultPrimitiveProp.serializer,
        deserializer: function (jsonValue, done, context) {
            _defaultPrimitiveProp.deserializer(jsonValue, function(err, id) {
                defaultRegisterFunction(id, context.target, context)
                if (registerFn)
                    registerFn(id, context.target, context)
                done(err, id)
            })
        }
    }
    result = processAdditionalPropArgs(result, additionalArgs)
    return result
}
