import Bullets from './Bullets';
import React from 'react';
import ViewMoreLess from '../../../components/commons/ViewMoreLess';

const listOne = [
  'Wants to know “what” what this will do for me',
  'Wants to save time',
  'Values results',
  'Loves being in control, in charge, doing it his way',
  'Fears giving up control.',
  'Often extroverted but do not show emotions',
];

const listTwo = [
  'Focus on the task; Talk about expected results',
  'Be businesslike and factual',
  'Provide concise, precise, and organized information',
  'Discuss and answer “what” questions',
  'Argue facts, not feelings',
  'Don’t waste time; Don’t argue details',
  'Provide options.',
];
const TheDriver = () => {
  return (
    <div className="text-left">
      <p>
        The Driver is a high achiever – a mover and shaker who is definitely not
        averse to risk. The individual is extroverted,strong-willed, direct,
        practical, organized, forceful, and decisive. Look for someone who tells
        it the way it is and is very persuasive. Watch out or you’ll be worn
        down and bowled over. A driver is task- rather than
        relationship-oriented and wants immediate results.
      </p>
      <p className="mb-2">
        This individual is not concerned with how something is done, but what is
        being done, and what results can be expected. “What” is his or her
        battle cry. “What’s going on? What’s being done about it? What you
        should do is …!”
      </p>
      <ViewMoreLess>
        <>
          <p>
            The Driver can be stubborn, domineering, impatient, insensitive, and
            short- tempered,with little time for formalities or niceties. He or
            she can also be demanding, opinionated, controlling, and
            uncompromising – or even overbearing, cold, and harsh.
          </p>
          <p>
            The Driver’s pleasure is power, control, and respect. His or her
            pain is loss of respect, lack of results, and the feeling that he or
            she is being taken advantage of.
          </p>
          <Bullets list={listOne} />
          <p>When communicating with a Driver:</p>
          <Bullets list={listTwo} />
          <p className="font-weight-semi-bold mb-0">
            Portrait of a Driver’s office
          </p>
          <p>
            Of course, it must be the corner office with two windows, but the
            Driver never looks at the view. Pictures on the wall are of
            battlefields, maps, and boats. The Driver is a multi-tasked person
            and can sign letters, hold interviews, and talk on the phone
            simultaneously. Office furniture contributes to the impression of
            power and control and is the most expensive and incredible
            available.
          </p>
          <p>
            The office may also contain flowers and plants, even exotic ones
            like orchids (carefully chose to contribute to the impression of
            power), but the Driver never looks after them. There’s an assistant
            to do that. On the desk are often family portraits, but never candid
            shots. They are formal portraits showing everyone in his or her
            proper role, frozen forever as the Driver sees them.
          </p>
          <p className="mb-2">
            The office will probably be decorated by an interior designer to
            create the feeling of power, and the colors of the office will be
            strong power colors. Curt and tough, straight to business. That’s
            the Driver at work in his or her den. Don’t waste time. Get straight
            to the point!
          </p>
        </>
      </ViewMoreLess>
    </div>
  );
};
export default TheDriver;
