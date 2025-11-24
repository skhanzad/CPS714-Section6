import Image from "next/image";

type TopBarProps = {
  userName: string;
};

export default function TopBar({ userName }: TopBarProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl md:text-3xl font-semibold text-black">
        Welcome back, <span className="text-blue-600">{userName}</span>
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Image
            src="/images/tmu.jpg" // do we need a image for the user profile?
            width={40}
            height={40}
            alt="Profile"
            className="rounded-full object-cover"
          />
          <div className="leading-tight text-sm"> 
            <div className="font-medium text-black">{userName}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
