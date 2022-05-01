export default function getColorByNumber(idx: number | undefined) {
  return typeof idx !== "undefined" && idx >= 0 ?
    `hsl(${(30*(idx%12) + 15*(Math.floor(idx/12)%2))%360}, 82%, 56%)` :
    "#444";
}
