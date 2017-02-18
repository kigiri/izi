const reservedKeywords = require('./mysql-reserved-keywords')

const store = (src, fn) => src.reduce((result, a, b) => {
  result[a] = fn(a, b)
  return result
}, Object.create(null))

const toPlaceholder = field => `:${field}`
const toPairs = field => `${field}=:${field}`

const prepareStmt = (connection, db, form) => {
  const fields = Object.keys(form)
  const reqFields = fields.filter(f => form[f].tests && !form[f].optional)
  const innerJoin = fields.filter(f => form[f].ref).map(fkey => {
    const ref = form[fkey].ref
    const fdb = ref.slice(0, ref.indexOf('.'))
    return `INNER JOIN ${fdb} ON ${db}.${fkey}=${ref}`
  }).join(' ')

  const cacheStmt = stmt => (c => () => c || (c = connection.prepare(stmt)))()
  const query = stmt => {
    const c = cacheStmt(stmt)
    const q = (...args) => new Promise((s, f) => connection.query(c()(args),
      (err, result) => err ? f(err) : s(result)))
    q.stmt = c
    return q
  }

  const queryOne = (stmt, field) => {
    const q = query(stmt)
    const c = q.stmt
    const one = (args) => new Promise((s, f) => connection.query(c()([args]),
      (err, result) => err ? f(err) : s(result[0])))

    const failMsg = `No '${db}' found looking by '${field}'`
    const throwIfNotfound = result => {
      if (result) return result
      const err = Error(failMsg)
      err.code = 'ENOENT'
      err.errno = -2
      throw err
    }

    q.one = one
    q.one.must = arg => one(arg).then(throwIfNotfound)
    return q
  }

  const select = store(fields, field => {
    if (reservedKeywords.has(field.toUpperCase())) {
      throw Error(`${field} is a reserved keyword and isn't yet supported :(`)
    }
    const fn = queryOne(`SELECT * FROM ${db} WHERE ${field}=?`, field)
    fn.populate = queryOne(`SELECT * FROM ${db} ${innerJoin
      } WHERE ${db}.${field}=?`, field)
    return fn
  })

  const del = store(fields, field =>
    query(`DELETE FROM ${db} WHERE ${field}=?`))


  const update = store(fields, field => {
    if (form[field].locked) return
    return query(`UPDATE ${db} SET ${field}=? WHERE id=?`)
  })

  update.where = store(fields, field => {
    const updateCache = Object.create(null)
    return obj => {
      const keys = Object.keys(obj).sort()
      const id = keys.join()

      if (updateCache[id]) return updateCache[id](obj)
      const prep = connection.prepare(`UPDATE ${db} SET ${keys.map(toPairs)
        .join()} WHERE ${field}=:${field}`)

      updateCache[id] = args => new Promise((s, f) =>
        connection.query(prep(args), (err, result) =>
          err ? f(err) : s(result)))

      console.log(obj)
      return updateCache[id](obj)
    }
  })

  const insertStmt = connection.prepare(`INSERT INTO ${db} (${reqFields
    .join()}) VALUES (${reqFields.map(toPlaceholder).join()})`)

  const insert = values => new Promise((s, f) =>
    connection.query(insertStmt(values), (err, result) =>
      err ? f(err) : s(result)))


  insert.query = leftStmt => query(`INSERT INTO ${db} ${leftStmt}`)
  update.query = leftStmt => query(`UPDATE ${db} SET ${leftStmt}`)
  select.query = leftStmt => query(`SELECT * FROM ${db} WHERE ${leftStmt}`)
  del.query = leftStmt => query(`DELETE FROM ${db} WHERE ${leftStmt}`)

  return {
    insert,
    select,
    update,
    delete: del,
  }
}

module.exports = prepareStmt
