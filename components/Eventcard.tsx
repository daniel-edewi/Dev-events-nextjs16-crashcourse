'use client';

import Link from 'next/link';
import Image from 'next/image';
import posthog from 'posthog-js';

interface EventProps {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

const Eventcard = ({ title, image, slug, location, date, time }: EventProps) => {
    const handleEventCardClick = () => {
        posthog.capture('event_card_clicked', {
            event_title: title,
            event_slug: slug,
            event_location: location,
            event_date: date,
            event_time: time,
        });
    };

    return (
        <Link href={`/events/${slug}`} id="events-card" onClick={handleEventCardClick}>
            <Image src={image} alt={title} width={410} height={300} className="poster" />
            <p className="title">{title}</p>

            <div className="flex flex-row gap-2">
                <image src=" icons/pin.svg" alt="location" width={14} height={14}  />
                <p>{location}</p>
            </div>
            <div className="datetime">
                <div>
                    <image src=" icons/calendar.svg" alt="date" width={14} height={14}  />
                    <p>{date}</p>
                </div>

                <div>
                    <image src=" icons/clock.svg" alt="time" width={14} height={14}  />
                    <p>{time}</p>
                </div>


            </div>
        </Link>
    );
};

export default Eventcard;
