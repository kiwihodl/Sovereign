import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import { useNDKContext } from '@/context/NDKContext';
import { useEncryptContent } from '@/hooks/encryption/useEncryptContent';
import GenericButton from '@/components/buttons/GenericButton';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { validateEvent } from '@/utils/nostr';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import dynamic from 'next/dynamic';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const EditPublishedDocumentForm = ({ event }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { ndk, addSigner } = useNDKContext();
  const { encryptContent } = useEncryptContent();
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState(event.title);
  const [summary, setSummary] = useState(event.summary);
  const [price, setPrice] = useState(event.price);
  const [isPaidResource, setIsPaidResource] = useState(event.price ? true : false);
  const [content, setContent] = useState(event.content);
  const [coverImage, setCoverImage] = useState(event.image);
  const [additionalLinks, setAdditionalLinks] = useState(event.additionalLinks);
  const [topics, setTopics] = useState(event.topics);

  useEffect(() => {
    if (session) {
      setUser(session.user);
    }
  }, [session]);

  const handleContentChange = useCallback(value => {
    setContent(value || '');
  }, []);

  const addLink = e => {
    e.preventDefault();
    setAdditionalLinks([...additionalLinks, '']);
  };

  const removeLink = (e, index) => {
    e.preventDefault();
    setAdditionalLinks(additionalLinks.filter((_, i) => i !== index));
  };

  const addTopic = e => {
    e.preventDefault();
    setTopics([...topics, '']);
  };

  const removeTopic = (e, index) => {
    e.preventDefault();
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...additionalLinks];
    newLinks[index] = value;
    setAdditionalLinks(newLinks);
  };

  const handleTopicChange = (index, value) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (!ndk.signer) {
        await addSigner();
      }

      // Encrypt content if it's a paid resource
      let finalContent = content;
      if (isPaidResource && price > 0) {
        try {
          finalContent = await encryptContent(content);
          if (!finalContent) {
            showToast('error', 'Error', 'Failed to encrypt content');
            return;
          }
        } catch (error) {
          console.error('Encryption error:', error);
          showToast('error', 'Error', 'Failed to encrypt content: ' + error.message);
          return;
        }
      }

      const ndkEvent = new NDKEvent(ndk);
      ndkEvent.kind = event.kind;
      ndkEvent.content = finalContent;
      ndkEvent.created_at = Math.floor(Date.now() / 1000);
      ndkEvent.pubkey = event.pubkey;
      ndkEvent.tags = [
        ['title', title],
        ['summary', summary],
        ['image', coverImage],
        ['t', 'document'],
        ['d', event.d],
      ];

      // Add topics
      topics.forEach(topic => {
        if (topic && topic !== 'document') {
          ndkEvent.tags.push(['t', topic]);
        }
      });

      // Add additional links
      additionalLinks.forEach(link => {
        if (link) {
          ndkEvent.tags.push(['r', link]);
        }
      });

      // Add price if it exists
      if (price) {
        ndkEvent.tags.push(['price', price.toString()]);
      }

      // Validate the event
      const validationResult = validateEvent(ndkEvent);
      if (validationResult !== true) {
        console.log('validationResult', validationResult);
        showToast('error', 'Error', validationResult);
        return;
      }

      // Publish the event
      const signedEvent = await ndk.publish(ndkEvent);

      if (signedEvent) {
        // update updated_at for resource in db
        const updatedResource = await axios.put(`/api/resources/${event.d}`, {
          updatedAt: new Date().toISOString(),
        });

        if (updatedResource && updatedResource.status === 200) {
          showToast('success', 'Success', 'Document updated successfully');
          router.push(`/details/${updatedResource.data.noteId}`);
        } else {
          showToast('error', 'Error', 'Failed to update document');
        }
      }
    } catch (error) {
      console.error('Error updating document:', error);
      showToast('error', 'Error', 'Failed to update document');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-inputgroup flex-1">
        <InputText value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      </div>
      <div className="p-inputgroup flex-1 mt-4">
        <InputTextarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Summary"
          rows={5}
          cols={30}
        />
      </div>

      <div className="p-inputgroup flex-1 mt-4 flex-col">
        <p className="py-2">Paid Document</p>
        <InputSwitch checked={isPaidResource} onChange={e => setIsPaidResource(e.value)} />
        {isPaidResource && (
          <div className="p-inputgroup flex-1 py-4">
            <i className="pi pi-bolt p-inputgroup-addon text-2xl text-yellow-500"></i>
            <InputNumber
              value={price}
              onValueChange={e => setPrice(e.value)}
              placeholder="Price (sats)"
            />
          </div>
        )}
      </div>
      <div className="p-inputgroup flex-1 mt-4">
        <InputText
          value={coverImage}
          onChange={e => setCoverImage(e.target.value)}
          placeholder="Cover Image URL"
        />
      </div>
      <div className="p-inputgroup flex-1 flex-col mt-4">
        <span>Content</span>
        <div data-color-mode="dark">
          <MDEditor value={content} onChange={handleContentChange} height={350} />
        </div>
      </div>
      <div className="mt-8 flex-col w-full">
        <span className="pl-1 flex items-center">
          External Links
          <i
            className="pi pi-info-circle ml-2 cursor-pointer"
            data-pr-tooltip="Add any relevant external links that pair with this content (these links are currently not encrypted for 'paid' content)"
            data-pr-position="right"
            data-pr-at="right+5 top"
            data-pr-my="left center-2"
            style={{ fontSize: '1rem', color: 'var(--primary-color)' }}
          />
        </span>
        {additionalLinks.map((link, index) => (
          <div className="p-inputgroup flex-1" key={index}>
            <InputText
              value={link}
              onChange={e => handleLinkChange(index, e.target.value)}
              placeholder="https://example.com"
              className="w-full mt-2"
            />
            {index > 0 && (
              <GenericButton
                icon="pi pi-times"
                className="p-button-danger mt-2"
                onClick={e => removeLink(e, index)}
              />
            )}
          </div>
        ))}
        <div className="w-full flex flex-row items-end justify-end py-2">
          <GenericButton icon="pi pi-plus" onClick={addLink} />
        </div>
        <Tooltip target=".pi-info-circle" />
      </div>
      <div className="mt-4 flex-col w-full">
        {topics.map((topic, index) => (
          <div className="p-inputgroup flex-1" key={index}>
            <InputText
              value={topic}
              onChange={e => handleTopicChange(index, e.target.value)}
              placeholder="Topic"
              className="w-full mt-2"
            />
            {index > 0 && (
              <GenericButton
                icon="pi pi-times"
                className="p-button-danger mt-2"
                onClick={e => removeTopic(e, index)}
              />
            )}
          </div>
        ))}
        <div className="w-full flex flex-row items-end justify-end py-2">
          <GenericButton icon="pi pi-plus" onClick={addTopic} />
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <GenericButton type="submit" severity="success" outlined label="Update" />
      </div>
    </form>
  );
};

export default EditPublishedDocumentForm;
