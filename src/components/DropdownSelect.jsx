import React, { useEffect, useId, useRef, useState } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

export default function DropdownSelect({ id, ariaLabel, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listboxId = useId();
  const selectedOption = options.find(option => String(option.value) === String(value));

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnOutsidePointer(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isOpen]);

  function handleKeyDown(event) {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }

  function selectOption(optionValue) {
    onChange(optionValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative mt-2 w-full"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-2xl border border-[#dfe7d5] bg-white px-3 py-3 text-left text-darkgreen focus:outline-none focus:ring-2 focus:ring-green-300"
        onClick={() => setIsOpen(open => !open)}
      >
        <span>{selectedOption?.label || 'Choose an option'}</span>
        <FiChevronDown className={`ml-3 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-60 overflow-y-auto rounded-xl border border-[#dfe7d5] bg-white p-1 shadow-lg"
        >
          {options.map(option => {
            const isSelected = String(option.value) === String(value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-darkgreen hover:bg-green-50 focus:bg-green-50 focus:outline-none ${isSelected ? 'bg-green-50 font-medium' : ''}`}
                onClick={() => selectOption(option.value)}
              >
                <span>{option.label}</span>
                {isSelected && <FiCheck aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}