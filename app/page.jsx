import Image from "next/image";
import Game from "../components/game";
import dynamic from "next/dynamic";

const GameComponent = dynamic(() => import("../components/game"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <GameComponent />
    </div>
  );
}
