
'use client';

import Image from "next/image";
import posthog from "posthog-js";

const ExploreBtn = () => {
    const handleExploreClick = () => {
        posthog.capture('explore_events_clicked', {
            button_location: 'hero_section',
        });
    };

    return (
        <button type="button" id={"explore-btn"} className="mt-7 mx-auto" onClick={handleExploreClick}>ExploreBtn

           <a href="#events">
           Explore Events
               <Image src="/icon/arrow-down.svg" alt="arrow-down" width={24} height={24} />
           </a>
        </button>




    )
}
export default ExploreBtn
