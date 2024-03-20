import React from "react";
import MenuTab from "@/components/menutab/MenuTab";
import ResourceForm from "@/components/forms/ResourceForm";

const Create = () => {
    const homeItems = [
        { label: 'Course', icon: 'pi pi-desktop' },
        { label: 'Workshop', icon: 'pi pi-cog' },
        { label: 'Resource', icon: 'pi pi-book' },
      ];
    return (
        <div className="w-fit mx-auto mt-8 flex flex-col justify-center">
            <h1 className="text-center mb-8">Create</h1>
            <MenuTab items={homeItems} />
            <ResourceForm />
        </div>
    )
}

export default Create;