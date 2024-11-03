export function getRankingListByResults(result) {

    const ranking = {};

    result.forEach(match => {
        const players = Object.keys(match).filter(key => key !== 'winner' && key !== 'winner_id');

        const winner = match.winner;
        if (ranking[winner]) {
            ranking[winner] += 1;
        } else {
            ranking[winner] = 1;
        }
        players.forEach(player => {
            if (!(player in ranking)) {
                ranking[player] = 0;
            }
        });
    });

    const sortedRanking = Object.fromEntries(
        Object.entries(ranking).sort(([, a], [, b]) => b - a)
    );

    return sortedRanking;
}

export function getSimpleRoomList(roomList) {

    const simpleRoomList = [];

    Object.values(roomList).forEach(room => {

        const { host_name, numbers, room_state } = room;
        simpleRoomList.push([host_name, numbers, room_state]);
    });

    return simpleRoomList;
}


export function getRoomIdByHost(roomList, hostName) {

	const room = Object.values(roomList).find(room => room.host_name === hostName);
	return room.room_id;
}