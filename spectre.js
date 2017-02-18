/// could be something....

const callWith1st = (acc, fn) => fn(acc)
const fat = (start, fns) => fns.reduce(callWith1st)
const transert = (fromSelector, toSelector) => {
  const fromPath = sparseSelector(fromSelectorString)
  const toPath = parseSelector(toSelectorString)

  return world => amount => {
    const givers = fromPath.select(world)
    const recievers = toPath.select(world)
    const totalReceive = amount * givers.length
    const totalGive = amount * recievers.length
    const recieve = totalReceive / givers.length
    const give = totalGive / recievers.length

    if (!every(givers, money => money >= give)) {
      throw Error('Not enough found')
    }

    return fat(world, [
      fromPath.tranform(val => val - give),
      toPath.tranform(val => val + recieve),
    ])
  }
}

const bankGiveDollar = transert('bank.funds', 'people@money')
const pplGiveDollar = transert('people@money', 'bank.funds')
