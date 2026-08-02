import DOMPurify from 'dompurify';

export const sanitize = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br', 'p', 'span', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
};
