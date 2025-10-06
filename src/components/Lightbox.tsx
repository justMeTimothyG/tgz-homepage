'use client';

import React, {
  Children,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LightboxProps {
  children: ReactNode;
  className?: string;
  /** Optional caption to render below the enlarged image. Falls back to the image title if omitted. */
  caption?: ReactNode;
}

type ImageLikeProps = {
  src?: unknown;
  alt?: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
  onClick?: (event: ReactMouseEvent<unknown>) => void;
  onKeyDown?: (event: ReactKeyboardEvent<unknown>) => void;
  role?: string;
  tabIndex?: number;
};

function resolveImageSource(input: unknown): string | undefined {
  if (!input) return undefined;
  if (typeof input === 'string') return input;
  if (typeof input === 'object' && 'src' in (input as Record<string, unknown>)) {
    const srcValue = (input as { src?: unknown }).src;
    if (typeof srcValue === 'string') {
      return srcValue;
    }
  }
  return undefined;
}

function isImageElement(node: ReactElement): boolean {
  if (!node) return false;

  if (typeof node.type === 'string') {
    return node.type === 'img';
  }

  // Next/Image or other custom image-like components expose a src prop
  return 'src' in (node.props as Record<string, unknown>);
}

function findFirstImage(node: ReactNode): ReactElement<ImageLikeProps> | null {
  if (!node) return null;

  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findFirstImage(child);
      if (found) return found;
    }
    return null;
  }

  if (!React.isValidElement(node)) {
    return null;
  }

  if (isImageElement(node)) {
    return node as ReactElement<ImageLikeProps>;
  }

  const childArray = Children.toArray((node.props as { children?: ReactNode }).children);
  for (const child of childArray) {
    const found = findFirstImage(child);
    if (found) return found;
  }

  return null;
}

function replaceImageNode(
  source: ReactNode,
  target: ReactElement<ImageLikeProps>,
  replacement: ReactNode,
): ReactNode {
  if (source === target) {
    return replacement;
  }

  if (!React.isValidElement(source)) {
    if (Array.isArray(source)) {
      return source.map((child) => replaceImageNode(child, target, replacement));
    }
    return source;
  }

  const childArray = Children.toArray((source.props as { children?: ReactNode }).children);
  if (childArray.length === 0) {
    return source;
  }

  let didReplace = false;
  const nextChildren = childArray.map((child) => {
    const updated = replaceImageNode(child, target, replacement);
    if (updated !== child) {
      didReplace = true;
    }
    return updated;
  });

  if (!didReplace) {
    return source;
  }

  const normalizedChildren = nextChildren.length === 1 ? nextChildren[0] : nextChildren;
  return React.cloneElement(source, undefined, normalizedChildren);
}

export default function Lightbox({ children, className, caption }: LightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imageElement = useMemo(() => findFirstImage(children), [children]);

  const imageProps = useMemo(
    () => (imageElement?.props ?? {}) as ImageLikeProps,
    [imageElement],
  );

  const imageSrc = useMemo(() => resolveImageSource(imageProps?.src), [imageProps?.src]);
  const imageAlt = typeof imageProps?.alt === 'string' ? imageProps.alt : '';
  const imageTitle = typeof imageProps?.title === 'string' ? imageProps.title : undefined;
  const imageOnClick = imageProps?.onClick;
  const imageOnKeyDown = imageProps?.onKeyDown;
  const imageRole = imageProps?.role;
  const imageTabIndex = imageProps?.tabIndex;
  const imageClassName = imageProps?.className;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleOpen = useCallback(
    (event: ReactMouseEvent<unknown>) => {
      imageOnClick?.(event);
      if (event.defaultPrevented) return;
      if (!imageSrc) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[Lightbox] Could not resolve an image source for the lightbox.');
        }
        return;
      }
      setIsOpen(true);
    },
    [imageOnClick, imageSrc],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<unknown>) => {
      imageOnKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!imageSrc) return;
        setIsOpen(true);
      }
    },
    [imageOnKeyDown, imageSrc],
  );

  const close = useCallback(() => setIsOpen(false), []);

  const interactiveImage = useMemo(() => {
    if (!imageElement) return null;

    const typedImageElement = imageElement as ReactElement<ImageLikeProps>;

    return (
      <span className={cn('relative inline-block group', className)}>
        {React.cloneElement(typedImageElement, {
          onClick: handleOpen,
          onKeyDown: handleKeyDown,
          role: imageRole ?? 'button',
          tabIndex: imageTabIndex ?? 0,
          className: cn(
            'cursor-zoom-in transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            imageClassName,
          ),
        } as Partial<ImageLikeProps>)}

        <span className="pointer-events-none absolute inset-0 rounded-lg bg-black/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex h-full items-center justify-center">
            <ZoomIn className="h-8 w-8 text-white drop-shadow" />
          </span>
        </span>
      </span>
    );
  }, [className, handleKeyDown, handleOpen, imageClassName, imageElement, imageRole, imageTabIndex]);

  const enhancedContent = useMemo(() => {
    if (!imageElement || !interactiveImage) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Lightbox] Could not locate an image element within its children.');
      }
      return children;
    }

    return replaceImageNode(children, imageElement, interactiveImage);
  }, [children, imageElement, interactiveImage]);

  const lightboxContent = useMemo(() => {
    if (!mounted || !isOpen || !imageSrc) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[1200] flex flex-col bg-black/90 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={imageAlt || imageTitle || 'Enlarged image'}
        onClick={close}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-6 top-6 rounded-full border border-white/30 bg-black/60 p-2 text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Schließen"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center justify-center p-6" onClick={(event) => event.stopPropagation()}>
          {imageSrc ? (
            <figure className="flex max-h-full max-w-full flex-col items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- Lightbox overlay needs a plain img for arbitrary sources and sizing. */}
              <img
                src={imageSrc}
                alt={imageAlt}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              />
              {caption ?? imageTitle ? (
                <figcaption className="text-sm text-gray-200">
                  {caption ?? imageTitle}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </div>
      </div>,
      document.body,
    );
  }, [caption, close, imageAlt, imageSrc, imageTitle, isOpen, mounted]);

  return (
    <>
      {enhancedContent}
      {lightboxContent}
    </>
  );
}
