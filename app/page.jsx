import Image from "next/image";
import Game from "../components/game";
export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Game />
    </div>
  );
}
