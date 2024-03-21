import React, { useState } from "react";
import MenuTab from "@/components/menutab/MenuTab";
import ResourceForm from "@/components/forms/ResourceForm";
import WorkshopForm from "@/components/forms/WorkshopForm";
import CourseForm from "@/components/forms/CourseForm";

const Create = () => {
    const [activeIndex, setActiveIndex] = useState(0); // State to track the active tab index
    const homeItems = [
        { label: 'Course', icon: 'pi pi-desktop' },
        { label: 'Workshop', icon: 'pi pi-video' },
        { label: 'Resource', icon: 'pi pi-book' },
    ];

    // Function to render the correct form based on the active tab
    const renderForm = () => {
        switch (homeItems[activeIndex].label) {
            case 'Course':
                return <CourseForm />;
            case 'Workshop':
                return <WorkshopForm />;
            case 'Resource':
                return <ResourceForm />;
            default:
                return null; // or a default component
        }
    };

    return (
        <div className="w-fit mx-auto my-8 flex flex-col justify-center">
            <h2 className="text-center mb-8">Create a {homeItems[activeIndex].label}</h2>
            <MenuTab items={homeItems} activeIndex={activeIndex} onTabChange={setActiveIndex} />
            {renderForm()}
        </div>
    );
};

export default Create;
