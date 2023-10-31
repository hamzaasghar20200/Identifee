import Bullets from './Bullets';
import React from 'react';
import ViewMoreLess from '../../../components/commons/ViewMoreLess';

const listOne = [
  'Wants to know “who” who else is involved',
  'Values appreciation, applause a pat on the back',
  'Loves social situations and parties',
  'Likes to inspire others',
  'Fear being rejected.',
];

const listTwo = [
  'Focus on developing a relationship',
  'Try to show how your ideas will improve his or her image',
  'Be enthusiastic, open, and responsive',
  'Relate to the need to share information, stories, and experience',
  'Be forthcoming and willing to talk',
  'Ask and answer “who” questions',
  'Remember to be warm and approachable at all times',
  'Work to minimize his or her direct involvement with details or personal conflicts.',
];
const TheExpressive = () => {
  return (
    <div className="text-left">
      <p>
        The Expressive, a verbally adept personality, is engaging,
        accommodating, supportive of others, persuasive, socially adept, and
        relationship- rather than task-oriented. He or she loves to be one of
        the gang, and is always ready for something new and exciting, especially
        if the gang is ready to participate. Additional strengths include
        enthusiasm, diplomatic skills, and the ability to inspire others.
      </p>
      <p className="mb-2">
        Weaknesses involve impatience, a tendency to generalize, verbal
        assaults, and sometimes irrational behavior. The Expressive can also be
        egotistical, manipulative, undisciplined, reactive, unorganized, and
        abrasive.
      </p>
      <ViewMoreLess>
        <>
          <p>
            The Expressive readily exchanges information and life experiences.
            His or her main need is to be appreciated and accepted. The
            Expressive’s pleasure is recognition and approval. His or her pain
            is isolation and lack of attention.
          </p>
          <Bullets list={listOne} />
          <p>When communicating with an Expressive:</p>
          <Bullets list={listTwo} />
          <p className="font-weight-semi-bold mb-0">
            Portrait of an Expressive’s office
          </p>
          <p className="mb-2">
            In short, it’s a mess. The Expressive loves favorite sayings and has
            them plastered on the wall or sitting on the desk. Files are never
            in a filing cabinet. Rather, they’re piled all over the office in
            stacks. But don’t be misled. The Expressive knows exactly where
            everything is and can find virtually anything by its location.
            Office colors will probably be loud and lively. If there are flowers
            or plants, they’re likely dead – either talked to death or lacking
            water. The Expressive’s greatest reward is personal acknowledgment
            from others, and examples of this will be displayed. The Expressive
            is an excitable dreamer, with lots of ideas and projects, but
            without the time to follow them up.
          </p>
        </>
      </ViewMoreLess>
    </div>
  );
};

export default TheExpressive;
