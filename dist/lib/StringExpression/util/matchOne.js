export default function matchOne(str, regexp, groupNr) {
    const matches = str.match(regexp);
    if (matches == null)
        return undefined;
    if (typeof groupNr !== "undefined") {
        return matches[groupNr];
    }
    else {
        return matches[0];
    }
}
