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
import { Tooltip } from 'primereact/tooltip';
import 'primeicons/primeicons.css';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';

const DocumentForm = () => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [isPaidResource, setIsPaidResource] = useState(false);
  const [price, setPrice] = useState(0);
  const [coverImage, setCoverImage] = useState('');
  const [topics, setTopics] = useState(['']);
  const [content, setContent] = useState('');
  const [user, setUser] = useState(null);
  const [additionalLinks, setAdditionalLinks] = useState(['']);

  const { data: session } = useSession();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setUser(session.user);
    }
  }, [session]);

  const handleContentChange = useCallback(value => {
    setContent(value || '');
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const userResponse = await axios.get(`/api/users/${user.pubkey}`);
      if (!userResponse.data) {
        showToast('error', 'Error', 'User not found', 'Please try again.');
        return;
      }

      const payload = {
        title,
        summary,
        type: 'document',
        price: isPaidResource ? price : null,
        content,
        image: coverImage,
        topics: [...new Set([...topics.map(topic => topic.trim().toLowerCase()), 'document'])],
        additionalLinks: additionalLinks.filter(link => link.trim() !== ''),
        user: userResponse.data.id,
      };

      const response = await axios.post('/api/drafts', payload);

      if (response.status === 201) {
        showToast('success', 'Success', 'Document saved as draft.');
        if (response.data?.id) {
          router.push(`/draft/${response.data.id}`);
        }
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Error', 'Failed to save document. Please try again.');
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
        <InputTextarea
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
        <InputSwitch
          autoResize
          checked={isPaidResource}
          onChange={e => setIsPaidResource(e.value)}
        />
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
        <Tooltip target=".pi-info-circle" />
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
        <GenericButton type="submit" severity="success" outlined label="Save Draft" />
      </div>
    </form>
  );
};

export default DocumentForm;
