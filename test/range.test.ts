import { range } from '../src/utils/range';

describe('range', () => {
    it('range 1 to 5 is [1, 2, 3, 4]', () => {
        expect(range(1, 5)).toEqual([1, 2, 3, 4]);
    });

    it('range 1 to 3 by step 0.5 is [1, 1.5, 2, 2.5]', () => {
        expect(range(1, 3, 0.5)).toEqual([1, 1.5, 2, 2.5]);
    });

    it('range 2 to 3 by step 0 is []', () => {
        expect(range(2, 3, 0)).toEqual([]);
    });

    it('range 2 to -1  is [2, 1, 0, -1]', () => {
        expect(range(2, -2)).toEqual([2, 1, 0, -1]);
    });
});
