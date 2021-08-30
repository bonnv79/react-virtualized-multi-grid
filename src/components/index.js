/** @flow */
import React from 'react';
import PropTypes from 'prop-types';
import { AutoSizer } from 'react-virtualized';
import _orderBy from 'lodash/orderBy';
import _keyBy from 'lodash/keyBy';
import _isEmpty from 'lodash/isEmpty';
import _slice from 'lodash/slice';
import _map from 'lodash/map';
import _forEach from 'lodash/forEach';
import RefMultiGrid from './RefMultiGrid';
import clsx from 'clsx';
import arrayMove from './utils';
import {
  STYLE,
  STYLE_BOTTOM_LEFT_GRID,
  STYLE_TOP_LEFT_GRID,
  STYLE_TOP_RIGHT_GRID,
  SORT_DIRECTIONS,
  DEFAULT_COLUMN_WIDTH,
  SCROLLBAR_WIDTH,
  STYLE_BOTTOM_RIGHT_GRID,
  MULTIPLE_SHIFT_MODE,
} from './constants';
import styles from './styles.module.css';

const getMapColumns = columns => {
  const newColumns = [];
  let totalWidth = 0;

  _forEach(columns, (col, index) => {
    let { width } = col;
    width = Number(width) || DEFAULT_COLUMN_WIDTH;
    newColumns[index] = {
      ...col,
      width,
    };
    totalWidth += width;
  });

  _forEach(newColumns, (col, index) => {
    const { width } = col;
    newColumns[index].percent = width / totalWidth;
  });

  return newColumns;
};

const getRows = (rows, sortBy, sortDirection, sorter) => {
  if (!sortBy || typeof sorter !== 'function') {
    return rows;
  }
  return sorter(rows, sortBy, sortDirection);
};

const getValue = (multiple, value) => {
  return multiple ? _keyBy(value) : value;
};

class ReactVirtualizedMultiGrid extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    const {
      columns,
      rows,
      sortBy,
      sortDirection,
      sorter,
      multiple,
      value,
      fixedColumnCount,
      scrollToColumn
    } = props;
    const mapColumns = getMapColumns(columns);
    this.state = {
      originalColumns: columns,
      columns: mapColumns,
      originalRows: rows,
      rows: getRows(rows, sortBy, sortDirection, sorter),
      originalValue: value,
      value: getValue(multiple, value),
      prevSortBy: sortBy,
      sortBy,
      prevSortDirection: sortDirection,
      sortDirection,
      hover: '',
      prevWidth: 0,
      prevFixedColumnCount: fixedColumnCount,
      prevColumns: mapColumns,
      alignClassName: {
        right: this.getClassName('ReactVirtualized__MultiGridTable__Right'),
        center: this.getClassName('ReactVirtualized__MultiGridTable__Center'),
      },
      shiftIndex: null,
      scrollLeft: 0,
      scrollToColumn,
      prevScrollToColumn: scrollToColumn,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const newState = {};
    let { sortBy, sortDirection } = state;

    if (props.sortBy !== state.prevSortBy) {
      newState.sortBy = props.sortBy;
      newState.prevSortBy = props.sortBy;
      sortBy = props.sortBy;
      newState.shiftIndex = null;
    }

    if (props.sortDirection !== state.prevSortDirection) {
      newState.sortDirection = props.sortDirection;
      newState.prevSortDirection = props.sortDirection;
      sortDirection = props.sortDirection;
      newState.shiftIndex = null;
    }

    if (props.columns !== state.originalColumns) {
      newState.columns = getMapColumns(props.columns);
      newState.originalColumns = props.columns;
    }

    if (props.rows !== state.originalRows) {
      newState.rows = getRows(props.rows, sortBy, sortDirection, props.sorter);
      newState.originalRows = props.rows;
      newState.shiftIndex = null;
    }

    if (props.value !== state.originalValue) {
      newState.value = getValue(props.multiple, props.value);
      newState.originalValue = props.value;
    }

    if (props.scrollToColumn !== state.prevScrollToColumn) {
      newState.scrollToColumn = props.scrollToColumn;
      newState.prevScrollToColumn = props.scrollToColumn;
    }

    return newState;
  }

  getClassName = className => {
    const { classes } = this.props;
    return clsx([className, classes[className]]);
  };

  setShiftIndex = shiftIndex => {
    this.setState({
      shiftIndex,
    });
  };

  changeSort = sortBy => () => {
    const { onHeaderRowClick, sorter } = this.props;
    const {
      sortBy: prevSortBy,
      sortDirection: prevSortDirection,
      originalRows,
      shiftIndex,
    } = this.state;
    let sortDirection = SORT_DIRECTIONS.ASC;
    let reset = false;

    if (sortBy === prevSortBy) {
      if (prevSortDirection === SORT_DIRECTIONS.ASC) {
        sortDirection = SORT_DIRECTIONS.DESC;
      } else {
        reset = true;
      }
    }
    let currentSortBy = sortBy;
    let currentSortDirection = sortDirection;

    if (reset) {
      currentSortBy = '';
      currentSortDirection = '';
    }

    this.setState({
      sortBy: currentSortBy,
      sortDirection: currentSortDirection,
      rows: getRows(originalRows, currentSortBy, currentSortDirection, sorter),
    });

    onHeaderRowClick({
      sortBy: currentSortBy,
      sortDirection: currentSortDirection,
    });

    if (shiftIndex !== null) {
      this.setShiftIndex(null);
    }
  };

  handleMultiple = (value, id) => {
    let newValue = { ...value };
    if (newValue[id]) {
      delete newValue[id];
    } else {
      newValue[id] = id;
    }
    return newValue;
  };

  handleMultipleShift = (value, index, rowKey, id, event) => {
    let newValue = { ...value };
    const { shiftIndex } = this.state;
    if (event.shiftKey && shiftIndex !== null) {
      const { rows } = this.state;
      const min = Math.min(shiftIndex, index);
      const max = Math.max(shiftIndex, index) + 1;
      newValue = _map(_slice(rows, min, max), rowKey);
    } else if (event.ctrlKey) {
      this.setShiftIndex(index);
      newValue = this.handleMultiple(newValue, id);
    } else {
      this.setShiftIndex(index);
      newValue = { [id]: id };
    }

    return newValue;
  };

  onRowClick = (rowData, dataKey, index) => event => {
    const { onRowClick, rowKey, multiple } = this.props;
    const id = rowData[rowKey];
    let newValue = id;

    if (multiple) {
      const { value } = this.state;
      newValue = typeof value === 'object' ? value : {};

      if (multiple === MULTIPLE_SHIFT_MODE) {
        newValue = this.handleMultipleShift(newValue, index, rowKey, id, event);
      } else {
        newValue = this.handleMultiple(newValue, id);
      }

      newValue = Array.isArray(newValue) ? newValue : _map(newValue);
    }

    onRowClick(newValue, rowData, index, dataKey, event); // event={ shiftKey: bool, ctrlKey: bool }
  };

  onHoverCell = rowIndex => () => {
    this.setState({
      hover: rowIndex,
    });
  };

  onTableChange = (columns) => {
    const { onTableChange } = this.props;
    onTableChange(columns);
  }

  onDragStart = (columnIndex) => () => {
    this.dragColumnIndex = columnIndex;
  }

  onDrop = (newIndex) => (e) => {
    e.preventDefault();
    const oldIndex = this.dragColumnIndex;

    if (oldIndex !== newIndex) {
      let { columns } = this.state;
      columns = arrayMove(columns, oldIndex, newIndex);
      columns = getMapColumns(columns);
      this.setState({
        columns
      });
      this.onTableChange(columns);
    }
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.border = 'none';
    e.currentTarget.style.opacity = 1;
  }

  onDragOver = (e) => {
    e.currentTarget.style.boxShadow = 'rgba(0, 0, 0, 0.24) 0px 3px 8px';
    e.currentTarget.style.border = '2px dotted #2196f3';
    e.currentTarget.style.opacity = 0.6;
  }

  onDragLeave = (e) => {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.border = 'none';
    e.currentTarget.style.opacity = 1;
  }

  headerCellRenderer = ({ key, columnIndex, style }) => {
    const { resizeColumn, sortableColumn } = this.props;
    const { columns, sortBy, sortDirection, alignClassName } = this.state;
    const { dataKey, label, sort, align } = columns[columnIndex];
    const isSort = sortBy === dataKey;
    const ascSort = sortDirection === SORT_DIRECTIONS.ASC;
    const className = {};

    if (align && align !== 'left') {
      className[alignClassName[align]] = true;
    }
    if (resizeColumn) {
      className[this.getClassName('ReactVirtualized__MultiGridTable__HeaderResize')] = true;
    }
    if (sortableColumn) {
      className[this.getClassName('ReactVirtualized__MultiGridTable__HeaderSortable')] = true;
    }

    const classNameLabel = {
      [this.getClassName('ReactVirtualized__MultiGridTable__SortBy')]: sort,
      [this.getClassName('ReactVirtualized__MultiGridTable__AscSort')]: isSort && ascSort,
      [this.getClassName('ReactVirtualized__MultiGridTable__DescSort')]: isSort && !ascSort,
    };

    const onMouseMove = e => requestAnimationFrame(() => {
      let { columns, scrollLeft } = this.state;

      const { offsetLeft } = this.headerBeingResized || 0;
      const width = scrollLeft + e.clientX - offsetLeft;

      if ((width || width === 0) && columns[this.resizeIndex]) {
        const size = Math.max(100, width) || 100;
        columns[this.resizeIndex].width = size;

        this.setState({
          columns: columns.length > 100 ? [...columns] : getMapColumns(columns),
          scrollToColumn: undefined
        });
      }
    });

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      this.headerBeingResized = null;
      this.resizeIndex = null;
      this.onTableChange(this.state.columns);
    };

    let sortableProps = {};

    if (sortableColumn) {
      sortableProps = {
        draggable: true,
        onDragStart: this.onDragStart(columnIndex),
        onDrop: this.onDrop(columnIndex),
        onDragOver: this.onDragOver,
        onDragLeave: this.onDragLeave
      };
    }

    return (
      <div
        key={key}
        className={clsx(
          this.getClassName('ReactVirtualized__MultiGridTable__Cell'),
          this.getClassName('ReactVirtualized__MultiGridTable__HeaderCell'),
          className,
        )}
        style={style}
        {...sortableProps}
      >
        <span
          tabIndex="0"
          role="button"
          aria-pressed="false"
          title={label}
          className={clsx(
            this.getClassName('ReactVirtualized__MultiGridTable__NonePointerEvents'),
            classNameLabel,
          )}
          onClick={this.changeSort(dataKey)}
        >
          {label}
        </span>
        {
          resizeColumn && (
            <span
              className={this.getClassName('ReactVirtualized__MultiGridTable__ResizeHandle')}
              onMouseDown={(e) => {
                e.preventDefault();
                this.resizeIndex = columnIndex;
                this.headerBeingResized = e.target.parentNode;
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
              }}
            />
          )
        }
      </div>
    );
  };

  cellRenderer = ({ key, columnIndex, rowIndex, style }) => {
    if (rowIndex === 0) {
      return this.headerCellRenderer({ key, columnIndex, style, rowIndex });
    }
    const { rowKey, multiple, classNameCell } = this.props;
    const { rows, columns, hover, value, alignClassName } = this.state;
    if (_isEmpty(rows)) {
      return null;
    }
    const index = rowIndex - 1;
    const { dataKey, align, render } = columns[columnIndex];
    const rowData = rows[index];
    const label = rowData[dataKey] || '';
    const id = rowData[rowKey];
    const selected = value && multiple ? value[id] : value === id;

    const className = {
      [this.getClassName('ReactVirtualized__MultiGridTable__CellHover')]: hover === rowIndex,
      [this.getClassName('ReactVirtualized__MultiGridTable__CellSelected')]: selected,
    };

    if (align && align !== 'left') {
      className[alignClassName[align]] = true;
    }

    let classCell = classNameCell;
    if (classCell) {
      if (typeof classCell === 'function') {
        classCell = classCell(id, rowData, rowIndex);
      }
      className[classCell] = true;
    }

    let component = <span title={label}>{label}</span>;

    if (render) {
      component = render(label, rowData, index);
      if (typeof component !== 'object') {
        component = <span title={component}>{component}</span>;
      }
    }

    return (
      <div
        tabIndex="0"
        role="button"
        aria-pressed="false"
        key={key}
        className={clsx(
          this.getClassName('ReactVirtualized__MultiGridTable__Cell'),
          className,
        )}
        style={style}
        onClick={this.onRowClick(rowData, dataKey, index)}
        onMouseEnter={this.onHoverCell(rowIndex)}
        onMouseLeave={this.onHoverCell(null)}>
        {component}
      </div>
    );
  };

  getColumnWidth = gridWidth => ({ index }) => {
    const { columns } = this.state;
    const { width, percent } = columns[index];

    return Math.max((gridWidth - SCROLLBAR_WIDTH) * percent, width);
  };

  setPrevWidth = width => {
    this.setState({
      prevWidth: width,
    });
  };

  setPrevFixedColumnCount = count => {
    this.setState({
      prevFixedColumnCount: count,
    });
  };

  setPrevColumns = columns => {
    this.setState({
      prevColumns: columns,
    });
  };

  setScrollLeft = value => {
    const { scrollLeft } = this.state;
    if (scrollLeft !== value) {
      this.setState({
        scrollLeft: value
      });
    }
  };

  onScroll = (props) => {
    const { onScroll } = this.props;
    onScroll(props);
    this.setScrollLeft(props.scrollLeft);
  }

  render() {
    const { fixedRowCount, sortableColumn, ...props } = this.props;
    const {
      rows,
      columns,
      prevWidth,
      prevFixedColumnCount,
      prevColumns,
      scrollLeft,
      scrollToColumn
    } = this.state;

    let sortableProps = {};

    if (sortableColumn) {
      sortableProps = {
        onDragOver: (e) => {
          e.preventDefault();
        }
      };
    }

    return (
      <div
        style={{ height: '100%', width: '100%' }}
        {...sortableProps}
      >
        <AutoSizer>
          {({ width, height }) => (
            <RefMultiGrid
              height={height}
              width={width}
              fixedRowCount={fixedRowCount + 1}
              columnCount={columns.length}
              columnWidth={this.getColumnWidth(width)}
              rowCount={rows.length + 1}
              cellRenderer={this.cellRenderer}
              prevWidth={prevWidth}
              setPrevWidth={this.setPrevWidth}
              prevFixedColumnCount={prevFixedColumnCount}
              setPrevFixedColumnCount={this.setPrevFixedColumnCount}
              prevColumns={prevColumns}
              setPrevColumns={this.setPrevColumns}
              {...props}
              columns={columns}
              scrollLeft={scrollLeft}
              scrollToColumn={scrollToColumn}
              onScroll={this.onScroll}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

ReactVirtualizedMultiGrid.defaultProps = {
  enableFixedColumnScroll: true,
  enableFixedRowScroll: true,
  hideTopRightGridScrollbar: true,
  hideBottomLeftGridScrollbar: true,
  style: STYLE,
  styleBottomLeftGrid: STYLE_BOTTOM_LEFT_GRID,
  styleTopLeftGrid: STYLE_TOP_LEFT_GRID,
  styleTopRightGrid: STYLE_TOP_RIGHT_GRID,
  styleBottomRightGrid: STYLE_BOTTOM_RIGHT_GRID,
  classes: styles,
  fixedColumnCount: 0,
  fixedRowCount: 0,
  scrollToColumn: undefined,
  scrollToRow: undefined,
  rowHeight: 35,
  rowKey: 'id',
  value: '',
  multiple: false,
  classNameCell: '',
  onRowClick: () => { },
  onHeaderRowClick: () => { },
  onScroll: () => { },
  sorter: (rows, sortBy, sortDirection) => {
    return _orderBy(rows, [sortBy], [sortDirection]);
  },
  sortBy: '',
  sortDirection: '',
  sortableColumn: false,
  resizeColumn: false,
  onTableChange: () => { }
};

ReactVirtualizedMultiGrid.propTypes = {
  enableFixedColumnScroll: PropTypes.bool,
  enableFixedRowScroll: PropTypes.bool,
  hideTopRightGridScrollbar: PropTypes.bool,
  hideBottomLeftGridScrollbar: PropTypes.bool,
  style: PropTypes.instanceOf(Object),
  styleBottomLeftGrid: PropTypes.instanceOf(Object),
  styleTopLeftGrid: PropTypes.instanceOf(Object),
  styleTopRightGrid: PropTypes.instanceOf(Object),
  styleBottomRightGrid: PropTypes.instanceOf(Object),
  classes: PropTypes.instanceOf(Object),
  rows: PropTypes.arrayOf(Object).isRequired,
  columns: PropTypes.arrayOf(Object).isRequired,
  fixedColumnCount: PropTypes.number,
  fixedRowCount: PropTypes.number,
  scrollToColumn: PropTypes.number,
  scrollToRow: PropTypes.number,
  rowHeight: PropTypes.number,
  rowKey: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Array),
  ]),
  multiple: PropTypes.oneOf([true, false, MULTIPLE_SHIFT_MODE]),
  classNameCell: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onRowClick: PropTypes.func,
  onHeaderRowClick: PropTypes.func,
  onScroll: PropTypes.func,
  sorter: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  sortBy: PropTypes.string,
  sortDirection: PropTypes.oneOf([
    ...Object.values(SORT_DIRECTIONS),
    '',
    null,
    false,
  ]),
  sortableColumn: PropTypes.bool,
  resizeColumn: PropTypes.bool,
  onTableChange: PropTypes.func,
};

export default ReactVirtualizedMultiGrid;
export { ReactVirtualizedMultiGrid };
