'use client';

import { useState, memo } from 'react';
import { Search, Filter, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'numberRange';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
}

interface AdvancedFilterProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  presets?: FilterPreset[];
  onSavePreset?: (name: string, filters: Record<string, any>) => void;
  onDeletePreset?: (id: string) => void;
}

export function AdvancedFilter({
  filters,
  values,
  onChange,
  presets = [],
  onSavePreset,
  onDeletePreset,
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  const activeFiltersCount = Object.values(values).filter(
    (v) => v !== '' && v !== null && v !== undefined
  ).length;

  const handleFilterChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const handleClearFilter = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
  };

  const handleClearAll = () => {
    onChange({});
  };

  const handleSavePreset = () => {
    if (presetName && onSavePreset) {
      onSavePreset(presetName, values);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    onChange(preset.filters);
  };

  const renderFilterInput = (filter: FilterOption) => {
    const value = values[filter.key] || '';

    switch (filter.type) {
      case 'text':
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text-muted" />
            <input
              type="text"
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        );

      case 'dateRange':
        return (
          <div className="flex gap-2">
            <input
              type="date"
              value={value?.from || ''}
              onChange={(e) =>
                handleFilterChange(filter.key, {
                  ...value,
                  from: e.target.value,
                })
              }
              placeholder="From"
              className="flex-1 px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <input
              type="date"
              value={value?.to || ''}
              onChange={(e) =>
                handleFilterChange(filter.key, {
                  ...value,
                  to: e.target.value,
                })
              }
              placeholder="To"
              className="flex-1 px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        );

      case 'numberRange':
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={value?.min || ''}
              onChange={(e) =>
                handleFilterChange(filter.key, {
                  ...value,
                  min: e.target.value,
                })
              }
              placeholder="Min"
              className="flex-1 px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <input
              type="number"
              value={value?.max || ''}
              onChange={(e) =>
                handleFilterChange(filter.key, {
                  ...value,
                  max: e.target.value,
                })
              }
              placeholder="Max"
              className="flex-1 px-4 py-2 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="primary" size="sm" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </Button>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(values).map(([key, value]) => {
              if (!value || value === '') return null;
              const filter = filters.find((f) => f.key === key);
              if (!filter) return null;

              return (
                <Badge
                  key={key}
                  variant="primary"
                  className="flex items-center gap-1"
                >
                  <span className="text-xs">
                    {filter.label}: {typeof value === 'object' ? JSON.stringify(value) : value}
                  </span>
                  <button
                    onClick={() => handleClearFilter(key)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full md:w-[600px] bg-dark-bg-secondary rounded-xl shadow-dark-large border border-dark-border-default p-4 z-50">
          <div className="space-y-4">
            {/* Presets */}
            {presets.length > 0 && (
              <div className="pb-4 border-b border-dark-border-default">
                <p className="text-sm font-medium text-dark-text-secondary mb-2">
                  Saved Presets
                </p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadPreset(preset)}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Badge
                        variant="info"
                        className="cursor-pointer hover:bg-blue-500/30"
                      >
                        {preset.name}
                        {onDeletePreset && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePreset(preset.id);
                            }}
                            className="ml-1 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-border-default">
              <div className="flex gap-2">
                {onSavePreset && (
                  <>
                    {!showSavePreset ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSavePreset(true)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Preset
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          placeholder="Preset name"
                          className="px-3 py-1.5 bg-dark-bg-tertiary border border-dark-border-default rounded-lg text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSavePreset();
                          }}
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSavePreset}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowSavePreset(false);
                            setPresetName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

