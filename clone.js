const map = require('./collection/map');
const { isObj } = require('./is');

const clone = map(value => isObj(value) ? clone(value) : value)

export default clone