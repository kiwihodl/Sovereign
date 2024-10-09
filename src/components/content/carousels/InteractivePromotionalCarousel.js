import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useImageProxy } from "@/hooks/useImageProxy"
import GenericButton from "@/components/buttons/GenericButton"
import { useRouter } from "next/router"
import useWindowWidth from "@/hooks/useWindowWidth"
import { useToast } from "@/hooks/useToast";
import MessageCarousel from '@/components/content/carousels/MessagesCarousel';

// With current spacing the title can only be 1 line
const promotions = [
  {
    id: 1,
    category: "PLEBDEVS",
    title: "Content and Community platform",
    description: "A one of a kind Nostr / Lightning integrated Content and Community platform.",
    icon: "pi pi-code",
    video: "https://plebdevs-bucket.nyc3.cdn.digitaloceanspaces.com/plebdevs-montage.mp4",
  },
  {
    id: 2,
    category: "CONTENT",
    title: "Comprehensive Learning Resources",
    description: "Access the PlebDevs library of courses, videos, and documents.",
    icon: "pi pi-book",
    image: "https://media.istockphoto.com/id/1224500457/photo/programming-code-abstract-technology-background-of-software-developer-and-computer-script.jpg?s=612x612&w=0&k=20&c=nHMypkMTU1HUUW85Zt0Ff7MDbq17n0eVeXaoM9Knt4Q=",
  },
  {
    id: 3,
    category: "COMMUNITY",
    title: "Join Our Community of learners / hackers",
    description: "Learn and connect with other developers, share your projects, and level up together.",
    icon: "pi pi-users",
    image: "https://pikwizard.com/pw/medium/50238b1cad4ff412fdafc1325efa1c9f.jpg",
  },
  {
    id: 4,
    category: "LIGHTNING / NOSTR",
    title: "Lightning and Nostr integrated platform",
    description: "All content is published to and pulled from nostr relays and is fully interoperable with comments, zaps, and other nostr clients. Premium content is available for sale with lightning or by subscribing to plebdevs via a lightning subscription.",
    icon: "pi pi-bolt",
    image: "https://www.financemagnates.com/wp-content/uploads/2016/05/Bicoin-lightning.jpg",
  },
]

const yellowFocusOutlineStyle = "focus:shadow-[0_0_0_2px_rgba(255,255,255,1),0_0_0_4px_rgba(252,211,77,1),0_1px_2px_0_rgba(0,0,0,1)] dark:focus:shadow-[0_0_0_2px_rgba(28,33,39,1),0_0_0_4px_rgba(252,211,77,0.7),0_1px_2px_0_rgba(0,0,0,0)]"

const InteractivePromotionalCarousel = () => {
  const [selectedPromotion, setSelectedPromotion] = useState(promotions[0])
  const { returnImageProxy } = useImageProxy();
  const { showToast } = useToast();
  const windowWidth = useWindowWidth();
  const isTabView = windowWidth <= 1360;
  const isMobile = windowWidth <= 768;
  const router = useRouter();
  const videoRef = useRef(null);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("success", "Copied", "Copied Lightning Address to clipboard");
      if (window && window?.webln && window?.webln?.lnurl) {
        await window.webln.enable();
        const result = await window.webln.lnurl("austin@bitcoinpleb.dev");
        if (result && result?.preimage) {
          showToast("success", "Payment Sent", "Thank you for your donation!");
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    if (videoRef.current && selectedPromotion.video) {
      videoRef.current.play();
    }
  }, [selectedPromotion]);

  return (
    <div className={`flex ${isTabView ? 'flex-col' : 'flex-row'} bg-gray-900 text-white m-4 mx-14 rounded-lg ${isTabView ? 'h-auto' : 'h-[620px]'} ${isTabView ? 'w-full mx-0 ml-0 mt-0' : null}`}>
      <div className={isTabView ? 'w-full' : 'lg:w-2/3 relative'}>
        {selectedPromotion.video ? (
          <video
            ref={videoRef}
            src={selectedPromotion.video}
            className={`object-cover w-full ${isTabView ? 'h-[300px]' : 'h-full'} rounded-lg rounded-tr-none rounded-br-none`}
            loop
            muted
            playsInline
          />
        ) : (
          <Image
            src={returnImageProxy(selectedPromotion.image)}
            alt={selectedPromotion.title}
            width={800}
            height={600}
            className={`object-cover w-full ${isTabView ? 'h-[300px]' : 'h-full'} rounded-lg opacity-75 rounded-tr-none rounded-br-none`}
          />
        )}
        {isTabView ? (
          <div className="p-6 space-y-2">
            <div className="uppercase text-sm font-bold text-[#f8f8ff]">{selectedPromotion.category}</div>
            <h2 className="text-4xl font-bold leading-tight text-white drop-shadow-lg">
              {selectedPromotion.title}
            </h2>
            <p className="text-lg text-white drop-shadow-md">{selectedPromotion.description}</p>
            <div className={`flex flex-row gap-2 mt-4 ${isTabView ? 'flex-col' : ''}`}>
              {
                (() => {
                  switch (selectedPromotion.category) {
                    case "PLEBDEVS":
                      return (
                        <div className="flex flex-row gap-2">
                          <GenericButton onClick={() => router.push('/subscribe')} severity="warning" icon={<i className="pi pi-star pr-2 pb-1" />} label="Subscribe" className="w-fit py-2 font-semibold" size="small" outlined />
                          <GenericButton onClick={() => router.push('/content?tag=all')} severity="primary" icon={<i className="pi pi-eye pr-2" />} label="All content" className="w-fit py-2 font-semibold" size="small" outlined />
                        </div>
                      );
                    case "CONTENT":
                      return (
                        <>
                          <GenericButton onClick={() => router.push('/content?tag=courses')} icon={<i className="pi pi-book pr-2 pb-1" />} label="Courses" className="py-2 font-semibold" size="small" outlined />
                          <GenericButton onClick={() => router.push('/content?tag=videos')} icon={<i className="pi pi-video pr-2" />} label="Videos" className="py-2 font-semibold" size="small" outlined />
                          <GenericButton onClick={() => router.push('/content?tag=documents')} icon={<i className="pi pi-file pr-2 pb-1" />} label="Documents" className="py-2 font-semibold" size="small" outlined />
                        </>
                      );
                    case "COMMUNITY":
                      return (
                        <GenericButton onClick={() => router.push('/feed?channel=global')} icon={<i className="pi pi-users pr-2 pb-1" />} label="Open Community Feed" className="w-fit py-2 font-semibold" size="small" outlined />
                      );
                    case "LIGHTNING / NOSTR":
                      return (
                        <GenericButton onClick={() => router.push('/subscribe')} severity="warning" icon={<i className="pi pi-star pr-2 pb-1" />} label="Subscribe" className="w-fit py-2 font-semibold" size="small" outlined />
                      );
                    default:
                      return null;
                  }
                })()
              }
            </div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 from-black via-black/70 to-transparent rounded-lg" />
            <div className={`bg-gray-800/90 rounded-tr-lg absolute bottom-0 left-0 p-4 space-y-2 ${isTabView ? 'pb-16' : 'max-w-[80%]'}`}>
              <div className="uppercase text-sm font-bold text-[#f8f8ff]">{selectedPromotion.category}</div>
              <h2 className="font-bold leading-tight text-white drop-shadow-lg">
                {selectedPromotion.title}
              </h2>
              <p className="text-lg text-white drop-shadow-md">{selectedPromotion.description}</p>
              <div className="flex flex-row gap-2">
                {
                  (() => {
                    switch (selectedPromotion.category) {
                      case "PLEBDEVS":
                        return (
                          <div className="flex flex-row gap-4 mt-4">
                            <GenericButton onClick={() => router.push('/about')} severity="success" icon={<i className="pi pi-question-circle pr-2 pb-[2px]" />} label="About" className="py-2 font-semibold" size="small" outlined />
                            <GenericButton onClick={() => router.push('/subscribe')} severity="warning" icon={<i className="pi pi-star pr-2 pb-1" />} label="Subscribe" className="py-2 font-semibold" size="small" outlined />
                            <GenericButton onClick={() => router.push('/content?tag=all')} severity="primary" icon={<i className="pi pi-eye pr-2" />} label="All content" className="py-2 font-semibold" size="small" outlined />
                            <GenericButton onClick={() => copyToClipboard()} icon={<i className="pi pi-bolt pr-2" />} label="Donate" className={`py-2 font-semibold text-yellow-300 ${yellowFocusOutlineStyle}`} size="small" outlined />
                          </div>
                        );
                      case "CONTENT":
                        return (
                          <div className="flex flex-row gap-4 mt-4">
                            <GenericButton onClick={() => router.push('/content?tag=courses')} icon={<i className="pi pi-book pr-2 pb-1" />} label="Courses" className="py-2 font-semibold" size="small" outlined />
                            <GenericButton onClick={() => router.push('/content?tag=videos')} icon={<i className="pi pi-video pr-2" />} label="Videos" className="py-2 font-semibold" size="small" outlined />
                            <GenericButton onClick={() => router.push('/content?tag=documents')} icon={<i className="pi pi-file pr-2 pb-1" />} label="Documents" className="py-2 font-semibold" size="small" outlined />
                          </div>
                        );
                      case "COMMUNITY":
                        return (
                          <GenericButton onClick={() => router.push('/feed?channel=global')} icon={<i className="pi pi-users pr-2 pb-1" />} label="Open Community Feed" className="py-2 font-semibold" size="small" outlined />
                        );
                      case "LIGHTNING / NOSTR":
                        return (
                          <GenericButton onClick={() => router.push('/subscribe')} severity="warning" icon={<i className="pi pi-star pr-2 pb-1" />} label="Subscribe" className="py-2 font-semibold" size="small" outlined />
                        );
                      default:
                        return null;
                    }
                  })()
                }
              </div>
            </div>
          </>
        )}
      </div>
      <div className={isTabView ? 'w-full p-4' : 'lg:w-1/3 p-4 space-y-4'}>
        {isTabView ? (
          <div className="flex overflow-x-auto pb-4 space-x-4">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className={`flex-shrink-0 w-64 space-y-4 cursor-pointer transition-colors duration-200 hover:bg-gray-700 ${selectedPromotion.id === promo.id ? "bg-gray-700" : "bg-gray-800"
                  } p-4 rounded-lg shadow-lg`}
                onClick={() => setSelectedPromotion(promo)}>
                <div className="flex items-center gap-2">
                  <i className={`${promo.icon} text-2xl text-[#f8f8ff]`}></i>
                  <div className="text-sm font-bold text-[#f8f8ff]">{promo.category}</div>
                </div>
                <h4 className="text-white font-semibold">{promo.title}</h4>
              </div>
            ))}
          </div>
        ) : (
          promotions.map((promo) => (
            <div
              key={promo.id}
              className={`space-evenly cursor-pointer transition-colors duration-200 hover:bg-gray-700 ${selectedPromotion.id === promo.id ? "bg-gray-700" : "bg-gray-800"
                } p-3 rounded-lg shadow-lg`}
              onClick={() => setSelectedPromotion(promo)}>
              <div className="flex items-center gap-2">
                <i className={`${promo.icon} text-xl text-[#f8f8ff]`}></i>
                <div className="font-semibold text-[#f8f8ff]">{promo.category}</div>
              </div>
              <h4 className="text-white">{promo.title}</h4>
            </div>
          ))
        )}
        <MessageCarousel copyToClipboard={copyToClipboard} />
      </div>
    </div>
  );
}

export default InteractivePromotionalCarousel;