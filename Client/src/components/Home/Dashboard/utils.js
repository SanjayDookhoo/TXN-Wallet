export const adjustDecimalPoint = (balance, contract_decimals) => {
	if (balance.length > contract_decimals) {
		const whole = balance.slice(0, balance.length - contract_decimals);
		const integral = balance.slice(balance.length - contract_decimals);
		return whole + '.' + integral;
	} else {
		return (
			'.' +
			new Array(contract_decimals - balance.length).fill(0).join('') +
			balance
		);
	}
};

export const valueLengthPreProcessing = (value) => {
	if (value == null || isNaN(value)) return '';

	const max_val = 999999;

	const post_fix_arr = [
		{
			modifier: 1,
			post_fix: '',
		},
		{
			modifier: 1000,
			post_fix: 'K',
		},
		{
			modifier: 1000000,
			post_fix: 'M',
		},
		{
			modifier: 1000000000,
			post_fix: 'B',
		},
		{
			modifier: 1000000000000,
			post_fix: 'T',
		},
		{
			modifier: 1000000000000000,
			post_fix: 'Qa',
		},
		{
			modifier: 1000000000000000000,
			post_fix: 'Qu',
		},
		{
			modifier: 1000000000000000000000,
			post_fix: 'S',
		},
	];

	for (let i = 0; i < post_fix_arr.length; i++) {
		const post_fix = post_fix_arr[i];

		const new_value = value / post_fix.modifier;
		if (Math.abs(new_value) <= max_val) {
			return `${new_value.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})} ${post_fix.post_fix}`;
		}
	}

	return `TOO LARGE`;
};
