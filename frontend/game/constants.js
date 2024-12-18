export const PAD_MOVE_STEP_LENGTH = 3;
export const TABLE_HEIGHT = 100;
export const TABLE_LENGTH = 200;
export const PAD_LENGTH = 30;
export const PAD_WIDTH = 10;
export const FPS = 60;
export const RGB_TABLE = 0x272624;
export const RGB_PAD_PLAYER = 0xD8DFE1;
export const RGB_PAD_ENAMY = 0xD8DFE1;
export const RGB_BALL = 0xD8DFE1;
export const BALL_RADIUS = 4;
export const GAME_TIME = 150;
export const FPS_INFO = 20;
export const BK_COLOR = 0x0b1215;
export var   ballSpeed = 1.3;
export const   gameInfo = {
	
	playerName: '',
	enamyName: '',
	winner: '',
	socketConnection: false,
	isLocalGameOver: true,
	game_socket: null,
	user_name: '',
	user_id: '',
	status: 'off',
	opp_name: '',
	opp_id: '',
	game_id: '',
	room_id: '',
	result: [],
	DOMPlayerNameID: '',
	DOMEnamyNameID: '',
	DOMPlayerScoreID: '',
	DOMEnamyScoreID: '',
	DOMPlayerNameElement: null,
	DOMEnamyNameElement: null,
	DOMPlayerScoreElement: null,
	DOMEnamyScoreElement: null,
	room_list: {},
	isOverlay: false,
	// playerScore: 0,
	// enamyScore: 0,
	// gameType: '',
}
export function setBallSpeed(speed){

	ballSpeed = speed;
}
export const getBallSpeed = () => ballSpeed;
