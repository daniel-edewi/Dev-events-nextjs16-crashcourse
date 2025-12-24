export type Eventitem= {

    image: string;
    title: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

export const events = [
    {
        title: "Next.js Conf 2025",
        image: "/images/nextjs-conf.png",
        slug: "nextjs-conf-2025",
        location: "San Francisco, CA",
        date: "October 23, 2025",
        time: "09:00 AM",
    },
    {
        title: "React India 2025",
        image: "/images/react-india.png",
        slug: "react-india-2025",
        location: "Goa, India",
        date: "November 12, 2025",
        time: "10:00 AM",
    },
    {
        title: "Web Summit 2025",
        image: "/images/web-summit.png",
        slug: "web-summit-2025",
        location: "Lisbon, Portugal",
        date: "November 11, 2025",
        time: "08:30 AM",
    },
    {
        title: "JSWorld Conference 2026",
        image: "/images/jsworld.png",
        slug: "jsworld-2026",
        location: "Amsterdam, Netherlands",
        date: "February 10, 2026",
        time: "09:00 AM",
    },
    {
        title: "Devfest Lagos 2025",
        image: "/images/devfest-lagos.png",
        slug: "devfest-lagos-2025",
        location: "Lagos, Nigeria",
        date: "December 20, 2025",
        time: "09:00 AM",
    },
    {
        title: "Chainlink Constellation Hackathon",
        image: "/images/chainlink.png",
        slug: "chainlink-constellation",
        location: "Remote",
        date: "December 15, 2025",
        time: "12:00 PM",
    }
];
