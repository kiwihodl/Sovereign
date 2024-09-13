import Image from "next/image"
import { useState } from "react"
import { useImageProxy } from "@/hooks/useImageProxy"
import GenericButton from "@/components/buttons/GenericButton"
import { useRouter } from "next/router"
const promotions = [
  {
    id: 1,
    category: "PLEBDEVS",
    title: "Learn how to code, build Bitcoin, Lightning, and Nostr apps, become a developer.",
    description: "PlebDevs is your gateway to mastering Bitcoin, Lightning, and Nostr technologies. Join our community of aspiring developers and start your journey today!",
    icon: "pi pi-code",
    image: "https://media.istockphoto.com/id/537331500/photo/programming-code-abstract-technology-background-of-software-deve.jpg?s=612x612&w=0&k=20&c=jlYes8ZfnCmD0lLn-vKvzQoKXrWaEcVypHnB5MuO-g8=",
  },
  {
    id: 2,
    category: "COURSES",
    title: "Structured Learning Paths for Bitcoin Developers",
    description: "Dive into our comprehensive courses covering Bitcoin protocol, Lightning Network, and Nostr. From basics to advanced topics, we've got you covered.",
    icon: "pi pi-book",
    image: "https://media.istockphoto.com/id/1224500457/photo/programming-code-abstract-technology-background-of-software-developer-and-computer-script.jpg?s=612x612&w=0&k=20&c=nHMypkMTU1HUUW85Zt0Ff7MDbq17n0eVeXaoM9Knt4Q=",
  },
  {
    id: 3,
    category: "WORKSHOPS",
    title: "Hands-on Video Workshops",
    description: "Watch and learn with our interactive video workshops. Get practical experience building real Bitcoin and Lightning applications.",
    icon: "pi pi-video",
    image: "https://newsroom.siliconslopes.com/content/images/2018/10/code.jpg",
  },
  {
    id: 4,
    category: "RESOURCES",
    title: "In-depth Resources and Documentation",
    description: "Access our extensive library of resources, including guides, documentation, and best practices for Bitcoin development.",
    icon: "pi pi-file",
    image: "https://img.freepik.com/free-photo/programming-background-with-person-working-with-codes-computer_23-2150010125.jpg",
  },
  {
    id: 5,
    category: "COMMUNITY",
    title: "Join Our Community",
    description: "Connect with other developers, share your projects, and get support from our community of Bitcoin enthusiasts.",
    icon: "pi pi-users",
    image: "https://pikwizard.com/pw/medium/50238b1cad4ff412fdafc1325efa1c9f.jpg",
  },
  {
    id: 6,
    category: "LIGHTNING / NOSTR",
    title: "Lightning and Nostr integrated",
    description: "This platform is the first of its kind to integrate Lightning Network and Nostr protocols, allowing users to send and receive payments and interact with the Nostr network.",
    icon: "pi pi-bolt",
    image: "https://www.financemagnates.com/wp-content/uploads/2016/05/Bicoin-lightning.jpg",
  },
]

export function InteractivePromotionalCarousel() {
  const [selectedPromotion, setSelectedPromotion] = useState(promotions[0])
  const { returnImageProxy } = useImageProxy();
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row bg-gray-900 text-white m-4 mx-14 rounded-lg h-[620px]">
      <div className="lg:w-2/3 relative">
        <Image
          src={returnImageProxy(selectedPromotion.image)}
          alt={selectedPromotion.title}
          width={800}
          height={600}
          className="object-cover w-full h-full rounded-lg opacity-75" // Added opacity
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent rounded-lg" /> {/* Modified gradient */}
        <div className="absolute bottom-0 left-0 p-6 space-y-2">
          <div className="uppercase text-sm font-bold text-[#f8f8ff]">{selectedPromotion.category}</div> {/* Changed color */}
          <h2 className="text-4xl font-bold leading-tight text-white drop-shadow-lg">
            {selectedPromotion.title}
          </h2>
          <p className="text-lg text-white drop-shadow-md">{selectedPromotion.description}</p>
          <div className="flex flex-row gap-2 mt-4">
            {
              (() => {
                switch (selectedPromotion.category) {
                  case "PLEBDEVS":
                    return (
                      <>
                        <GenericButton onClick={() => router.push('/about')} severity="success" icon={<i className="pi pi-question-circle pr-2 pb-[2px]" />} label="Learn More" className="py-2 font-semibold" size="small" outlined />
                        <GenericButton onClick={() => router.push('/subscribe')} severity="warning" icon={<i className="pi pi-star pr-2 pb-1" />} label="Subscribe" className="py-2 font-semibold" size="small" outlined />
                        <GenericButton onClick={() => router.push('/content?tag=all')} severity="primary" icon={<i className="pi pi-eye pr-2" />} label="View all content" className="py-2 font-semibold" size="small" outlined />
                      </>
                    );
                  case "COURSES":
                    return (
                      <GenericButton onClick={() => router.push('/content?tag=courses')} icon={<i className="pi pi-book pr-2 pb-1" />} label="View All Courses" className="py-2 font-semibold" size="small" outlined />
                    );
                  case "WORKSHOPS":
                    return (
                      <GenericButton onClick={() => router.push('/content?tag=workshops')} icon={<i className="pi pi-video pr-2" />} label="View All Workshops" className="py-2 font-semibold" size="small" outlined />
                    );
                  case "RESOURCES":
                    return (
                      <GenericButton onClick={() => router.push('/content?tag=resources')} icon={<i className="pi pi-file pr-2 pb-1" />} label="View All Resources" className="py-2 font-semibold" size="small" outlined />
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
      </div>
      <div className="lg:w-1/3 p-6 space-y-4"> {/* Reduced space-y */}
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className={`space-y-2 cursor-pointer transition-colors duration-200 ${
              selectedPromotion.id === promo.id ? "bg-gray-800" : "hover:bg-gray-700"
            } p-3 rounded-lg shadow-lg`} // Added shadow and changed hover color
            onClick={() => setSelectedPromotion(promo)}>
            <div className="flex items-center gap-2"> 
              <i className={`${promo.icon} text-2xl text-[#f8f8ff]`}></i> {/* Changed icon color */}
              <div className="text-sm font-bold text-[#f8f8ff]">{promo.category}</div> {/* Changed text style */}
            </div>
            <h4 className="text-white font-semibold">{promo.title}</h4> {/* Changed text style */}
          </div>
        ))}
      </div>
    </div>
  );
}