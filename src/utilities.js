export function buildQueryString({ select, filter, groupBy, orderBy, top, skip, count, expand } = {}) {
  const builtFilter = buildFilter(filter)

  if (groupBy) {
    const params = {};
    const applyParams = [];

    if (builtFilter) {
      applyParams.push(`filter(${builtFilter})`)
    }

    // TODO: Support `groupBy` subproperties using '/' or '.'
    applyParams.push(`groupby((${groupBy}),aggregate(Id with countdistinct as Total))`)

    params.$apply = applyParams.join('/');

    if (orderBy) {
      params.$orderby = orderBy
    }

    return Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
  } else {
    const params = {};

    if (select) {
      params.$select = select
    }

    if (builtFilter) {
      params.$filter = builtFilter
    }

    if (orderBy) {
      params.$orderby = orderBy
    }

    if (top) {
      params.$top = top
    }

    if (skip) {
      params.$skip = skip
    }

    if (count) {
      params.$count = true
    }

    if (expand) {
      // TODO: Seperate and built out based on dotted notation 'Foo.Bar.Baz' => '$expand=Foo($expand=Bar($expand=Baz))
      // example: $expand=Source,SourceType,Site,Customer,Status,Tasks,Tasks($expand=AssignedUser),Tasks($expand=AssignedGroup),Tasks($expand=Status)
      params.$expand = expand
    }

    return Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
  }
}

function buildFilter(filters = {}) {
  if (typeof(filters) === 'string') {
    return filters;
  } else if (Array.isArray(filters)) {
    return filters.map(f => buildFilter(f)).join(' and ');
  } else if (typeof(filters) === 'object') {
    const filtersArray = Object.keys(filters).reduce((result, filterKey) => {
      // TODO: Smartly build filter based on object (determine query syntax to pass)
      // return '(Tasks/any(t:((t/AssignedGroupId eq 109343))))'
      if (filterKey === 'Tasks' && Object.keys(filters.Tasks).length) {
        const tasksFilter = Object.keys(filters.Tasks).map(key => `(t/${key} eq ${filters.Tasks[key]})`).join(' and ')
        result.push(`Tasks/any(t:(${tasksFilter}))`);
      } else {
        const value = filters[filterKey];
        if (value instanceof Object) {
          const operators = Object.keys(value);
          operators.forEach(op => {
            result.push(`${filterKey} ${op} ${value[op]}`) 
          })
        } else {
          result.push(`${filterKey} eq ${value}`) 
        }
      }

      return result;
    }, [])

    return filtersArray.join(' and ');
  } else {
    throw new Error(`Unexpected filters type: "${typeof(filters)}"`)
  }
}