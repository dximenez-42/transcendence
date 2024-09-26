export const padMoveStepLength = 3;
export const tableHeight = 100;
export const tableLength = 300;
export const padLength = 30;
export const padWidth = 10;
export const FPS = 60;
export const RGB_TABLE = 0x92DFFE;
export const RGB_PAD_PLAYER = 0xB2E66D;
export const RGB_PAD_ENAMY = 0x6BFDF2;
export const RGB_BALL = 0xD8DFE1;
export const BALL_RADIUS = 5;
export var   ballSpeed = 1;
export function setBallSpeed(speed){

	ballSpeed = speed;
}
export const getBallSpeed = () => ballSpeed;