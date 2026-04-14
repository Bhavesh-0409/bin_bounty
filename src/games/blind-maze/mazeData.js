// Data for the Blind Maze game
export const mazeData = [
    [0, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 0],
];
export const GRID_SIZE = 8;
export const START_POS = { row: 0, col: 0 };
export const END_POS = { row: 7, col: 7 }; // Back to bottom-right