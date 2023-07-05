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
    const id = JSON.stringify(i)
    if (!map.has(id)) {
      map.set(id, i)
    }
  }
  return [...map.values()]
}

export { getKeyByValue, uniq }
