import Image from "next/image";

const CLIENT_LOGO_CLASS = "max-h-[60px] max-w-[200px] object-contain";

export function ParadigmaLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/images/img-logo-v1_300x78.png"
      alt="Paradigma"
      width={300}
      height={78}
      priority
      className={`h-[45px] w-auto object-contain ${className}`}
    />
  );
}

export function ClientLogo({
  src,
  alt = "Logo do cliente",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`${CLIENT_LOGO_CLASS} ${className}`} />
  );
}

export { CLIENT_LOGO_CLASS };
