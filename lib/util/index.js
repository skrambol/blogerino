export const paramsBuilder = (obj, params) => {
  return Object.keys(obj).filter(key => params.includes(key))
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})
}
