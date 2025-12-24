import Link from 'next/link';
import Image from 'next/image';

interface EventProps {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

const Eventcard = ({ title, image, slug, location, date, time }: EventProps) => {
    return (
        <Link href={`/events/${slug}`} id="events-card">
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
