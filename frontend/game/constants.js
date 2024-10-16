export const PAD_MOVE_STEP_LENGTH = 3;
export const TABLE_HEIGHT = 100;
export const TABLE_LENGTH = 200;
export const PAD_LENGTH = 30;
export const PAD_WIDTH = 10;
export const FPS = 60;
export const RGB_TABLE = 0x464646;
export const RGB_PAD_PLAYER = 0xD8DFE1;
export const RGB_PAD_ENAMY = 0xD8DFE1;
export const RGB_BALL = 0xD8DFE1;
export const BALL_RADIUS = 5;
export const GAME_TIME = 150;
export const FPS_BALL = 20;
export var   ballSpeed = 1;
export function setBallSpeed(speed){

	ballSpeed = speed;
}
export const getBallSpeed = () => ballSpeed;