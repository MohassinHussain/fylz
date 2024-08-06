import React from 'react'
import { BiSolidSkipPreviousCircle } from "react-icons/bi";


export default function Previous(props) {
    // const [preClicked, setPreClicked] = useState(true);
    function previousClicked() {
      // setPreClicked(true);
      props.setUploadClicked(false);
      props.setReceiveClicked(false);
      props.setShowCode(false);
      props.setAlerter("");

      // props.setUploadTextClicked(false)
    }
  return (
    <div>
      <BiSolidSkipPreviousCircle
            className="text-cyan-100 w-8 h-8 ml-64 md:ml-96"
            onClick={previousClicked}
          />
    </div>
  )
}
