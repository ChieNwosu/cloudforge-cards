import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Play from "@/pages/Play";
import Leaderboard from "@/pages/Leaderboard";
import HowToPlay from "@/pages/HowToPlay";
import LearnHub from "@/pages/LearnHub";
import LearnCards from "@/pages/LearnCards";
import LearnTest from "@/pages/LearnTest";
import LearnMatch from "@/pages/LearnMatch";import Nav from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App min-h-screen bg-[#090A0B] text-white">
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/play" element={<Play />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/learn" element={<LearnHub />} />
          <Route path="/learn/cards" element={<LearnCards />} />
          <Route path="/learn/test" element={<LearnTest />} />
          <Route path="/learn/match" element={<LearnMatch />} />
        </Routes>
        <Toaster theme="dark" position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
