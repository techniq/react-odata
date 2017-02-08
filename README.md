# react-odata

React component to declaratively fetch from OData endpoints

## Examples

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
