# react-odata

React component to declaratively fetch from OData V4 endpoints

## Install
```
yarn add react-odata
```
or
```
npm install --save react-odata
```

## Examples

### Basic
```js
<OData baseUrl="http://services.odata.org/V4/TripPinService/People/" query={{ filter: { FirstName: 'Russell' } }}>
  { ({ loading, data, error }) => (
    <div>
      { loading && "Loading..." }
      { error && error.toString()} }
      { data && (
        {/* handle data here */}
      )}
    </div>
  )}
</OData>
``` 
- See [odata-filter](https://github.com/techniq/odata-filter) for supported `query` syntax

### Passes remaining props to underlying `<Fetch />` component
```js
<OData baseUrl="http://services.odata.org/V4/TripPinService/People" options={{ credentials: 'include' }} />
```
- See [react-fetch-component](https://github.com/techniq/react-fetch-component) for additional props
