const reduce = require('./collection/reduce')
const missingWord = [ 'missing', 'manquant' ]

const missingValue = (val, i) => `${val} ${missingWord[i]}`

const testFields = reduce((error, { test, msg, suggestion }) => {
  if (error) return error
  if (test(val)) return
  error = { msg }
  suggestion && (error.suggestion = suggestion(val))
  return error
})

const checkField = (field, value) => {
  if (!value) return (field.optional || !field.tests)
    ? undefined
    : ({ msg: field.label.map(missingValue) })

  const val = field.map ?  field.map(value) : value

  return testFields(field.tests, false)
}

const checkForm = form => values => reduce((errors, field, name) => {
  const err = checkField(field, values[name])
  err && ((errors || (errors = {}))[name] = err)
  return errors
}, form, false)

module.exports = {
  form: checkForm,
  field: checkField,
}
