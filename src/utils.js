export const isFunction = value => typeof value === 'function';
export const isObject = value => typeof value === 'object';
export const isEmpty = obj => {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}