
'use client';

 import Image from "next/image";

const ExploreBtn = () => {
    return (
        <button type="button" id={"explore-btn"} className="mt-7 mx-auto" onClick={() => console.log ('CLICK') }>ExploreBtn

           <a href="#events">
           Explore Events
               <Image src="/icon/arrow-down.svg" alt="arrow-down" width={24} height={24} />
           </a>
        </button>




    )
}
export default ExploreBtn
