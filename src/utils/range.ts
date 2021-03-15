// eslint-disable-next-line import/prefer-default-export
export const range = (begin: number, end: number, step: number = 1): number[] => {
    if (typeof begin !== 'number' || typeof end !== 'number' || typeof step !== 'number') {
        return [];
    }

    if (step === 0) return [];

    const stepSymbol: 'minus' | 'plus' = begin > end ? 'minus' : 'plus';

    const rstep = stepSymbol === 'minus' ? -Math.abs(step || 1) : Math.abs(step || 1);

    const result: number[] = [];

    if (stepSymbol === 'minus') {
        for (let i = begin; i > end; i += rstep) {
            result.push(i);
        }
    } else {
        for (let i = begin; i < end; i += rstep) {
            result.push(i);
        }
    }

    return result;
};
