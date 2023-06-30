// a list for saving subscribed event instances
// const subscribedEvents = {}

const getKeyByValue = (map: any, searchValue: string | number) => {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) return key
  }
}

const uniq = (arr: any[]) => {
  const map = new Map()
  for (const i of arr) {
    if (!map.has(i.id)) {
      map.set(i.id, i)
    }
  }
  return [...map.values()]
}

export { getKeyByValue, uniq }
