import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Tooltip } from 'primereact/tooltip';
import useWindowWidth from '@/hooks/useWindowWidth';

const MoreInfo = ({ tooltip, modalTitle, modalBody, className = '', tooltipPosition = 'right' }) => {
    const [visible, setVisible] = useState(false);
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    return (
        <>
            <i
                className={`pi pi-question-circle cursor-pointer ${className}`}
                onClick={() => setVisible(true)}
                data-pr-tooltip={tooltip}
                data-pr-position={tooltipPosition}
            />
            {!isMobile && <Tooltip target=".pi-question-circle" position={tooltipPosition} />}
            
            <Dialog
                header={modalTitle}
                visible={visible}
                onHide={() => setVisible(false)}
                className="max-w-3xl"
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            >
                {typeof modalBody === 'string' ? (
                    <p className="text-gray-200">{modalBody}</p>
                ) : (
                    modalBody
                )}
            </Dialog>
        </>
    );
};

export default MoreInfo;
