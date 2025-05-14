import React, { useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from 'primereact/button';
import useWindowWidth from '@/hooks/useWindowWidth';

const CalendlyEmbed = ({ visible, onHide, userId, userEmail, userName }) => {
  const windowWidth = useWindowWidth();
  useEffect(() => {
    if (visible) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [visible]);

  const dialogFooter = (
    <div>
      <Button label="Close" icon="pi pi-times" onClick={onHide} className="p-button-text" />
    </div>
  );

  return (
    <Modal
      header="Schedule a Meeting"
      visible={visible}
      width={windowWidth < 768 ? '100vw' : '50vw'}
      footer={dialogFooter}
      onHide={onHide}
    >
      <div
        className="calendly-inline-widget"
        data-url={`https://calendly.com/plebdevs/30min?hide_event_type_details=1&hide_gdpr_banner=1&email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(userName)}&custom_data=${encodeURIComponent(JSON.stringify({ user_id: userId }))}`}
        style={{ minWidth: '320px', height: '700px' }}
      />
    </Modal>
  );
};

export default CalendlyEmbed;
