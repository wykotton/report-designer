let BezierValue = (t, p1, cp1, cp2, p2) => {
    return p1 * (1 - t) * (1 - t) * (1 - t) +
        3 * cp1 * t * (1 - t) * (1 - t) +
        3 * cp2 * t * t * (1 - t) +
        p2 * t * t * t;
};
let GetRanges = (p1, cp1, cp2, p2) => {
    let part = -2 * (3 * p1 - 6 * cp1 + 3 * cp2);
    let power = Math.pow(3 * p1 - 6 * cp1 + 3 * cp2, 2);
    let delta = 4 * power - 36 * (p2 - p1 + 3 * cp1 - 3 * cp2) * (cp1 - p1);
    let down = 6 * (p2 - p1 + 3 * cp1 - 3 * cp2);
    if (delta > 0) {
        let sqrt = Math.sqrt(delta);
        let t1 = (part + sqrt) / down;
        let t2 = (part - sqrt) / down;
        if (t1 >= 0 && t2 >= 0 && t1 <= 1 && t2 <= 1) {
            return [t1, t2, 0, 1];
        } else if (t1 >= 0 && t1 <= 1) {
            return [t1, 0, 1];
        } else if (t2 >= 0 && t2 <= 1) {
            return [t2, 0, 1];
        }
    }
    return [0, 1];
};
let GetOutlineRect = (props) => {
    let xRanges = GetRanges(props.startX, props.ctrl1X, props.ctrl2X, props.endX);
    let yRanges = GetRanges(props.startY, props.ctrl1Y, props.ctrl2Y, props.endY);
    let xValues = [],
        yValues = [];
    for (let xr of xRanges) {
        xValues.push(BezierValue(xr, props.startX, props.ctrl1X, props.ctrl2X, props.endX));
    }
    for (let yr of yRanges) {
        yValues.push(BezierValue(yr, props.startY, props.ctrl1Y, props.ctrl2Y, props.endY));
    }
    let minX = Math.min(...xValues);
    let maxX = Math.max(...xValues);
    let minY = Math.min(...yValues);
    let maxY = Math.max(...yValues);
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
};
export default props => {
    let { x, y, width, height } = GetOutlineRect(props);
    props.x = x;
    props.y = y;
    props.width = width;
    props.height = height;
};