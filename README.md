# react-virtualized-multi-grid

> react-virtualized-multi-grid

[![NPM](https://img.shields.io/npm/v/react-virtualized-multi-grid.svg)](https://www.npmjs.com/package/react-virtualized-multi-grid) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-virtualized-multi-grid
```

## Demo
Demo and playground are available [here](https://bonnv79.github.io/react-virtualized-multi-grid/)

## Versions
[CHANGELOG](CHANGELOG.md)

## Usage Example
```JavaScript
import React from 'react';
import ReactVirtualizedMultiGrid from 'react-virtualized-multi-grid';

const rows = [
  {
    id: '1',
    name: 'test'
  },
  {
    id: '2',
    name: 'test 2'
  }
];

const columns = [
   {
    width: 80,
    label: '#',
    dataKey: 'index',
    sort: false,
    align: 'center',
    render: (value, rowData, rowIndex) => rowIndex + 1,
  },
  {
    width: 80,
    label: 'Id',
    dataKey: 'id',
    sort: true,
  },
  {
    width: 100,
    label: 'Name',
    dataKey: 'name',
    sort: true,
  },
]

const [value, onRowClick] = React.useState('');
<ReactVirtualizedMultiGrid rowKey="id" rows={rows} columns={columns} value={value} onRowClick={onRowClick} />
```

## Multiple select items Example
```JavaScript
import React from 'react';
import TextInput from 'react-virtualized-multi-grid';

const [value, onRowClick] = React.useState('');
<ReactVirtualizedMultiGrid rowKey="id" rows={rows} columns={columns} value={value} onRowClick={onRowClick} multiple />
```

## Develop

In the project directory, you can run:

### `npm install`
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:6006](http://localhost:6006) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## License

MIT © [bonnv79](https://github.com/bonnv79)
