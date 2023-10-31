import React, { useState } from 'react';
import AIWriter from 'react-aiwriter';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TypeWriter = ({ text, speed }) => {
  const [animate, setAnimate] = useState(true);
  return (
    <div className="markdown-body">
      {animate ? (
        <AIWriter
          delay={speed}
          onEnd={() => {
            setAnimate(false);
          }}
          onFinish={() => {
            setAnimate(false);
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
        </AIWriter>
      ) : (
        <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
      )}
    </div>
  );
};

export default TypeWriter;
