
export function getPositionPadJSON(pad, userId) {

	const positionData = {

		action: 'updatePadPosition',
		userId: userId,
		x: pad.position.x,
		y: pad.position.y
	};

	return JSON.stringify(positionData);
}

export function getPositionBallJSON(ball, userId) {
	
	const positionData = {

		action: 'updateBallPosition',
		userId: userId,
		x: ball.position.x,
		y: ball.position.y
	};

	return JSON.stringify(positionData);
}

export function setPositionPad(newPositionInfo, pad) {

	const info = JSON.parse(newPositionInfo);

	if (info.x !== undefined && info.y !== undefined && info.z !== undefined && info.action === 'UpdatePad') {

        pad.position.set(info.x, 10, info.y);
    } else {
        console.error("Invalid position data.");
    }
}

export function setPositionBall(newPositionInfo, ball) {

	const info = JSON.parse(newPositionInfo);

	if (info.x !== undefined && info.y !== undefined && info.z !== undefined && info.action === 'UpdateBall') {

		ball.position.set(info.x, 10, info.y);
	} else {
		console.error("Invalid position data.");
	}
}
