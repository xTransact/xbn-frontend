// a list for saving subscribed event instances
// const subscribedEvents = {}

const getKeyByValue = (map: any, searchValue: string | number) => {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) return key
  }
}

export { getKeyByValue }
