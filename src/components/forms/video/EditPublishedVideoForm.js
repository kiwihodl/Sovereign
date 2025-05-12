import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import GenericButton from '@/components/buttons/GenericButton';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { useNDKContext } from '@/context/NDKContext';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { validateEvent } from '@/utils/nostr';
import { useEncryptContent } from '@/hooks/encryption/useEncryptContent';
import MoreInfo from '@/components/MoreInfo';
import 'primeicons/primeicons.css';
import { Tooltip } from 'primereact/tooltip';
import 'primereact/resources/primereact.min.css';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';

const EditPublishedVideoForm = ({ event }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { ndk, addSigner } = useNDKContext();
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState(event.title);
  const [summary, setSummary] = useState(event.summary);
  const [price, setPrice] = useState(event.price);
  const [isPaidResource, setIsPaidResource] = useState(event.price ? true : false);
  const [videoEmbed, setVideoEmbed] = useState(event.content);
  const [coverImage, setCoverImage] = useState(event.image);
  const [additionalLinks, setAdditionalLinks] = useState(event.additionalLinks);
  const [topics, setTopics] = useState(event.topics);

  const { encryptContent } = useEncryptContent();

  useEffect(() => {
    if (session) {
      setUser(session.user);
    }
  }, [session]);

  useEffect(() => {
    console.log('event', event);
  }, [event]);

  const handleVideoEmbedChange = useCallback(value => {
    setVideoEmbed(value || '');
  }, []);

  const addLink = () => {
    setAdditionalLinks([...additionalLinks, '']);
  };

  const removeLink = (e, index) => {
    setAdditionalLinks(additionalLinks.filter((_, i) => i !== index));
  };

  const addTopic = () => {
    setTopics([...topics, '']);
  };

  const removeTopic = (e, index) => {
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

      // Use the custom markdown/HTML content directly as the embed code
      let embedCode = videoEmbed;

      // Encrypt content if it's a paid resource
      if (isPaidResource && price > 0) {
        embedCode = await encryptContent(embedCode);
        if (!embedCode) {
          showToast('error', 'Error', 'Failed to encrypt content');
          return;
        }
      }

      const ndkEvent = new NDKEvent(ndk);
      ndkEvent.kind = event.kind;
      ndkEvent.content = embedCode;
      ndkEvent.created_at = Math.floor(Date.now() / 1000);
      ndkEvent.pubkey = event.pubkey;
      ndkEvent.tags = [
        ['title', title],
        ['summary', summary],
        ['image', coverImage],
        ['t', 'video'],
        ['d', event.d],
      ];

      // Add topics
      topics.forEach(topic => {
        if (topic && topic !== 'video') {
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
          showToast('success', 'Success', 'Video updated successfully');
          router.push(`/details/${updatedResource.data.noteId}`);
        } else {
          showToast('error', 'Error', 'Failed to update video');
        }
      }
    } catch (error) {
      console.error('Error updating video:', error);
      showToast('error', 'Error', 'Failed to update video');
    }
  };

  return (
    <form onSubmit={e => handleSubmit(e)}>
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
        <p className="py-2">Paid Video</p>
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
      <div className="p-inputgroup flex-1 flex-col mt-4">
        <span>Video Embed</span>
        <MarkdownEditor value={videoEmbed} onChange={handleVideoEmbedChange} height={250} />
        <small className="text-gray-400 mt-2">
          You can customize your video embed using markdown or HTML. For example, paste iframe
          embeds from YouTube or Vimeo, or use video tags for direct video files.
        </small>
      </div>
      <div className="p-inputgroup flex-1 mt-4">
        <InputText
          value={coverImage}
          onChange={e => setCoverImage(e.target.value)}
          placeholder="Cover Image URL"
        />
      </div>
      <div className="mt-8 flex-col w-full">
        <div className="flex flex-row items-center pl-1">
          <span className="pl-1 flex items-center">External Links</span>
          <MoreInfo
            className="text-blue-400"
            tooltip="Add any relevant external links that pair with this content (these links are currently not encrypted for 'paid' content)"
            modalTitle="External Links"
            modalBody={
              <div>
                <p>
                  Add any relevant external links that pair with this content (these links are
                  currently not encrypted for &apos;paid&apos; content)
                </p>
              </div>
            }
          />
        </div>
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
      </div>
      <div className="mt-4 flex-col w-full">
        <div className="flex flex-row items-center pl-1">
          <span className="pl-1 flex items-center">Topics</span>
          <MoreInfo
            className="text-blue-400"
            tooltip="Add any relevant topics that pair with this content"
            modalTitle="Topics"
            modalBody={
              <div>
                <p>Add any relevant topics that pair with this content</p>
              </div>
            }
          />
        </div>
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
        <GenericButton type="submit" severity="success" outlined label={'Update'} />
      </div>
    </form>
  );
};

export default EditPublishedVideoForm;
