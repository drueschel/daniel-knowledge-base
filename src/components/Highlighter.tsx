'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Highlighter() {
  const searchParams = useSearchParams();
  const query = searchParams.get('highlight');

  useEffect(() => {
    if (!query) return;

    // Small delay to ensure ReactMarkdown has finished rendering the DOM
    const timeoutId = setTimeout(() => {
      const article = document.querySelector('article.markdown');
      if (!article) return;
      
      // Cleanup previous highlights if any
      const marks = article.querySelectorAll('mark.search-highlight');
      marks.forEach(m => {
        const parent = m.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(m.textContent || ''), m);
          parent.normalize();
        }
      });

      const walk = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null);
      let node;
      const textNodes = [];

      while ((node = walk.nextNode())) {
        textNodes.push(node);
      }
      
      const lowerQuery = query.toLowerCase();
      let firstMatch: HTMLElement | null = null;

      textNodes.forEach(node => {
        const text = node.nodeValue;
        if (!text) return;
        
        const lowerText = text.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);
        
        if (index !== -1 && node.parentNode && node.parentNode.nodeName !== 'MARK' && node.parentNode.nodeName !== 'SCRIPT' && node.parentNode.nodeName !== 'STYLE') {
          const matchText = text.substring(index, index + query.length);
          const before = text.substring(0, index);
          const after = text.substring(index + query.length);
          
          const mark = document.createElement('mark');
          mark.className = 'search-highlight';
          mark.style.backgroundColor = 'rgba(253, 224, 71, 0.7)'; // yellow-300 with opacity
          mark.style.borderBottom = '2px solid #f59e0b'; // amber-500
          mark.style.color = 'inherit';
          mark.style.padding = '0 2px';
          mark.style.borderRadius = '3px';
          mark.textContent = matchText;
          
          const beforeNode = document.createTextNode(before);
          const afterNode = document.createTextNode(after);
          
          const parent = node.parentNode;
          parent.insertBefore(beforeNode, node);
          parent.insertBefore(mark, node);
          parent.insertBefore(afterNode, node);
          parent.removeChild(node);
          
          if (!firstMatch) firstMatch = mark;
        }
      });

      if (firstMatch) {
        (firstMatch as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100); // 100ms delay to wait for markdown render

    return () => clearTimeout(timeoutId);
  }, [query]);

  return null;
}
