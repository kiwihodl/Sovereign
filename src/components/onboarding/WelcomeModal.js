import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/router';

const WelcomeModal = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query.active === 'starter') {
      setVisible(true);
    }
  }, [router.query]);

  const onHide = () => {
    setVisible(false);
    // Update just the 'active' query parameter to '0' while preserving the path
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, active: '0' },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Modal
      header="Welcome to PlebDevs!"
      visible={visible}
      width="90vw"
      style={{ maxWidth: '600px' }}
      onHide={onHide}
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-primary">Start Your Dev Journey</h2>
        <p className="text-gray-400">Welcome to the FREE Starter Course!</p>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-start">
          <i className="pi pi-user text-2xl text-primary mr-2 text-blue-400"></i>
          <div>
            <h3 className="text-lg font-semibold">Your Account</h3>
            <p>
              An anonymous account has been created for you and you can access it in the top right
              corner.
            </p>
            <p className="mt-2">On your profile page you will find:</p>
            <ul className="list-disc list-inside ml-2 mt-2">
              <li>Full dev journey roadmap</li>
              <li>Progress tracker</li>
              <li>Achievement badges</li>
              <li>And more!</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start">
          <i className="pi pi-book text-2xl text-primary mr-2 text-green-400"></i>
          <div>
            <h3 className="text-lg font-semibold">Starter Course</h3>
            <p>This course will cover:</p>
            <ul className="list-disc list-inside ml-2 mt-2">
              <li>PlebDevs approach to learning how to code</li>
              <li>Development tools setup</li>
              <li>Foundation for the full Dev Journey</li>
              <li>Learn basic HTML, CSS, and JavaScript</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="font-bold text-lg">Let&apos;s start your coding journey! 🚀</p>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
