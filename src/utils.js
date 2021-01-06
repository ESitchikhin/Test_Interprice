export function calculateLength(header, remainingLength, countWithoutLength) {
	let length = 0;
	if(Object.prototype.hasOwnProperty.call(header, 'subItems')) {
		length = header.subItems.reduce((summ, subItem) => {
			if(Object.prototype.hasOwnProperty.call(subItem, 'length')) {
				return summ + subItem.length;
			}
			return summ + remainingLength / countWithoutLength;
		}, 0);
		
	} else {
		if(Object.prototype.hasOwnProperty.call(header, 'length')) {
			length = header.length;
		} else {
			length = remainingLength / countWithoutLength;
		}
	}
	return length;
}

export function calculateSubItemLength(subItem, all, remainingLength, countWithoutLength) {
	let base = 12;
	
	if(Object.prototype.hasOwnProperty.call(subItem, 'length')) {
		return base * subItem.length / all;
	}
	
	return  base * (remainingLength / countWithoutLength) / all;
}

export function getSubItemValue(item, subHeaderValue) {
	let keys = subHeaderValue.split('.');
	if(Object.prototype.hasOwnProperty.call(item, keys[0])
		&& Object.prototype.hasOwnProperty.call(item[keys[0]], keys[1])) {
		return item[keys[0]][keys[1]];
	}
	return '';
}
