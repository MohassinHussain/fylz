import { useState } from 'react'
import LandingPage from './Components/LandingPage'

import ReactGA from 'react-ga4';



function App() {
  ReactGA.initialize('G-87ZGNNRER7');
  return (
    <div>
      <LandingPage />
    </div>
  )
}
// ReactDOM.render(<App />, document.getElementById('root'));
export default App
