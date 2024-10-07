import React from 'react';
import { Carousel } from 'primereact/carousel';
import GenericButton from '@/components/buttons/GenericButton';
import Image from "next/image";
import NostrIcon from "../../../../public/images/nostr.png";

const MessageCarousel = ({ copyToClipboard }) => {
    const messageTemplate = ({title, description, showGithub, showX, showNostr, showYoutube, showDonate, showFeedback}) => (
        <div className="flex flex-col justify-between bg-gray-800 p-3 rounded-lg shadow-lg min-h-[182px]">
            <p className="text-[#f8f8ff] text-[18px] font-semibold">{title}</p>
            <p className="text-[#f8f8ff]">{description}</p>
            <div className="flex flex-wrap gap-4 justify-center mt-2">
                {showGithub && (
                    <i
                        className="pi pi-github text-gray-300 cursor-pointer text-xl hover:opacity-80"
                        onClick={() => window.open('https://github.com/austinkelsay/plebdevs', '_blank')}
                        title="Github"
                    />
                )}
                {showX && (
                    <i
                        className="pi pi-twitter text-blue-400 rounded-full cursor-pointer text-xl hover:opacity-80"
                        onClick={() => window.open('https://x.com/pleb_devs', '_blank')}
                        title="X"
                    />
                )}
                {showNostr && (
                    <Image
                        src={NostrIcon}
                        alt="Nostr"
                        width={22}
                        height={22}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => window.open('https://nostr.com/plebdevs@plebdevs.com', '_blank')}
                        title="Nostr"
                    />
                )}
                {showYoutube && (
                    <i
                        className="pi pi-youtube text-red-500 cursor-pointer text-[22px] hover:opacity-80"
                        onClick={() => window.open('https://www.youtube.com/@plebdevs', '_blank')}
                        title="Youtube"
                    />
                )}
                {showDonate && (
                    <i
                        className="pi pi-bolt text-yellow-400 cursor-pointer text-xl hover:opacity-80"
                        onClick={() => copyToClipboard("austin@bitcoinpleb.dev")}
                        title="Donate"
                    />
                )}
                {showFeedback && (
                    <GenericButton
                        label="Feedback"
                        size="small"
                        className="py-2"
                        outlined
                        onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSd8PDBQ8PksBzO8zsMA-Gy6tdZtKWk10Ixa0EXgeTBOyjohpA/viewform?usp=sf_link', '_blank')}
                    />
                )}
            </div>
        </div>
    );

    const messages = [
        {
            title: "PlebDevs 🤝👨‍💻🤝👩‍💻🤝🧑‍💻🤝",
            description: "Plebdevs is open source software and is still in early development. If you have any questions drop an issue on the Github repo, or reach out to me in the Community tab, cheers! - Austin",
            showGithub: true,
            showX: true,
            showNostr: true,
            showYoutube: true,
            showDonate: true,
            showFeedback: false,
        },
        {
            title: "More content coming soon 📺",
            description: "We are super excited to be working on more content in the coming months including a new PlebDevs Starter course for beginners and more tutorials! Keep an eye out!",
            showGithub: true,
            showX: true,
            showNostr: true,
            showYoutube: true,
            showDonate: true,
            showFeedback: false,
        },
        {
            title: "Welcome to the PlebDevs Platform testing phase! 👋",
            description: "During this testing phase all prices will be reduced by 10x but all purchases, subscriptions, and progress will be reset on launch. Thank you!",
            showGithub: false,
            showX: false,
            showNostr: false,
            showDonate: false,
            showFeedback: true,
        },
    ];

    return (
        <Carousel autoplayInterval={10000} showNavigators={false} value={messages} numVisible={1} numScroll={1} itemTemplate={messageTemplate} activeIndex={0} />
    );
};

export default MessageCarousel;