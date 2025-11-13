import Image from "next/image";

type TopBarProps = {
  userName: string;
};

export default function TopBar({ userName }: TopBarProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl md:text-3xl font-semibold">
        Welcome back, <span className="text-blue-600">{userName}</span>
      </h1>

      <div className="flex items-center gap-4">
        {/* <div className="flex items-center bg-white rounded-full shadow px-4 py-2 w-64 md:w-80">
          <input
            type="text"
            placeholder="Search events..."
            className="flex-1 text-sm outline-none"
          />
          <span className="text-blue-500 text-lg">🔍</span>
        </div> 
        do we need a search bar?
        */}

        <div className="flex items-center gap-2">
          <Image
            src="/images/tmu.jpg" // do we need a image for the user profile?
            width={40}
            height={40}
            alt="Profile"
            className="rounded-full object-cover"
          />
          <div className="leading-tight text-sm"> 
            <div className="font-medium">{userName}</div>
            <div className="text-gray-500">My Account</div> 
            { /* should be a button to show account , not sure if it links to another team or do we do this? */ }
          </div>
        </div>
      </div>
    </header>
  );
}
