export const colors = [
  "blue",
  "gold",
  "red",
  "green",
  "orange",
  "yellow",
  "violet",
  "grey",
  "black",
];

const iconFolder =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/";
const shadowUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";

export const getIcon = (color) => {
  return new L.Icon({
    iconUrl: `${iconFolder}marker-icon-2x-${color}.png`,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};
