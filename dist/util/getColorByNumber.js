export default function getColorByNumber(idx) {
    return typeof idx !== "undefined" ?
        `hsl(${(30 * (idx % 12) + 15 * (Math.floor(idx / 12) % 2)) % 360}, 82%, 56%)` :
        "#000";
}
