import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import GenericButton from '@/components/buttons/GenericButton';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { useNDKContext } from '@/context/NDKContext';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import { useEncryptContent } from '@/hooks/encryption/useEncryptContent';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';

const EmbeddedDocumentForm = ({ draft = null, isPublished = false, onSave, isPaid }) => {
  const [title, setTitle] = useState(draft?.title || '');
  const [summary, setSummary] = useState(draft?.summary || '');
  const [isPaidResource, setIsPaidResource] = useState(isPaid);
  const [price, setPrice] = useState(draft?.price || 0);
  const [coverImage, setCoverImage] = useState(draft?.image || '');
  const [topics, setTopics] = useState(draft?.topics || ['']);
  const [content, setContent] = useState(draft?.content || '');
  const [user, setUser] = useState(null);
  const [additionalLinks, setAdditionalLinks] = useState(draft?.additionalLinks || ['']);
  const { encryptContent, isLoading: encryptLoading, error: encryptError } = useEncryptContent();
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const { ndk, addSigner } = useNDKContext();

  useEffect(() => {
    if (session) {
      setUser(session.user);
    }
  }, [session]);

  const handleContentChange = useCallback(value => {
    setContent(value || '');
  }, []);

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setSummary(draft.summary);
      setIsPaidResource(draft.price ? true : false);
      setPrice(draft.price || 0);
      setContent(draft.content);
      setCoverImage(draft.image);
      setTopics(draft.topics || []);
      setAdditionalLinks(draft.additionalLinks || []);
    }
  }, [draft]);

  const buildEvent = async draft => {
    const dTag = draft.d;
    const event = new NDKEvent(ndk);
    let encryptedContent;

    if (draft?.price) {
      encryptedContent = await encryptContent(draft.content);
    }

    event.kind = draft?.price ? 30402 : 30023; // Determine kind based on if price is present
    event.content = draft?.price ? encryptedContent : draft.content;
    event.created_at = Math.floor(Date.now() / 1000);
    event.pubkey = user.pubkey;
    event.tags = [
      ['d', dTag],
      ['title', draft.title],
      ['summary', draft.summary],
      ['image', draft.image],
      ...draft.topics.map(topic => ['t', topic]),
      ['published_at', Math.floor(Date.now() / 1000).toString()],
      ...(draft?.price
        ? [
            ['price', draft.price.toString()],
            ['location', `https://plebdevs.com/details/${draft.id}`],
          ]
        : []),
    ];

    return event;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const payload = {
      title,
      summary,
      type: 'document',
      price: isPaidResource ? price : null,
      content,
      image: coverImage,
      topics: [...new Set([...topics.map(topic => topic.trim().toLowerCase()), 'document'])],
      additionalLinks: additionalLinks.filter(link => link.trim() !== ''),
      user: user?.id || user?.pubkey,
    };

    if (onSave) {
      try {
        await onSave(payload);
        showToast(
          'success',
          'Success',
          draft ? 'Document updated successfully.' : 'Document created successfully.'
        );
      } catch (error) {
        console.error(error);
        showToast('error', 'Error', 'Failed to save document. Please try again.');
      }
    }
  };

  const handleTopicChange = (index, value) => {
    const updatedTopics = topics.map((topic, i) => (i === index ? value : topic));
    setTopics(updatedTopics);
  };

  const addTopic = e => {
    e.preventDefault();
    setTopics([...topics, '']); // Add an empty string to the topics array
  };

  const removeTopic = (e, index) => {
    e.preventDefault();
    const updatedTopics = topics.filter((_, i) => i !== index);
    setTopics(updatedTopics);
  };

  const handleAdditionalLinkChange = (index, value) => {
    const updatedAdditionalLinks = additionalLinks.map((link, i) => (i === index ? value : link));
    setAdditionalLinks(updatedAdditionalLinks);
  };

  const addAdditionalLink = e => {
    e.preventDefault();
    setAdditionalLinks([...additionalLinks, '']); // Add an empty string to the additionalLinks array
  };

  const removeAdditionalLink = (e, index) => {
    e.preventDefault();
    const updatedAdditionalLinks = additionalLinks.filter((_, i) => i !== index);
    setAdditionalLinks(updatedAdditionalLinks);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-inputgroup flex-1">
        <InputText value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      </div>
      <div className="p-inputgroup flex-1 mt-4">
        <InputText
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Summary"
        />
      </div>
      <div className="p-inputgroup flex-1 mt-4">
        <InputText
          value={coverImage}
          onChange={e => setCoverImage(e.target.value)}
          placeholder="Cover Image URL"
        />
      </div>

      <div className="p-inputgroup flex-1 mt-8 flex-col">
        <p className="py-2">Paid Document</p>
        <InputSwitch checked={isPaidResource} onChange={e => setIsPaidResource(e.value)} />
        {isPaidResource && (
          <div className="p-inputgroup flex-1 py-4">
            <InputNumber
              value={price}
              onValueChange={e => setPrice(e.value)}
              placeholder="Price (sats)"
            />
          </div>
        )}
      </div>
      <div className="p-inputgroup flex-1 flex-col mt-4">
        <span>Content</span>
        <MarkdownEditor value={content} onChange={handleContentChange} height={350} />
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
              onChange={e => handleAdditionalLinkChange(index, e.target.value)}
              placeholder="https://plebdevs.com"
              className="w-full mt-2"
            />
            {index > 0 && (
              <GenericButton
                icon="pi pi-times"
                className="p-button-danger mt-2"
                onClick={e => removeAdditionalLink(e, index)}
              />
            )}
          </div>
        ))}
        <div className="w-full flex flex-row items-end justify-end py-2">
          <GenericButton icon="pi pi-plus" onClick={addAdditionalLink} />
        </div>
      </div>
      <div className="mt-8 flex-col w-full">
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
        <GenericButton
          type="submit"
          severity="success"
          outlined
          label={draft ? 'Update' : 'Submit'}
        />
      </div>
    </form>
  );
};

export default EmbeddedDocumentForm;
