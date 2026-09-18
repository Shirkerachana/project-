import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface DynamicField {
  id: string;
  label: string;
  value: string;
  type?: 'text' | 'email' | 'textarea';
  required?: boolean;
  removable?: boolean;
}

interface DynamicFieldsEditorProps {
  fields: DynamicField[];
  onChange: (fields: DynamicField[]) => void;
  addLabel?: string;
}

export const DynamicFieldsEditor: React.FC<DynamicFieldsEditorProps> = ({
  fields,
  onChange,
  addLabel = 'Add Field'
}) => {
  const [newLabel, setNewLabel] = useState('');

  const updateField = (id: string, patch: Partial<DynamicField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const handleAddField = () => {
    const label = newLabel.trim() || `Custom Field ${fields.length + 1}`;
    onChange([
      ...fields,
      {
        id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label,
        value: '',
        type: 'text',
        removable: true
      }
    ]);
    setNewLabel('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                className="flex-1 bg-transparent text-xs font-semibold text-slate-300 focus:outline-none focus:text-white"
                aria-label="Field label"
              />
              {field.removable !== false && (
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                  title="Remove field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {field.type === 'textarea' ? (
              <textarea
                rows={3}
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                required={field.required}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                required={field.required}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddField();
            }
          }}
          placeholder="New field name (e.g. Notice Period)"
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <button
          type="button"
          onClick={handleAddField}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{addLabel}</span>
        </button>
      </div>
    </div>
  );
};
