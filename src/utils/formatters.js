export const money = (n) =>
  "$" + Number(n).toLocaleString("es-CO", { maximumFractionDigits: 0 });

export const fechaLarga = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const f = new Date(y, m - 1, d);
  return f.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export const uid = () => Math.floor(Math.random() * 1e9);

export const DIAS = [
  { key: "lun", label: "Lunes" },
  { key: "mar", label: "Martes" },
  { key: "mie", label: "Miércoles" },
  { key: "jue", label: "Jueves" },
  { key: "vie", label: "Viernes" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];
