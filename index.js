const {watch} = require("watchjs");

function Scope{
  constructor(declaration, data){
    this.declaration = declaration;
    this.data = data;
  }

  set declaration (declaration) {
    watch(declaration, this.digest);
    this._declaration = declaration;
  }

  set data (data) {
    watch(data, this.digest);
    this._data = data;
  }

  /**
   * Returns the declaration without any function
   ***/
  digest(){
    console.log('digesting');
  }

  /**
   * Returns the data after applying the declaration
   ***/
  apply(){
    console.log('applying');
  }
}
var declaration = [
  {
    key: 'person.first_name',
    type: 'string',
    required: true,
    default: 'foo'
  },
  {
    key: 'person.last_name'
    type: 'string',
    required: false
  },
  {
    key: 'person.full_name',
    exists: (ctx) => ctx.person && ctx.person.first_name && ctx.person.last_name,
    value: 'first_name + " " + last_name'
  }
]


console.log(digest(declaration));
