import React from 'react';
import ReactVirtualizedMultiGrid from '../components/index';

export default {
  title: 'Virtualized/Reactvirtualizedmultigrid',
  component: ReactVirtualizedMultiGrid,
  argTypes: {
    multiple: {
      options: [true, false, 'shift'],
      control: { type: 'select' },
      description: 'true, false, shift'
    },
    sorter: {
      options: [true, false, undefined],
      control: { type: 'select' },
      description: 'true, false, undefined, function'
    },
    sortDirection: {
      options: [false, 'asc', 'desc'],
      control: { type: 'select' },
      description: 'false, null, "", asc, desc'
    },
  },
};

const Template = (args) => {
  const [value, onRowClick] = React.useState('');
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ReactVirtualizedMultiGrid {...args} value={value} onRowClick={onRowClick} />
    </div>
  )
};

const sample = [
  ['Frozen yoghurt', 159, 6.0, 24, 4.0, 'link 1', 'cate 1', 'parse 1', 'template 1', 'option 1', 'keep 1'],
  ['Ice cream sandwich', 237, 9.0, 37, 4.3, 'link 2', 'cate 2', 'parse 2', 'template 2', 'option 2', 'keep 2'],
  ['Eclair', 262, 16.0, 24, 6.0, 'link 3', 'cate 3', 'parse 3', 'template 3', 'option 3', 'keep 3'],
  ['Cupcake', 305, 3.7, 67, 4.3, 'link 4', 'cate 4', 'parse 4', 'template 4', 'option 4', 'keep 4'],
  ['Gingerbread long long long long', 356, 16.0, 49, 3.9, 'link 5', 'cate 5', 'parse 5', 'template 5', 'option 5', 'keep 5'],
];

function createData(id, dessert, calories, fat, carbs, protein, link, cate, parse, template, option, keep) {
  return { id: `id-${id}`, dessert, calories, fat, carbs, protein, link, cate, parse, template, option, keep };
}

const rows = [];

for (let i = 1; i <= 100; i += 1) {
  const randomSelection = sample[Math.floor(Math.random() * sample.length)];
  rows.push(createData(i, ...randomSelection));
}

const columns = [
  {
    width: 80,
    label: '#',
    dataKey: 'index',
    sort: false,
    align: 'center', // left-right-center default left
    render: (value, rowData, rowIndex) => rowIndex + 1,
  },
  {
    width: 80,
    label: 'Id',
    dataKey: 'id',
    sort: true,
    align: 'left',
  },
  {
    width: 300,
    label: 'Dessert',
    dataKey: 'dessert',
    sort: true,
    align: 'left',
  },
  {
    width: 120,
    label: 'Calories\u00A0(g)',
    dataKey: 'calories',
    sort: true,
    align: 'right',
  },
  {
    width: 120,
    label: 'Fat\u00A0(g)',
    dataKey: 'fat',
    sort: true,
    align: 'right',
  },
  {
    width: 120,
    label: 'Carbs\u00A0(g)',
    dataKey: 'carbs',
    sort: true,
    align: 'right',
  },
  {
    width: 120,
    label: 'Protein\u00A0(g)',
    dataKey: 'protein',
    sort: false,
    align: 'right',
  },
  {
    width: 120,
    label: 'link',
    dataKey: 'link',
    sort: true,
  },
  {
    width: 120,
    label: 'cate',
    dataKey: 'cate',
    sort: true,
  },
  {
    width: 120,
    label: 'parse',
    dataKey: 'parse',
    sort: true,
  },
  {
    width: 120,
    label: 'template',
    dataKey: 'template',
    sort: true,
  },
  {
    width: 120,
    label: 'option',
    dataKey: 'option',
    sort: true,
  },
  {
    width: 120,
    label: 'keep',
    dataKey: 'keep',
    sort: true,
  },
];

export const _Reactvirtualizedmultigrid = Template.bind({});
_Reactvirtualizedmultigrid.args = {
  rows,
  columns,
  rowKey: 'id',
  rowHeight: 35,
  sortableColumn: false,
  resizeColumn: false,
  multiple: false,
  fixedColumnCount: 0,
  fixedRowCount: 0,
  scrollToColumn: 0,
  scrollToRow: 0,
  value: '',
  sorter: undefined,
  sortBy: '',
  sortDirection: '',
  classNameCell: (id, rowData, rowIndex) => {
    return `row-cell-${rowIndex}`;
  },
  onRowClick: (value, rowData, rowIndex, columnKey, event) => { },
  onHeaderRowClick: ({ sortBy, sortDirection }) => { },
  onScroll: ({ clientHeight, clientWidth, scrollHeight, scrollLeft, scrollTop, scrollWidth }) => { },
  onTableChange: (newColumns) => { }
};
