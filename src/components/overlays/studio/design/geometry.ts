interface Point {
    x: number;
    y: number;
}

interface BoundingBox {
    minX: number;
    minY: number;
    width: number;
    height: number;
}

export const getCenter = (box: BoundingBox): Point => {
    return {
        x: box.minX + box.width / 2,
        y: box.minY + box.height / 2
    };
};

export const rotatePoint = (point: Point, center: Point, angle: number): Point => {
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = (cos * (point.x - center.x)) + (sin * (point.y - center.y)) + center.x;
    const ny = (cos * (point.y - center.y)) - (sin * (point.x - center.x)) + center.y;
    return { x: nx, y: ny };
};
