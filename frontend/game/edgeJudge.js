export function padEdgeCorrect (padYPosition, padLength,tableLength) {

	if (padYPosition < - tableLength / 2 + padLength / 2)
		return - tableLength / 2 + padLength / 2;
	else if (padYPosition > tableLength / 2 - padLength / 2)
		return tableLength / 2 - padLength / 2;
	else
		return padYPosition;
}