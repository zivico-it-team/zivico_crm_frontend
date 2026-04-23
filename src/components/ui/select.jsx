import React, { useState, useRef, useEffect } from 'react';

export function Select({ children, value, onValueChange, ...props }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onValueChange(value);
    setOpen(false);
  };

  return (
    <div className="relative" ref={selectRef} {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { open, onOpenChange: setOpen, value, onSelect: handleSelect })
      )}
    </div>
  );
}

export function SelectTrigger({ children, open, onOpenChange, className = '', ...props }) {
  return (
    <div
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => onOpenChange(!open)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder, value, children }) {
  return (
    <span className="text-gray-900">
      {value ? children : placeholder}
    </span>
  );
}

export function SelectContent({ children, open, className = '', ...props }) {
  if (!open) return null;

  return (
    <div
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in fade-in-80 ${className}`}
      style={{ top: '100%', left: 0, right: 0, marginTop: '4px' }}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectItem({ children, value, onSelect, className = '', ...props }) {
  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${className}`}
      onClick={() => onSelect(value)}
      {...props}
    >
      {children}
    </div>
  );
}