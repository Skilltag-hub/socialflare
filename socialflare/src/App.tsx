import React from "react";
import Lanyard from "../components/Lanyard"

const App = () => {
  return (
    <div>
    <div className="h-screen w-screen bg-black">
      <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
    </div>
    </div>
  );
};

export default App;