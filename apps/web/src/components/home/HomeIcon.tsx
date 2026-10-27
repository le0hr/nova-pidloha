import Image from "next/image";

export default function HomeIcon({ name, size = 18 }: { name: string; size?: number }) {
  return <Image src={`/images/home/${name}.svg`} alt="" width={size} height={size} className="shrink-0" aria-hidden="true" />;
}
