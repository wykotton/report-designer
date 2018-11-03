//transform
const Points = {
    lt: 0,
    mt: 1,
    rt: 2,
    rm: 3,
    rb: 4,
    mb: 5,
    lb: 6,
    lm: 7
};
export default {
    '@{rotate.rect}'({ x, y, width, height }, angle) {
        let r = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2;
        let a = width ? Math.round(Math.atan(height / width) * 180 / Math.PI) : 0;
        let tlbra = 180 - angle - a;
        let trbla = a - angle;
        let ta = 90 - angle;
        let ra = angle;

        let halfWidth = width / 2;
        let halfHeight = height / 2;

        let middleX = x + halfWidth;
        let middleY = y + halfHeight;

        let topLeft = {
            x: middleX + r * Math.cos(tlbra * Math.PI / 180),
            y: middleY - r * Math.sin(tlbra * Math.PI / 180)
        };
        let top = {
            x: middleX + halfHeight * Math.cos(ta * Math.PI / 180),
            y: middleY - halfHeight * Math.sin(ta * Math.PI / 180),
        };
        let topRight = {
            x: middleX + r * Math.cos(trbla * Math.PI / 180),
            y: middleY - r * Math.sin(trbla * Math.PI / 180)
        };
        let right = {
            x: middleX + halfWidth * Math.cos(ra * Math.PI / 180),
            y: middleY + halfWidth * Math.sin(ra * Math.PI / 180),
        };
        let bottomRight = {
            x: middleX - r * Math.cos(tlbra * Math.PI / 180),
            y: middleY + r * Math.sin(tlbra * Math.PI / 180)
        };
        let bottom = {
            x: middleX - halfHeight * Math.sin(ra * Math.PI / 180),
            y: middleY + halfHeight * Math.cos(ra * Math.PI / 180),
        }
        let bottomLeft = {
            x: middleX - r * Math.cos(trbla * Math.PI / 180),
            y: middleY + r * Math.sin(trbla * Math.PI / 180)
        };
        let left = {
            x: middleX - halfWidth * Math.cos(ra * Math.PI / 180),
            y: middleY - halfWidth * Math.sin(ra * Math.PI / 180),
        }
        let minX = Math.min(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
        let maxX = Math.max(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
        let minY = Math.min(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
        let maxY = Math.max(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
        return {
            point: [topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left],
            width: maxX - minX,
            height: maxY - minY,
            left: minX,
            right: maxX,
            top: minY,
            bottom: maxY
        }
    },
    '@{get.point.and.opposite}'(point, pointer) {
        let oppositePoint = {};
        let currentPoint = {};

        let currentIndex = Points[pointer];
        let oppositeIndex = 0;
        currentPoint = point[currentIndex];

        // 对角线点index相差4
        let offset = 4;
        let oIndex = currentIndex - offset;
        if (oIndex < 0) {
            oIndex = currentIndex + offset;
        }
        // 取对角线点坐标
        oppositePoint = point.slice(oIndex, oIndex + 1)[0];
        oppositeIndex = oIndex;

        return {
            current: {
                index: currentIndex,
                point: currentPoint
            },
            opposite: {
                index: oppositeIndex,
                point: oppositePoint
            }
        };
    },
    '@{get.scaled.rect}'(params, baseIndex) {
        let { x, y, width, height, scale } = params;
        let offset = {
            x: 0,
            y: 0
        };
        let deltaXScale = scale.x - 1;
        let deltaYScale = scale.y - 1;
        let deltaWidth = width * deltaXScale;
        let deltaHeight = height * deltaYScale;
        let newWidth = width + deltaWidth;
        let newHeight = height + deltaHeight;
        let newX = x - deltaWidth / 2;
        let newY = y - deltaHeight / 2;
        if (baseIndex) {
            let points = [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }];
            let newPoints = [{ x: newX, y: newY }, { x: newX + newWidth, y: newY }, { x: newX + newWidth, y: newY + newHeight }, { x: newX, y: newY + newHeight }];
            offset.x = points[baseIndex].x - newPoints[baseIndex].x;
            offset.y = points[baseIndex].y - newPoints[baseIndex].y;
        }
        return {
            x: newX + offset.x,
            y: newY + offset.y,
            width: newWidth,
            height: newHeight
        }
    },
    '@{get.new.rect}'(oPoint, scale, oTransformedRect, baseIndex) {
        let scaledRect = this['@{get.scaled.rect}']({
            x: oPoint.x,
            y: oPoint.y,
            width: oPoint.width,
            height: oPoint.height,
            scale: scale
        });

        // 缩放后元素的高宽
        let newWidth = scaledRect.width;
        let newHeight = scaledRect.height;

        let transformedRotateRect = this['@{rotate.rect}'](scaledRect, oPoint.rotate);

        // 计算到平移后的新坐标
        let translatedX = oTransformedRect.point[baseIndex].x - transformedRotateRect.point[baseIndex].x + transformedRotateRect.left;
        let translatedY = oTransformedRect.point[baseIndex].y - transformedRotateRect.point[baseIndex].y + transformedRotateRect.top;
        // 计算平移后元素左上角的坐标
        let newX = translatedX + transformedRotateRect.width / 2 - newWidth / 2;
        let newY = translatedY + transformedRotateRect.height / 2 - newHeight / 2;

        return {
            left: newX,
            top: newY,
            width: newWidth,
            height: newHeight
        };
    },
    '@{get.rect.xy}'({ x, y, width, height }, deg) {
        if (width == 0) {
            return {
                x, y
            };
        }
        //圆心x0,y0
        let x0 = x + width / 2;
        let y0 = y + height / 2;
        //半径r
        let r = Math.sqrt(width * width / 2 / 2 + height * height / 2 / 2);
        //初始角度 左上角与圆心的角度
        let deg0 = 180 * Math.atan(height / width) / Math.PI;
        //旋转角度，与x轴正方向角度，左上角顶点要加上180度

        let rDeg = deg0 + deg + 180;

        //新的左上角坐标
        let x1 = x0 + r * Math.cos(rDeg * Math.PI / 180);
        let y1 = y0 + r * Math.sin(rDeg * Math.PI / 180);
        return {
            x: x1,
            y: y1
        };
    }
};