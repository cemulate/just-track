export function timePeriod(msDiff, useText = false) {
    let minutes = Math.floor(msDiff / 1000 / 60);
    let elapsedHours = Math.floor(minutes / 60);
    let remainingMinutes = minutes % 60;
    if (useText) return `${ elapsedHours } hours  ${ remainingMinutes } minutes`;
    return `${ (elapsedHours < 10 ? '0' : '') + elapsedHours }:${ (remainingMinutes < 10 ? '0' : '') + remainingMinutes }`;
}

export function percent(num, places = 0) {
    let p = (num * 100).toFixed(places);
    return `${ p }%`;
}
