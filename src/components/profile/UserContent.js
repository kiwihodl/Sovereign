import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import MenuTab from "@/components/menutab/MenuTab";
import { useLocalStorageWithEffect } from "@/hooks/useLocalStorage";
import { useImageProxy } from "@/hooks/useImageProxy";
import useResponsiveImageDimensions from "@/hooks/useResponsiveImageDimensions";
import ContentList from "@/components/content/lists/ContentList";

const fakeProducts = [
    {
      id: 'p1',
      name: 'Eco-Friendly Water Bottle',
      image: 'eco-friendly-water-bottle.jpg',
      category: 'Kitchenware',
      rating: 4,
      price: 19.99,
      inventoryStatus: 'INSTOCK'
    },
    {
      id: 'p2',
      name: 'Wireless Bluetooth Headphones',
      image: 'wireless-bluetooth-headphones.jpg',
      category: 'Electronics',
      rating: 5,
      price: 89.99,
      inventoryStatus: 'LOWSTOCK'
    },
    {
      id: 'p3',
      name: 'Organic Cotton T-Shirt',
      image: 'organic-cotton-t-shirt.jpg',
      category: 'Apparel',
      rating: 3,
      price: 29.99,
      inventoryStatus: 'OUTOFSTOCK'
    },
    {
      id: 'p4',
      name: 'Smartwatch Fitness Tracker',
      image: 'smartwatch-fitness-tracker.jpg',
      category: 'Wearables',
      rating: 4,
      price: 49.99,
      inventoryStatus: 'INSTOCK'
    },
    {
      id: 'p5',
      name: 'Sustainable Bamboo Sunglasses',
      image: 'sustainable-bamboo-sunglasses.jpg',
      category: 'Accessories',
      rating: 4,
      price: 34.99,
      inventoryStatus: 'INSTOCK'
    }
  ];

const UserContent = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [content, setContent] = useState([]);

    const [user, setUser] = useLocalStorageWithEffect('user', {});
    const { returnImageProxy } = useImageProxy();
    const { width, height } = useResponsiveImageDimensions();

    const router = useRouter();

    const homeItems = [
        { label: 'Publised', icon: 'pi pi-verified' },
        { label: 'Drafts', icon: 'pi pi-file-edit' },
        { label: 'Resources', icon: 'pi pi-book' },
        { label: 'Workshops', icon: 'pi pi-video' },
        { label: 'Courses', icon: 'pi pi-desktop' }
    ];

    useEffect(() => {
        axios.get(`/api/drafts/all/${user.id}`)
            .then(res => {
                console.log(res.data);
                setContent(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }, [user]);

    return (
        <div className="w-[90vw] mx-auto max-tab:w-[100vw] max-mob:w-[100vw]">
            <div className="border-y-2 border-gray-300 mt-12">
                <h2 className="text-center my-4">Your Content</h2>
            </div>
            <div className="flex flex-row w-full justify-between px-4">
                <MenuTab items={homeItems} activeIndex={activeIndex} onTabChange={setActiveIndex} />
                <Button onClick={() => router.push('/create')} label="Create" severity="success" outlined className="mt-2" />
            </div>
            <div className="w-full mx-auto my-8">
                <ContentList content={content} />
            </div>
        </div>
    )
}

export default UserContent;