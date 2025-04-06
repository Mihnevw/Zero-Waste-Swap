import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Listing } from '../types/listing';

interface SearchOptions {
  keys: string[];
  threshold: number;
  includeScore: boolean;
}

const defaultOptions: SearchOptions = {
  keys: ['title', 'description', 'category'],
  threshold: 0.3,
  includeScore: true,
};

export const useSearch = (listings: Listing[], options: Partial<SearchOptions> = {}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(listings, {
      ...defaultOptions,
      ...options,
    });
  }, [listings, options]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return listings;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, listings]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
  };
}; 