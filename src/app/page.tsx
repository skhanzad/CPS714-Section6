import Image from "next/image";
import Link from "next/link";
import ProductCard from "./components/RewardItem";
import RedeemedList from "./components/RewardItem";
import AddToRedeemedList from "./components/AddToRedeemedList";
import RewardItem from "./components/RewardItem";

export default function Home() {
  return (
    <main>
      <h1>Hello World</h1>
      <Link href="/users">Users</Link>  
      <RewardItem/>
    </main>
  );
}
