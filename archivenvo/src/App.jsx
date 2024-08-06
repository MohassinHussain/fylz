import { useState } from 'react'
import LandingPage from './Components/LandingPage'
import ReactGA from "react-ga"

const TRACKING_ID = "G-0MDZFDLWGF"
ReactGA.initialize(TRACKING_ID)

function App() {

  return (
    <div>
      <LandingPage />
    </div>
  )
}
// ReactDOM.render(<App />, document.getElementById('root'));
export default App
