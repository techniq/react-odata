# react-odata

React component to declaratively fetch data

## Examples

 select, filter, groupBy, orderBy, top, skip, count, expand

### Basic
```js
<OData baseUrl="someUrl">
  { ({ loading, data, error }) => (
    <div>
      { loading && "Loading..." }
      { error && error.toString()} }
      { data && (
        {/* handle data here */}
      )}
    </div>
  )}
</Fetch>
``` 

### Passes remaining parameters to underlying <Fetch /> component
```js
<OData baseUrl="someUrl" options={{ credentials: 'include' }} />
```

## TODO
- Tests
- More examples