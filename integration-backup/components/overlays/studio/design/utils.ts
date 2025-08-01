import { CanvasElement } from './types';

export const getBoundingBox = (elements: CanvasElement[]) => {
    if (elements.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    const first = elements[0];
    let minX = first.x;
    let minY = first.y;
    let maxX = first.x + first.width;
    let maxY = first.y + first.height;

    for (let i = 1; i < elements.length; i++) {
        const el = elements[i];
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
    }

    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
};

export const reorderArray = <T>(list: T[], startIndex: number, endIndex: number): T[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};