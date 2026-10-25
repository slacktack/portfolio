import Image from "next/image";

export const partners: Record<string, { name: string; file?: string }> = {
  mmt: { name: "MakeMyTrip", file: "makemytrip" },
  goibibo: { name: "Goibibo", file: "goibibo" },
  cleartrip: { name: "Cleartrip", file: "cleartrip" },
  ixigo: { name: "Ixigo", file: "ixigo" },
  emt: { name: "EaseMyTrip", file: "easemytrip" },
  agoda: { name: "Agoda", file: "agoda" },
  booking: { name: "Booking.com", file: "booking" },
  expedia: { name: "Expedia", file: "expedia" },
  kayak: { name: "Kayak", file: "kayak" },
  skyscanner: { name: "Skyscanner", file: "skyscanner" },
  tripcom: { name: "Trip.com", file: "tripcom" },
  klook: { name: "Klook", file: "klook" },
  swiggy: { name: "Swiggy", file: "swiggy" },
  zomato: { name: "Zomato", file: "zomato" },
  ownly: { name: "Ownly" },
  toing: { name: "Toing" },
  dominos: { name: "Domino's" },
  kfc: { name: "KFC" },
  mcd: { name: "McDonald's" },
  blinkit: { name: "Blinkit" },
  zepto: { name: "Zepto" },
  instamart: { name: "Instamart" },
  bigbasket: { name: "BigBasket" },
  uber: { name: "Uber", file: "uber" },
  ola: { name: "Ola", file: "ola" },
  rapido: { name: "Rapido", file: "rapido" },
  buyhatke: { name: "Buyhatke", file: "buyhatke" },
};

export const byName: Record<string, string> = {
  swiggy: "swiggy",
  zomato: "zomato",
  ownly: "ownly",
  skyscanner: "skyscanner",
  kayak: "kayak",
  uber: "uber",
  ola: "ola",
  rapido: "rapido",
};

export function PartnerLogo({ id, size = 24 }: { id: string; size?: number }) {
  const partner = partners[id];
  if (!partner) return null;
  if (!partner.file) {
    return (
      <span
        className="logo logo-mono"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        role="img"
        aria-label={partner.name}
      >
        {partner.name[0]}
      </span>
    );
  }
  return (
    <Image
      className="logo"
      src={`/assets/logos/${partner.file}.png`}
      alt={partner.name}
      title={partner.name}
      width={size}
      height={size}
      unoptimized
    />
  );
}

