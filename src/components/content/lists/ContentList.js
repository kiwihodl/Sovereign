import React from "react";
import { DataView } from 'primereact/dataview';
import ContentListItem from "@/components/content/lists/ContentListItem";

const ContentList = ({content}) => {
    const listTemplate = (items) => {
        if (!items || items.length === 0) return null;

        let list = items.map((item, index) => {
            return ContentListItem(item);
        });

        return <div className="grid grid-nogutter">{list}</div>;
    };

    return (
        <DataView 
            value={content} 
            listTemplate={listTemplate} 
        />
    )
}

export default ContentList;