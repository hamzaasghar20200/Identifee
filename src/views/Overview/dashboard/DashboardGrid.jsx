import React from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import { ImageList, ImageListItem } from '@mui/material';
const ReactGridLayout = WidthProvider(RGL);

const DashboardGridTypes = {
  RGL: 'RGL',
  MUIG: 'MUIG',
};

function srcset(image, size, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${size * cols}&h=${
      size * rows
    }&fit=crop&auto=format&dpr=2 2x`,
  };
}

export default class DashboardGrid extends React.PureComponent {
  constructor(props) {
    super(props);

    if (props.type === DashboardGridTypes.RGL) {
      const layout = this.generateLayout();
      this.state = { layout };
    }
  }

  generateDOM() {
    return this.props.items.map((item, i) => (
      <div key={i}>
        <span className="text">{item.dComponent}</span>
      </div>
    ));
  }

  generateLayout() {
    const p = this.props;
    return p.items.map((item, i) => {
      return {
        x: i % p.cols,
        y: Math.floor(i / p.cols),
        w: item.width,
        h: item.height,
        i: i.toString(),
      };
    });
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

  render() {
    return (
      <>
        {this.props.type === 'MUIG' ? (
          <ImageList
            variant={this.props.type}
            cols={this.props.cols}
            rowHeight={this.props.rowHeight}
          >
            {this.props.items.map((item) => (
              <ImageListItem
                key={item.componentId}
                cols={item.width || 1}
                rows={item.height || 1}
              >
                <div
                  className="h-100"
                  {...srcset(
                    item.img,
                    this.props.rowHeight,
                    item.height,
                    item.width
                  )}
                >
                  {item.dComponent}
                </div>
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <ReactGridLayout
            layout={this.state.layout}
            isResizable={false}
            isDraggable={true}
            compactType={'vertical'}
            rowHeight={170}
            isBounded={true}
            margin={[5, 5]}
            onLayoutChange={this.onLayoutChange}
            {...this.props}
          >
            {this.generateDOM()}
          </ReactGridLayout>
        )}
      </>
    );
  }
}

DashboardGrid.defaultProps = {
  className: 'layout',
  items: [],
  onLayoutChange: function () {},
  cols: 3,
  variant: 'quilted', // MUI type
  rowHeight: 170, // i am setting by default here
  type: DashboardGridTypes.MUIG, // RGL: react-grid-layout, MUIG: material ui grid
};
