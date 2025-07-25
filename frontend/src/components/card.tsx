import Link from "next/link";

export default function Card({
  title,
  description,
  href,
  type
}: {
  title: string;
  description: string;
  href: string;
  type: 'category' | 'document';
}) {
  return (
    <div className="card pt-4 mt-6 overflow-hidden bg-secondary shadow-md hover:shadow-xl transition-shadow duration-300 border-l-accent border-l-4">
      <p className="card-title px-4 text-3xl">{title}</p>
      <p className="card-description px-4 text-foreground/70">{description}</p>
      <Link
        href={href}
        className="card-link bg-accent m-0! pb-2 px-4 text-white! hover:bg-accent/80 cursor-pointer">Check</Link>
    </div>
  );
}