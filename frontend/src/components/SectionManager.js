import React, { useState, useEffect } from 'react';

const SectionManager = () => {
  const [sectionIds, setSectionIds] = useState([{ id: '', label: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections');
      const data = await response.json();
      const formattedSections = Object.entries(data.sections).map(([label, id]) => ({
        id: id.toString(),
        label
      }));
      setSectionIds(formattedSections.length ? formattedSections : [{ id: '', label: '' }]);
      setLoading(false);
    } catch (error) {
      setError('Failed to load sections');
      setLoading(false);
    }
  };

  const addSection = () => {
    setSectionIds([...sectionIds, { id: '', label: '' }]);
    setError('');
  };

  const removeSection = (index) => {
    if (sectionIds.length > 1) {
      const newSections = sectionIds.filter((_, i) => i !== index);
      setSectionIds(newSections);
      setError('');
    }
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sectionIds];
    newSections[index][field] = value;
    setSectionIds(newSections);
    setError('');
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    const hasEmptyFields = sectionIds.some(section => !section.id || !section.label);
    if (hasEmptyFields) {
      setError('Please fill in all fields before saving');
      return;
    }

    try {
      const sectionsObj = sectionIds.reduce((acc, section) => {
        acc[section.label] = parseInt(section.id);
        return acc;
      }, {});

      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections: sectionsObj }),
      });

      if (!response.ok) throw new Error('Failed to save sections');
      
      setError('');
      setSavedSuccess(true);
      await fetchSections();
    } catch (error) {
      setError('Failed to save sections');
      setSavedSuccess(false);
    }
  };

  const getEndpoints = () => {
    return sectionIds.map(section => ({
      label: section.label,
      endpoint: `/api/recent/${section.label.toLowerCase()}?count=5`
    }));
  };

  if (loading) {
    return <div className="text-center">Loading sections...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Manage Section IDs</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {savedSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Sections saved successfully
        </div>
      )}
      
      <div className="space-y-4">
        {sectionIds.map((section, index) => (
          <div key={index} className="flex gap-4 items-center">
            <div className="flex-1 space-y-2">
              <input
                type="number"
                placeholder="Section ID"
                value={section.id}
                onChange={(e) => updateSection(index, 'id', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                placeholder="Section Label"
                value={section.label}
                onChange={(e) => updateSection(index, 'label', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={() => removeSection(index)}
              disabled={sectionIds.length === 1}
              className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={addSection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Section
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Changes
        </button>
      </div>

      {savedSuccess && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Available Endpoints</h3>
          <div className="space-y-2 bg-gray-50 p-4 rounded">
            {getEndpoints().map((endpoint, index) => (
              <div key={index} className="font-mono text-sm">
                <span className="font-semibold">{endpoint.label}:</span> {endpoint.endpoint}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionManager;