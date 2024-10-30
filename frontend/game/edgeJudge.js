export function padEdgeCorrect (padYPosition, PAD_LENGTH,TABLE_LENGTH) {

	if (padYPosition < - TABLE_LENGTH / 2 + PAD_LENGTH / 2)
		return - TABLE_LENGTH / 2 + PAD_LENGTH / 2;
	else if (padYPosition > TABLE_LENGTH / 2 - PAD_LENGTH / 2)
		return TABLE_LENGTH / 2 - PAD_LENGTH / 2;
	else
		return padYPosition;
}