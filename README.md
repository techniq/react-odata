# react-odata

React component to declaratively fetch from OData V4 endpoints

## Install

yarn add react-odata
or

npm install --save react-odata

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

### Passes remaining parameters to underlying [<Fetch />](https://github.com/techniq/react-fetch-component) component
```js
<OData baseUrl="someUrl" options={{ credentials: 'include' }} />
```
