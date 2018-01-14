const _ = require('lodash');

console.log = () => {}
const data = {person: {last_name: 'mograbi'}};

/**
 * @typedef {object} ResolveContext
 * @property {Proxy} proxied - the root declaration proxied!
 * @property {*} declaration - the root declaration raw!
 * @property {string} name - name of property we want to get relative to path
 * @property {string} path - the path we went through up until now
 * @property {*} target - the relevant part of the declaration raw! - where 'name' resides.
 * @property {Proxy} targetProxied - the relevant part of the declaration proxied!
 *
 **/


/**
 * @param {*} dec - the declaration relative to the current lookup
 * @param {*} data - untouched
 * @param {function} resolve - a function to resolve properties
 * @param {ResolveContext} ctx - context to send to resolver
 **/
function Dikla (dec, data, resolve, ctx = {}, path = []) {
  if (!ctx.declaration){
    ctx.declaration = dec;
  }

  if (!resolve){
    /**
     * @param {*} declaration
     * @param {*} data
     * @param {ResolveContext} ctx
     **/
    resolve = function (declaration, data, ctx ) {

      const result = _.get(ctx.target, ctx.name);
      console.log('checking if function', ctx.name);
      if (_.isFunction(result)) {
        console.log('it is a function!', ctx.name, ctx.proxied);
        return result(ctx.proxied);
      } else {
        console.log('it is not a function');
      }

      if (ctx.name === 'value') { // if we reached here, value is not defined, so by default we fetch from data
        // console.log('in resolve value', p);
        const getResult = _.get(data, ctx.path.join('.'));
        return getResult === undefined ?  ctx.targetProxied.default : getResult;
      }


      return result;
    }
  }

   let proxied = null;
   let rootProxied = null;

  var handler = {
     get: function (target, name) {
       debugger;
       console.log('getting something [', name, '] target [', target, ']');
       if (target.hasOwnProperty(name) || name === 'value') {
         console.log('resolving',  name);
         const resolverContext = {name, target, path};
         resolverContext.proxied = ctx.proxied;
         resolverContext.declaration = ctx.declaration;
         resolverContext.targetProxied = proxied;
         const result = resolve(dec, data, resolverContext);
         console.log('result is', result, 'for name', name);
         if (name === 'value'){
           return result;
         } else if (_.isObject(result)){
           console.log('its an object!');
           return new Dikla(result, data, resolve, ctx, path.concat(name));
         } else {
           return result;
         }
       }
     }
   };

   proxied  = new Proxy(dec, handler);

   if (!ctx.proxied){
     ctx.proxied = new Proxy(ctx.declaration, handler);
   }
   console.log('its notin');
  return proxied;
}

var declaration = {
  person: {
    exists: () => true,
    first_name: {
      type: 'string',
      required: true,
      default: 'foo2'
    },
    last_name: {
      type: 'string',
      required: false
    },
    full_name: {
      exists: (ctx) => ctx.person.exists && ctx.person.first_name.value && ctx.person.last_name.value,
      value: (ctx) => ctx.person.first_name.value  + ' ' + ctx.person.last_name.value
    }
  }
};

const dikla = new Dikla(declaration, data);
if (dikla.person.full_name.exists){
  console.log(dikla.person.full_name.value);
} else {
  console.log('does not exist!');
}
